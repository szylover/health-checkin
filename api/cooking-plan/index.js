module.exports = async function (context, req) {
  const { dishes, soups, people, mode } = req.body || {};
  const peopleCount = parseInt(people) || 2;

  if (!Array.isArray(dishes) || !Array.isArray(soups)) {
    context.res = { status: 400, body: { error: "请提供 dishes 和 soups 数组" } };
    return;
  }

  const apiUrl = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  if (!apiUrl || !apiKey) {
    context.res = { status: 500, body: { error: "AI 服务未配置" } };
    return;
  }

  const prompt = mode === 'tea'
    ? `你是专业调饮师。${peopleCount}人份饮品：${dishes.join('、')}
给出：1.材料清单（用量）2.制作步骤（水温/比例/技巧）3.小贴士
简洁生动，加emoji，HTML格式，控制在500字内。`
    : `你是厨师兼厨房时间管理专家。${peopleCount}人份：菜${dishes.join('、') || '无'} 汤${soups.join('、') || '无'}
给出：1.采购清单（食材用量）2.每道菜烹饪要点（2句话）3.1小时出餐时间线
简洁生动，加emoji，HTML格式，控制在500字内。`;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": apiKey },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "你是热情的烹饪助手，回答简洁实用。" },
          { role: "user", content: prompt },
        ],
        max_tokens: 1000,
        temperature: 0.8,
      }),
    });
    if (!response.ok) {
      const errBody = await response.text();
      context.res = { status: 500, body: { error: "AI 服务调用失败: " + response.status, detail: errBody } };
      return;
    }
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "AI 暂时无法生成建议，请稍后再试。";
    context.res = { status: 200, body: { plan: content } };
  } catch (err) {
    context.log.error("Azure OpenAI error:", err.message);
    context.res = { status: 500, body: { error: "AI 服务调用失败，请检查配置" } };
  }
};
