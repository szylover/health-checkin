const { app } = require('@azure/functions');

// ── cooking-plan (streaming SSE) ────────────────────────────────────────────
app.http('cooking-plan', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    const body = await request.json().catch(() => ({}));
    const { dishes = [], soups = [], people = 2, mode } = body;
    const peopleCount = parseInt(people) || 2;

    if (!Array.isArray(dishes) || !Array.isArray(soups)) {
      return new Response(JSON.stringify({ error: '请提供 dishes 和 soups 数组' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiUrl = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    if (!apiUrl || !apiKey) {
      return new Response(JSON.stringify({ error: 'AI 服务未配置' }), {
        status: 500, headers: { 'Content-Type': 'application/json' },
      });
    }

    const prompt = mode === 'tea'
      ? `你是专业调饮师。${peopleCount}人份饮品：${dishes.join('、')}
给出：1.材料清单（用量）2.制作步骤（水温/比例/技巧）3.小贴士
简洁生动，加emoji，HTML格式，控制在500字内。`
      : `你是厨师兼厨房时间管理专家。${peopleCount}人份：菜${dishes.join('、') || '无'} 汤${soups.join('、') || '无'}
给出：1.采购清单（食材用量）2.每道菜烹饪要点（2句话）3.1小时出餐时间线
简洁生动，加emoji，HTML格式，控制在500字内。`;

    const openaiResp = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: '你是热情的烹饪助手，回答简洁实用。' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1000,
        temperature: 0.8,
        stream: true,
      }),
    });

    if (!openaiResp.ok) {
      const err = await openaiResp.text();
      return new Response(JSON.stringify({ error: 'AI调用失败: ' + openaiResp.status, detail: err }), {
        status: 500, headers: { 'Content-Type': 'application/json' },
      });
    }

    // Proxy OpenAI SSE stream → client SSE stream
    const encoder = new TextEncoder();
    const openaiReader = openaiResp.body.getReader();
    const readable = new ReadableStream({
      async pull(controller) {
        const decoder = new TextDecoder();
        let buffer = '';
        try {
          while (true) {
            const { done, value } = await openaiReader.read();
            if (done) {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
              return;
            }
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';
            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const data = line.slice(6).trim();
              if (data === '[DONE]') {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
                return;
              }
              try {
                const parsed = JSON.parse(data);
                const text = parsed.choices?.[0]?.delta?.content;
                if (text) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                }
              } catch { /* skip malformed chunks */ }
            }
          }
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no',
        'Transfer-Encoding': 'chunked',
      },
    });
  },
});

// ── diet-advice (regular JSON) ───────────────────────────────────────────────
app.http('diet-advice', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    const body = await request.json().catch(() => ({}));
    const { calories, protein, carbs, fat, calorieGoal, proteinGoal, meal } = body;

    const apiUrl = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    if (!apiUrl || !apiKey) {
      return new Response(JSON.stringify({ error: 'AI 服务未配置' }), {
        status: 500, headers: { 'Content-Type': 'application/json' },
      });
    }

    const calGoal = calorieGoal || 2000;
    const proGoal = proteinGoal || 120;
    const calLeft = Math.max(0, calGoal - (calories || 0));
    const proLeft = Math.max(0, proGoal - (protein || 0));
    const mealName = meal === 'breakfast' ? '早餐' : meal === 'lunch' ? '午餐' : meal === 'dinner' ? '晚餐' : '加餐';

    const prompt = `你是专业营养师。今日摄入：热量${Math.round(calories||0)}kcal(剩${Math.round(calLeft)}kcal)，蛋白质${Math.round(protein||0)}g(剩${Math.round(proLeft)}g)，碳水${Math.round(carbs||0)}g，脂肪${Math.round(fat||0)}g。
规划${mealName}：1.简短评估(1句)2.推荐3-5个食物(带分量和卡路里)3.一个小提示
简洁，加emoji，HTML格式，200字以内。`;

    try {
      const resp = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: '你是专业友善的营养顾问。' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 600,
          temperature: 0.7,
        }),
      });
      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content || 'AI 暂时无法生成建议。';
      return new Response(JSON.stringify({ advice: content }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: '调用失败: ' + err.message }), {
        status: 500, headers: { 'Content-Type': 'application/json' },
      });
    }
  },
});
