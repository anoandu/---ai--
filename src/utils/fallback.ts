import { Language, LLMResponse } from '../types';
import { COMMON_NEEDS } from '../constants';

// 本地关键词匹配兜底方案
export const fallbackIntent = (transcript: string, _language: Language): LLMResponse => {
  const lowerText = transcript.toLowerCase();
  
  // 关键词映射
  const keywordMap: Record<string, string[]> = {
    take_shower: ['洗澡', '淋浴', '冲凉', 'bath', 'shower'],
    drink_water: ['水', '喝', 'water', 'drink', 'thirsty'],
    eat_food: ['吃', '饿', '食物', 'eat', 'food', 'hungry', 'meal'],
    use_toilet: ['厕所', '洗手间', '卫生间', 'toilet', 'bathroom', 'restroom'],
    feel_pain: ['疼', '痛', '不舒服', 'pain', 'hurt', 'ache', 'sore'],
    feel_cold: ['冷', 'cold', 'chilly', 'freeze'],
    feel_hot: ['热', 'hot', 'warm', 'sweat'],
    want_rest: ['休息', '睡', '累', 'rest', 'sleep', 'tired', 'nap'],
    go_outside: ['出门', '外面', '散步', 'outside', 'out', 'walk', 'fresh air'],
    go_home: ['回家', 'home', 'house'],
    take_medicine: ['药', '吃药', 'medicine', 'pill', 'medication'],
    need_help: ['帮', '帮助', 'help', 'assist', 'emergency'],
    watch_tv: ['电视', 'tv', 'television', 'watch'],
  };
  
  // 匹配关键词
  let matchedIntent = 'unknown';
  let maxMatches = 0;
  
  for (const [intent, keywords] of Object.entries(keywordMap)) {
    const matches = keywords.filter(keyword => lowerText.includes(keyword)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      matchedIntent = intent;
    }
  }
  
  // 如果没有匹配，返回原文
  if (matchedIntent === 'unknown' || maxMatches === 0) {
    return {
      intent: 'unknown',
      sentence_zh: transcript,
      sentence_en: transcript,
      confidence: 0.3,
    };
  }
  
  // 从 COMMON_NEEDS 查找对应句子
  const need = COMMON_NEEDS.find(n => n.intent === matchedIntent);
  if (need) {
    return {
      intent: matchedIntent,
      sentence_zh: need.label_zh,
      sentence_en: need.label_en,
      confidence: 0.7,
    };
  }
  
  // 兜底返回
  return {
    intent: matchedIntent,
    sentence_zh: transcript,
    sentence_en: transcript,
    confidence: 0.5,
  };
};

