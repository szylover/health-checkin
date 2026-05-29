module.exports = async function (context, req) {
  const { calories, protein, carbs, fat, calorieGoal, proteinGoal, meal } = req.body || {};

  const apiUrl = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;

  if (!apiUrl || !apiKey) {
    context.res = { status: 500, body: { error: 'AI 服务未配置' } };
    return;
  }

  const calGoal = calorieGoal || 2000;
  const proGoal = proteinGoal || 120;
  const calLeft = Math.max(0, calGoal - (calories || 0));
  const proLeft = Math.max(0, proGoal - (protein || 0));

  const mealName = meal === 'breakfast' ? '早餐' : meal === 'lunch' ? '午餐' : meal === 'dinner' ? '晚餐' : '加餐';

  const prompt = `你是一位专业营养师。用户今日饮食情况如下：
- 已摄入热量：${Math.round(calories || 0)} kcal（目标 ${calGoal} kcal，剩余 ${Math.round(calLeft)} kcal）
- 已摄入蛋白质：${Math.round(protein || 0)}g（目标 ${proGoal}g，剩余 ${Math.round(proLeft)}g）
- 已摄入碳水：${Math.round(carbs || 0)}g
- 已摄入脂肪：${Math.round(fat || 0)}g

用户正在规划${mealName}。请给出：
1. 简短评估（1-2句，今日营养状况如何）
2. ${mealName}推荐（3-5个具体食物建议，带大概分量和卡路里）
3. 一个小提示（运动或饮食习惯方面）

用简洁生动的中文回答，适当加emoji。用HTML格式输出，不要用markdown。回答控制在200字以内。`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(Object.assign({
        messages: [
          { role: 'system', content: '你是一位专业友善的营养顾问，擅长帮助用户制定健康饮食计划。' },
          { role: 'user', content: prompt },
        ],
      }, /gpt-3|gpt-35/.test(apiUrl)
        ? { max_tokens: 800, temperature: 0.7 }
        : { max_completion_tokens: 800 }
      )),
    });

    if (!response.ok) {
      const errBody = await response.text();
      context.res = { status: 500, body: { error: 'AI 服务调用失败: ' + response.status } };
      return;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || 'AI 暂时无法生成建议，请稍后再试。';
    context.res = { status: 200, body: { advice: content } };
  } catch (err) {
    context.res = { status: 500, body: { error: 'AI 服务调用失败：' + err.message } };
  }
};
