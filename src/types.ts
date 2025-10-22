export type AppState = 
  | 'IDLE' 
  | 'LISTENING' 
  | 'PROCESSING' 
  | 'CONFIRM' 
  | 'OUTPUT' 
  | 'DISAMBIGUATE'
  | 'NO_OPTIONS';

export type Language = 'zh' | 'en';

export interface LLMResponse {
  intent: string;
  sentence_en: string;
  sentence_zh: string;
  confidence: number;
}

export interface CommonNeed {
  id: string;
  icon: string;
  label_zh: string;
  label_en: string;
  intent: string;
}

