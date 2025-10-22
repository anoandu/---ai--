import React from 'react';
import { AppState } from '../types';
import './VoiceOrb.css';

interface VoiceOrbProps {
  state: AppState;
  audioLevel?: number; // 0-1 音量级别
  isSpeaking?: boolean; // 是否检测到说话
}

const VoiceOrb: React.FC<VoiceOrbProps> = ({ state, audioLevel = 0, isSpeaking = false }) => {
  const isListening = state === 'LISTENING';
  const isProcessing = state === 'PROCESSING';
  const isActive = isListening || isProcessing;

  // 根据音量调整球的大小和亮度
  // const dynamicScale = isListening ? 1 + (audioLevel * 0.3) : 1; // 1.0 - 1.3
  const dynamicOpacity = isListening ? 0.8 + (audioLevel * 0.2) : 1; // 0.8 - 1.0

  // 说话时更明显的缩放反馈
  const baseScale = isListening ? (isSpeaking ? 1.35 : 1.12) : isProcessing ? 0.9 : 1;
  const scale = baseScale + (isListening ? audioLevel * 0.3 : 0);

  // 调试：显示当前音量和说话状态
  console.log('VoiceOrb:', { state, audioLevel: audioLevel.toFixed(2), isSpeaking, scale: scale.toFixed(2) });

  return (
    <div
      className={`orb-container ${state.toLowerCase()}`}
      style={{ width: 180, height: 180, marginTop: 'clamp(24px, 10vh, 72px)' }}
    >
      {/* 说话时的扩散波纹 */}
      {isListening && isSpeaking && (
        <>
          <div className="orb-wave orb-wave-1" />
          <div className="orb-wave orb-wave-2" />
          <div className="orb-wave orb-wave-3" />
        </>
      )}
      
      {/* 可缩放外层 */}
      <div
        className="orb-scale"
        style={{ width: 160, height: 160, transform: `scale(${scale})`, transition: 'transform 0.12s ease-out' }}
      >
        {/* 主球 */}
        <div
          className={`orb-main ${isActive ? 'active' : ''} ${isListening && isSpeaking ? 'speaking' : ''}`}
          style={{ width: 160, height: 160, opacity: dynamicOpacity, transition: isListening ? 'opacity 0.1s ease-out' : undefined }}
        >
        {/* 内部小球 - 使用多个不同颜色和大小的小球 */}
        <div className="orb-particle orb-particle-1" />
        <div className="orb-particle orb-particle-2" />
        <div className="orb-particle orb-particle-3" />
        <div className="orb-particle orb-particle-4" />
        <div className="orb-particle orb-particle-5" />
        <div className="orb-particle orb-particle-6" />
        <div className="orb-particle orb-particle-7" />
        <div className="orb-particle orb-particle-8" />
        
        {/* 主渐变层 */}
        <div className="orb-gradient" />
        
        {/* 发光层 */}
          <div className="orb-glow" />
          
          {/* 眼睛 */}
          <div className="orb-eyes">
            <div className="orb-eye orb-eye-left" />
            <div className="orb-eye orb-eye-right" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceOrb;

