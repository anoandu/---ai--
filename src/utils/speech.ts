import { Language } from '../types';

// 检查浏览器是否支持 Web Speech API
export const isSpeechRecognitionSupported = (): boolean => {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
};

export const isSpeechSynthesisSupported = (): boolean => {
  return 'speechSynthesis' in window;
};

// ASR - 语音识别
export class SpeechRecognitionService {
  private recognition: any = null;
  private isListening = false;
  private resolveCallback: ((value: string) => void) | null = null;
  private rejectCallback: ((reason: any) => void) | null = null;
  private finalTranscript: string = '';
  private interimTranscript: string = '';
  private onTranscriptUpdate?: (text: string) => void;
  
  constructor(language: Language, onTranscriptUpdate?: (text: string) => void) {
    this.onTranscriptUpdate = onTranscriptUpdate;
    if (isSpeechRecognitionSupported()) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true; // 持续录音
      this.recognition.interimResults = true; // 支持中间结果
      this.recognition.lang = language === 'zh' ? 'zh-CN' : 'en-US';
      this.recognition.maxAlternatives = 1;
      
      this.recognition.onresult = (event: any) => {
        console.log('🎤 Speech recognition result:', event.results);
        console.log('Result count:', event.results.length);
        // 记录中间与最终结果
        let hasFinal = false;
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          console.log(`Result [${i}] isFinal:${result.isFinal}, text:"${transcript}"`);
          if (result.isFinal) {
            this.finalTranscript += transcript;
            console.log('✅ Final transcript chunk:', transcript);
            hasFinal = true;
          } else {
            this.interimTranscript = transcript;
            console.log('⏳ Interim transcript:', transcript);
          }
        }

        // 若本批次产生了最终结果，清空临时文本，避免“最终+临时”重复显示
        if (hasFinal) {
          this.interimTranscript = '';
        }
        
        // 实时更新 UI（显示最终+临时）
        const currentText = (this.finalTranscript + ' ' + this.interimTranscript)
          .replace(/\s+/g, ' ')
          .trim();
        if (this.onTranscriptUpdate && currentText) {
          this.onTranscriptUpdate(currentText);
        }
        
        // 若已有最终文本且用户调用了 stop()，尽快返回
        if (this.resolveCallback && this.finalTranscript.trim()) {
          const text = this.finalTranscript.replace(/\s+/g, ' ').trim();
          this.resolveCallback(text);
          this.resolveCallback = null;
          this.rejectCallback = null;
          this.finalTranscript = '';
          this.interimTranscript = '';
        }
      };
      
      this.recognition.onerror = (event: any) => {
        console.error('❌ Speech recognition error:', event.error);
        console.error('Error details:', event);
        if (this.rejectCallback) {
          this.rejectCallback(new Error(event.error));
          this.resolveCallback = null;
          this.rejectCallback = null;
        }
      };
      
      this.recognition.onstart = () => {
        console.log('✅ Speech recognition started');
        console.log('Language:', this.recognition.lang);
        console.log('Continuous:', this.recognition.continuous);
        console.log('InterimResults:', this.recognition.interimResults);
      };
      
      this.recognition.onaudiostart = () => {
        console.log('🎵 Audio capture started');
      };
      
      this.recognition.onaudioend = () => {
        console.log('🎵 Audio capture ended');
      };
      
      this.recognition.onsoundstart = () => {
        console.log('🔊 Sound detected');
      };
      
      this.recognition.onsoundend = () => {
        console.log('🔇 Sound ended');
      };
      
      this.recognition.onspeechstart = () => {
        console.log('🗣️ Speech detected');
      };
      
      this.recognition.onspeechend = () => {
        console.log('🗣️ Speech ended');
      };
      
      this.recognition.onend = () => {
        console.log('🏁 Speech recognition ended');
        console.log('Final accumulated:', this.finalTranscript);
        console.log('Last interim:', this.interimTranscript);
        this.isListening = false;
        // 如果 stop() 后没有最终结果，也返回最后一次的中间结果
        if (this.resolveCallback) {
          const text = (this.finalTranscript || this.interimTranscript || '')
            .replace(/\s+/g, ' ')
            .trim();
          console.log('Returning text:', text || '(empty)');
          this.resolveCallback(text);
          this.resolveCallback = null;
          this.rejectCallback = null;
        }
        this.finalTranscript = '';
        this.interimTranscript = '';
      };
    }
  }
  
  setLanguage(language: Language) {
    if (this.recognition) {
      this.recognition.lang = language === 'zh' ? 'zh-CN' : 'en-US';
    }
  }
  
  start(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }
      
      this.resolveCallback = resolve;
      this.rejectCallback = reject;
      
      try {
        this.recognition.start();
        this.isListening = true;
        console.log('Starting speech recognition...');
      } catch (error) {
        console.error('Failed to start recognition:', error);
        reject(error);
      }
    });
  }
  
  stop(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition || !this.isListening) {
        resolve('');
        return;
      }
      
      // 设置回调：在 onend 时统一返回
      this.resolveCallback = resolve;
      this.rejectCallback = reject;
      
      try {
        this.recognition.stop();
      } catch (e) {
        console.error('Failed to stop recognition:', e);
        resolve((this.finalTranscript || this.interimTranscript || '').trim());
      }
      
      this.isListening = false;
    });
  }
  
  abort() {
    if (this.recognition) {
      this.recognition.abort();
      this.isListening = false;
      this.resolveCallback = null;
      this.rejectCallback = null;
    }
  }
  
  getIsListening() {
    return this.isListening;
  }
}

