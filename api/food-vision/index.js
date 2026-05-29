module.exports = async function (context, req) {
  const { image } = req.body || {};

  if (!image) {
    context.res = { status: 400, body: { error: '请提供图片' } };
    return;
  }

  const apiUrl = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;

  if (!apiUrl || !apiKey) {
    context.res = { status: 500, body: { error: 'AI 服务未配置' } };
    return;
  }

  const prompt = `请分析这张食物图片，识别其中所有食物，估算每种食物的份量和营养成分。

请以JSON数组格式返回，每个元素包含：
- name: 食物名称（中文）
- amount: 份量描述（如"1碗 约200g"）
- grams: 估算克数（数字）
- calories: 热量(kcal)
- protein: 蛋白质(g)
- carbs: 碳水(g)
- fat: 脂肪(g)

只返回JSON数组，不要其他文字。例如：
[{"name":"白米饭","amount":"1碗 约200g","grams":200,"calories":232,"protein":4.8,"carbs":51,"fat":0.4}]`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`,
                  detail: 'low'
                }
              }
            ]
          }
        ],
        max_tokens: 800,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      context.log.error('Vision API error:', response.status, errBody);
      context.res = { status: 500, body: { error: 'AI 识别失败: ' + response.status, detail: errBody } };
      return;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '[]';

    let foods = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      foods = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      context.log.warn('Failed to parse vision response:', content);
      foods = [];
    }

    context.res = { status: 200, body: { foods } };
  } catch (err) {
    context.log.error('Food vision error:', err.message);
    context.res = { status: 500, body: { error: '识别失败: ' + err.message } };
  }
};
