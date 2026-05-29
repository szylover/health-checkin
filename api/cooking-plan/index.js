module.exports = async function (context, req) {
  const { dishes, soups, people, mode } = req.body || {};
  const peopleCount = parseInt(people) || 2;

  if (!Array.isArray(dishes) || !Array.isArray(soups)) {
    context.res = { status: 400, body: { error: "请提供 dishes 和 soups 数组" } };
    return;
  }

  const allItems = [...dishes, ...soups];
  if (allItems.length === 0) {
    context.res = { status: 400, body: { error: "至少选择一道菜或一道汤" } };
    return;
  }

  const prompt = mode === 'tea'
    ? `你是专业调饮师。${peopleCount}人份饮品：${dishes.join("、")}
给出：1.材料清单（用量）2.制作步骤（水温/比例/技巧）3.小贴士
简洁生动，加emoji，HTML格式，不用markdown，控制在500字内。`
    : `你是厨师兼厨房时间管理专家。${peopleCount}人份：菜${dishes.join("、")||"无"} 汤${soups.join("、")||"无"}
给出：1.采购清单（每道菜食材用量）2.每道菜烹饪要点（2句话）3.1小时出餐时间线（精确到分钟）
简洁生动，加emoji，HTML格式，不用markdown，控制在500字内。`;

  const apiUrl = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;

  if (!apiUrl || !apiKey) {
    context.res = { status: 500, body: { error: "AI 服务未配置" } };
    return;
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": apiKey },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "你是一个热情的中餐烹饪助手，擅长快速出餐策略。回答简洁实用。" },
          { role: "user", content: prompt },
        ],
        max_tokens: 1000,
        temperature: 0.8,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      context.res = { status: 500, body: { error: "AI 服务调用失败: " + response.status, detail: errBody } };
      return;
    }

    // Stream SSE back to client
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop();
            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const data = line.slice(6).trim();
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                const text = parsed.choices?.[0]?.delta?.content;
                if (text) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                }
              } catch {}
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } finally {
          controller.close();
        }
      }
    });

    context.res = {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
      body: readable,
      isRaw: true,
    };
  } catch (err) {
    context.log.error("Azure OpenAI error:", err.message);
    context.res = { status: 500, body: { error: "AI 服务调用失败，请检查配置" } };
  }
};
