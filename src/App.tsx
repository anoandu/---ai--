import React, { useState, useEffect, useRef } from 'react';
import { AppState, Language, LLMResponse } from './types';
import { t } from './i18n';
import { 
  SpeechRecognitionService, 
  isSpeechRecognitionSupported, 
  speak, 
  loadVoices 
} from './utils/speech';
import { callLLM } from './utils/llm';
import VoiceOrb from './components/VoiceOrb';
import PictureBoard from './components/PictureBoard';
import './App.css';

function App() {
  const [state, setState] = useState<AppState>('IDLE');
  const [language, setLanguage] = useState<Language>('zh');
  const [currentSentence, setCurrentSentence] = useState({ zh: '', en: '' });
  const [realtimeTranscript, setRealtimeTranscript] = useState(''); // 实时识别文字
  const [audioLevel, setAudioLevel] = useState(0); // 音量级别 0-1
  const [isSpeaking, setIsSpeaking] = useState(false); // 是否检测到说话（用于强反馈）
  
  const recognitionRef = useRef<SpeechRecognitionService | null>(null);
  const isRecordingRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const hadVoiceRef = useRef<boolean>(false);

  // 初始化
  useEffect(() => {
    loadVoices();
    if (isSpeechRecognitionSupported()) {
      recognitionRef.current = new SpeechRecognitionService(language, setRealtimeTranscript);
    } else {
      // 浏览器不支持语音识别，显示错误
      console.error('Browser does not support speech recognition');
    }
    
    // 清理
    return () => {
      stopAudioMonitoring();
    };
  }, []);

  // 更新语音识别语言
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.setLanguage(language);
    }
  }, [language]);

  // 音量监测
  const startAudioMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let speakingState = false;
      
      const timeDomainArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        if (!analyserRef.current || state !== 'LISTENING') {
          return;
        }
        
        // 频域能量
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        const freqLevel = average / 80; // 频域粗略归一化

        // 时域 RMS（对安静设备更稳）
        analyser.getByteTimeDomainData(timeDomainArray);
        let sumSquares = 0;
        for (let i = 0; i < timeDomainArray.length; i++) {
          const v = (timeDomainArray[i] - 128) / 128; // -1..1
          sumSquares += v * v;
        }
        const rms = Math.sqrt(sumSquares / timeDomainArray.length); // 0..1
        const timeLevel = rms * 3; // 放大系数提高灵敏度

        const normalizedLevel = Math.min(Math.max(freqLevel, timeLevel), 1);
        
        setAudioLevel(normalizedLevel);
        console.log('Audio level:', normalizedLevel.toFixed(3), 'freqAvg:', average.toFixed(1), 'rms:', rms.toFixed(3));
        
        // 说话阈值（带迟滞，减少闪烁）- 再降低一档
        const HIGH = 0.05;
        const LOW = 0.03;
        if (!speakingState && normalizedLevel > HIGH) {
          speakingState = true;
          setIsSpeaking(true);
          hadVoiceRef.current = true;
          console.log('🗣️ Speaking started!');
        } else if (speakingState && normalizedLevel < LOW) {
          speakingState = false;
          setIsSpeaking(false);
          console.log('🔇 Speaking stopped');
        }
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      
      updateLevel();
    } catch (error) {
      console.error('Failed to start audio monitoring:', error);
    }
  };

  const stopAudioMonitoring = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setAudioLevel(0);
    setIsSpeaking(false);
  };

  // 切换语言
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'zh' ? 'en' : 'zh');
  };

  // 主按钮点击处理
  const handleMainButtonClick = async () => {
    if (state === 'IDLE') {
      // 第一次点击：开始录音
      startListening();
    } else if (state === 'LISTENING') {
      // 第二次点击：停止录音并处理
      stopListeningAndProcess();
    }
  };

  // 开始录音
  const startListening = async () => {
    if (!isSpeechRecognitionSupported()) {
      alert('您的浏览器不支持语音识别功能。\n\n请使用 Chrome 或 Edge 浏览器。');
      return;
    }

    // 先请求麦克风权限（仅音频）
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      }
      
      setState('LISTENING');
      isRecordingRef.current = true;
      setRealtimeTranscript(''); // 清空实时文字
      
      // 开始音量监测
      await startAudioMonitoring();

      // 开始录音（返回 Promise，用于在 stop() 前已得到结果的情况）
      recognitionRef.current?.start().then((maybeEarlyText) => {
        if (maybeEarlyText && state === 'LISTENING') {
          // 极少数情况下 start 就返回了最终文本（某些实现/权限弹窗后）
          setState('PROCESSING');
          isRecordingRef.current = false;
          stopAudioMonitoring();
          processTranscript(maybeEarlyText);
        }
      }).catch((error) => {
        console.error('Speech recognition error:', error);
        alert(`语音识别启动失败：${error.message}\n\n请检查麦克风权限。`);
        setState('IDLE');
        isRecordingRef.current = false;
        stopAudioMonitoring();
      });
    } catch (error: any) {
      console.error('Microphone permission error:', error);
      alert('需要麦克风权限才能使用语音功能。\n\n请在浏览器设置中允许麦克风访问。');
      setState('IDLE');
    }
  };

  // 停止录音并处理
  const stopListeningAndProcess = async () => {
    if (!isRecordingRef.current) return;
    
    setState('PROCESSING');
    isRecordingRef.current = false;
    stopAudioMonitoring(); // 停止音量监测

    let transcript = '';

    if (isSpeechRecognitionSupported() && recognitionRef.current) {
      try {
        // 停止录音并获取结果
        transcript = await recognitionRef.current.stop();
      } catch (error) {
        console.error('Recognition failed:', error);
        alert('语音识别失败，请重试。');
        setState('IDLE');
        setRealtimeTranscript('');
        return;
      }
    }

    // 如果没有转写结果，回退使用实时文字
    if (!transcript || !transcript.trim()) {
      if (realtimeTranscript && realtimeTranscript.trim()) {
        transcript = realtimeTranscript.trim();
      } else if (hadVoiceRef.current) {
        // 曾检测到声音但未拿到最终文本，也尝试使用实时文字
        transcript = realtimeTranscript.trim();
      }
      if (!transcript) {
        alert('没有检测到语音，请重试。\n\n提示：请确保在安静环境下清晰说话。');
        setState('IDLE');
        setRealtimeTranscript('');
        return;
      }
    }

    console.log('Recognized text:', transcript);

    // 调用 LLM 处理
    await processTranscript(transcript);
    setRealtimeTranscript(''); // 清空实时文字
  };


  // 处理转写文本
  const processTranscript = async (transcript: string) => {
    try {
      // 调用 LLM
      const result: LLMResponse = await callLLM(transcript, language);
      
      // 设置句子
      setCurrentSentence({
        zh: result.sentence_zh,
        en: result.sentence_en,
      });
      
      // 进入确认状态
      setState('CONFIRM');
    } catch (error) {
      console.error('LLM processing error:', error);
      // 出错回到 IDLE
      setState('IDLE');
    }
  };

  // 确认 - Yes
  const handleConfirmYes = async () => {
    setState('OUTPUT');
    
    // TTS 播报
    const textToSpeak = language === 'zh' ? currentSentence.zh : currentSentence.en;
    await speak(textToSpeak, language);
  };

  // 确认 - No
  const handleConfirmNo = () => {
    // 显示选项：再说一次 或 使用图片板
    // 这里简化为直接进入 DISAMBIGUATE
    setState('DISAMBIGUATE');
  };

  // 再说一次
  const handleTryAgain = () => {
    setState('IDLE');
    setCurrentSentence({ zh: '', en: '' });
  };

  // 图片板选择
  const handlePictureBoardSelect = (intent: string, sentenceZh: string, sentenceEn: string) => {
    setCurrentSentence({
      zh: sentenceZh,
      en: sentenceEn,
    });
    setState('CONFIRM');
  };

  // 图片板返回
  const handlePictureBoardBack = () => {
    setState('IDLE');
  };

  // 从 OUTPUT 回到 IDLE
  const handleRestart = () => {
    setState('IDLE');
    setCurrentSentence({ zh: '', en: '' });
  };

  // 渲染主按钮文字
  const getMainButtonText = () => {
    switch (state) {
      case 'IDLE':
        return t('speakNow', language);
      case 'LISTENING':
        return t('listening', language);
      case 'PROCESSING':
        return t('processing', language);
      default:
        return '';
    }
  };

  // 渲染主文字区域
  const renderMainText = () => {
    switch (state) {
      case 'IDLE':
        return (
          <div className="main-text">
            <h1 className="welcome-text">{t('welcome', language)}</h1>
            <p className="subtitle-text">{t('subtitle', language)}</p>
          </div>
        );
      
      case 'CONFIRM':
        const sentence = language === 'zh' ? currentSentence.zh : currentSentence.en;
        return (
          <div className="main-text">
            <p className="confirm-text">
              {t('confirmQuestion', language, { sentence })}
            </p>
          </div>
        );
      
      case 'OUTPUT':
        const outputSentence = language === 'zh' ? currentSentence.zh : currentSentence.en;
        return (
          <div className="main-text">
            <p className="output-prefix">{t('outputPrefix', language)}</p>
            <h1 className="output-sentence">{outputSentence}</h1>
          </div>
        );
      
      default:
        return null;
    }
  };

  // 渲染操作按钮
  const renderActionButtons = () => {
    if (state === 'CONFIRM') {
      return (
        <div className="action-buttons">
          <button className="action-button action-button-yes" onClick={handleConfirmYes}>
            {t('yes', language)}
          </button>
          <button className="action-button action-button-no" onClick={handleConfirmNo}>
            {t('no', language)}
          </button>
        </div>
      );
    }

    if (state === 'OUTPUT') {
      return (
        <div className="action-buttons">
          <button className="action-button action-button-restart" onClick={handleRestart}>
            {t('tryAgain', language)}
          </button>
        </div>
      );
    }

    return null;
  };

  // DISAMBIGUATE 状态显示图片板
  if (state === 'DISAMBIGUATE') {
    return (
      <PictureBoard
        language={language}
        onSelect={handlePictureBoardSelect}
        onBack={handlePictureBoardBack}
      />
    );
  }

  return (
    <div className="app">
      {/* 顶部语言切换 */}
      <div className="top-bar">
        <button className="language-toggle" onClick={toggleLanguage}>
          {language === 'zh' ? 'EN' : '中文'}
        </button>
      </div>

      {/* 主内容区 */}
      <div className="main-content">
        {/* 语音球 */}
        <VoiceOrb state={state} audioLevel={audioLevel} isSpeaking={isSpeaking} />
        
        {/* 实时识别文字 */}
        {state === 'LISTENING' && realtimeTranscript && (
          <div className="realtime-transcript">
            <p className="realtime-text">{realtimeTranscript}</p>
          </div>
        )}
        
        {/* 主文字区域 */}
        {renderMainText()}

        {/* 操作按钮 */}
        {renderActionButtons()}
      </div>

      {/* 主按钮 */}
      {(state === 'IDLE' || state === 'LISTENING' || state === 'PROCESSING') && (
        <div className="bottom-bar">
          <button
            className={`main-button ${state.toLowerCase()}`}
            onClick={handleMainButtonClick}
            disabled={state === 'PROCESSING'}
          >
            {getMainButtonText()}
          </button>
        </div>
      )}
    </div>
  );
}

export default App;

