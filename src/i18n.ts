import { Language } from './types';

export const translations = {
  zh: {
    welcome: '你好，我是 [name]。',
    subtitle: '我会帮助你表达你想说的话。',
    speakNow: '现在说话',
    listening: '正在聆听… 请说话，完成后点击停止',
    processing: '正在处理…',
    confirmQuestion: '你是想说「{sentence}」对吗？',
    yes: '是的',
    no: '不对',
    tryAgain: '再说一次',
    usePictureBoard: '使用图片板',
    saySomethingElse: '说些别的',
    outputPrefix: '我想说：',
    chooseBelowOrTryAgain: '请从下方选择，或重新说一次：',
    back: '返回',
  },
  en: {
    welcome: 'Hi there, I\'m [name].',
    subtitle: 'I\'ll help you express what you want to say.',
    speakNow: 'Speak now',
    listening: 'Listening… Speak now, tap to stop',
    processing: 'Processing…',
    confirmQuestion: 'Do you mean "{sentence}"?',
    yes: 'Yes',
    no: 'No',
    tryAgain: 'Try again',
    usePictureBoard: 'Use picture board',
    saySomethingElse: 'Say something else',
    outputPrefix: 'I want to say:',
    chooseBelowOrTryAgain: 'Choose below or try again:',
    back: 'Back',
  }
};

export const t = (key: keyof typeof translations.zh, lang: Language, params?: Record<string, string>) => {
  let text = translations[lang][key];
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, v);
    });
  }
  return text;
};

