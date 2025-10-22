import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

interface RequestBody {
  transcript: string;
  language: 'zh' | 'en';
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // 只允许 POST 请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // 检查 API Key
  const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('No API key configured, LLM service unavailable');
    return {
      statusCode: 503,
      body: JSON.stringify({ error: 'LLM service not configured' }),
    };
  }

  try {
    const body: RequestBody = JSON.parse(event.body || '{}');
    const { transcript, language } = body;

    if (!transcript) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing transcript' }),
      };
    }

    // 构建 prompt
    const langName = language === 'zh' ? '中文' : 'English';
    const prompt = `You are an assistive communication AI for people with aphasia.

User said (possibly unclear or incomplete): "${transcript}"
Target language: ${langName}

Your task:
1. Understand the user's intent from their speech
2. Output a clear, complete sentence that expresses their intent
3. Provide both Chinese and English versions

Common intents: drink water, eat food, use toilet, feel pain, feel cold/hot, want rest, go outside, go home, take medicine, need help, etc.

Respond in JSON format:
{
  "intent": "intent_name",
  "sentence_zh": "完整的中文句子",
  "sentence_en": "Complete English sentence",
  "confidence": 0.0-1.0
}

Only output valid JSON, no other text.`;

    // 使用 Groq API（免费且快速）
    const isGroq = !!process.env.GROQ_API_KEY;
    const apiUrl = isGroq 
      ? 'https://api.groq.com/openai/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions';
    
    const model = isGroq ? 'llama-3.1-8b-instant' : 'gpt-3.5-turbo';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant that outputs only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '{}';
    
    // 解析 JSON 响应
    let result;
    try {
      result = JSON.parse(content);
    } catch {
      // 如果解析失败，返回原文
      result = {
        intent: 'unknown',
        sentence_zh: transcript,
        sentence_en: transcript,
        confidence: 0.3,
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('LLM function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

export { handler };

