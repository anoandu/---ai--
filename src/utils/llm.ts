import { Language, LLMResponse } from '../types';
import { fallbackIntent } from './fallback';

// LLM API 调用（通过 Serverless Function）
export const callLLM = async (
  transcript: string,
  language: Language
): Promise<LLMResponse> => {
  try {
    // 预清洗：去除重复词（简单去重，如“洗澡我 我”→“洗澡 我”）
    const cleaned = transcript
      .replace(/([\u4e00-\u9fa5A-Za-z]+)\s*\1+/g, '$1') // 连续重复词去重
      .replace(/\s+/g, ' ')
      .trim();

    // 尝试调用 Serverless Function
    const response = await fetch('/api/llm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcript: cleaned,
        language,
      }),
    });
    
    if (!response.ok) {
      throw new Error('LLM API call failed');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('LLM API unavailable, using fallback:', error);
    // 降级到本地关键词匹配
    return fallbackIntent(transcript, language);
  }
};

// 构建 LLM Prompt
export const buildLLMPrompt = (transcript: string, language: Language): string => {
  const langName = language === 'zh' ? '中文' : 'English';
  
  return `You are an assistive communication AI for people with aphasia. 

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
};