// TTS - 语音合成
// 选择更自然的人声，避免“趣味音色”（如 Zarvox/Trinoids）
const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent);

const getPreferredVoice = (language: Language): SpeechSynthesisVoice | null => {
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // 屏蔽“趣味音色”
  const blocked = [
    'Bad News', 'Bahh', 'Bells', 'Boing', 'Bubbles', 'Cellos', 'Good News',
    'Pipe Organ', 'Whisper', 'Trinoids', 'Zarvox', 'Hysterical', 'Deranged'
  ];

  // 优先列表（不同平台常见的自然人声）
  const preferredZhIOS = ['Yating', 'Ting-Ting', 'Mei-Jia', 'Yuxi', 'Siri'];
  const preferredZhOther = ['Ting-Ting', 'Mei-Jia', 'Google 國語', 'Google 中文', 'Google 普通话'];
  // 英文明确偏好女性音色
  const preferredEn = ['Samantha', 'Victoria', 'Moira', 'Karen', 'Google US English', 'Google UK English Female'];

  const preferredByLang: Record<Language, string[]> = {
    zh: isIOS ? preferredZhIOS : preferredZhOther,
    en: preferredEn
  };

  const langPrefix = language === 'zh' ? 'zh' : 'en';

  // 1) 优先名称包含匹配（不同平台命名可能包含前后缀）
  for (const name of preferredByLang[language]) {
    const v = voices.find(voice => voice.name.toLowerCase().includes(name.toLowerCase()));
    if (v) return v;
  }

  // 1.1) 若支持标注 Female，则优先 Female
  const femaleHint = voices.find(v => (v.lang || '').toLowerCase().startsWith(langPrefix) && /female|女/i.test(v.name));
  if (femaleHint) return femaleHint;

  // 2) 其次选择语言前缀匹配 + 非屏蔽
  const candidates = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith(langPrefix) && !blocked.includes(v.name));
  if (candidates.length > 0) return candidates[0];

  // 3) 再其次选择 Google 系列
  const google = voices.find(v => v.name.toLowerCase().includes('google') && v.lang.toLowerCase().startsWith(langPrefix));
  if (google) return google;

  // 4) 兜底返回第一项
  return voices[0] || null;
};

export const speak = (text: string, language: Language): Promise<void> => {
  return new Promise((resolve) => {
    if (!isSpeechSynthesisSupported()) {
      // 静默失败，不影响用户体验
      resolve();
      return;
    }
    
    // 停止当前播放
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'zh' ? 'zh-CN' : 'en-US';
    // 更自然的语速音调（女性人声更贴近日常语速）
    if (language === 'zh' && isIOS) {
      utterance.rate = 0.88; // iOS 中文再慢一些
      utterance.pitch = 0.98;
    } else if (language === 'zh') {
      utterance.rate = 0.92; // 其它平台中文放慢
      utterance.pitch = 0.98;
    } else {
      utterance.rate = 0.95; // 英文稍慢
      utterance.pitch = 1.0;
    }
    utterance.volume = 1;
    
    // 尝试选择更合适的人声
    const assignVoice = () => {
      const v = getPreferredVoice(language);
      if (v) utterance.voice = v;
      window.speechSynthesis.speak(utterance);
    };
    
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve(); // 静默失败
    
    const loaded = window.speechSynthesis.getVoices();
    if (loaded && loaded.length > 0) {
      assignVoice();
    } else {
      window.speechSynthesis.onvoiceschanged = () => assignVoice();
      // 超时保护
      setTimeout(() => assignVoice(), 500);
    }
  });
};

// 预加载语音列表
export const loadVoices = (): Promise<void> => {
  return new Promise((resolve) => {
    if (!isSpeechSynthesisSupported()) {
      resolve();
      return;
    }
    
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve();
      return;
    }
    
    window.speechSynthesis.onvoiceschanged = () => {
      resolve();
    };
    
    // 超时保护
    setTimeout(() => resolve(), 1000);
  });
};

