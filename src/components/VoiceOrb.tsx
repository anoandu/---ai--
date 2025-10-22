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
  // 说话时：音量驱动缩放（0-1 → 0-0.35幅度），并映射到色相与发光强度
  const baseScale = isListening ? (isSpeaking ? 1.28 : 1.10) : isProcessing ? 0.92 : 1;
  const scale = baseScale + (isListening ? Math.min(audioLevel, 1) * 0.35 : 0);
  const hue = isListening ? Math.round(Math.min(audioLevel, 1) * 60) : isProcessing ? 20 : 0; // 蓝→紫→暖
  const sat = isListening ? 1 + Math.min(audioLevel, 1) * 0.3 : 1;
  const glow = isListening ? 0.6 + Math.min(audioLevel, 1) * 0.3 : isProcessing ? 0.5 : 0.6;

  // 调试：显示当前音量和说话状态
  console.log('VoiceOrb:', { state, audioLevel: audioLevel.toFixed(2), isSpeaking, scale: scale.toFixed(2) });

  return (
    <div
      className={`orb-container ${state.toLowerCase()}`}
      style={{ width: 180, height: 180, marginTop: 'clamp(24px, 10vh, 72px)' }}
    >
      {/* 可缩放外层 */}
      <div
        className="orb-scale"
        style={{
          width: 160,
          height: 160,
          transform: `scale(${scale}) rotate(${isListening ? audioLevel * 12 : isProcessing ? 5 : 0}deg)`,
          transition: 'transform 0.12s ease-out'
        }}
      >
        {/* 主球 */}
        <div
          className={`orb-main ${isActive ? 'active' : ''} ${isListening && isSpeaking ? 'speaking' : ''}`}
          style={{
            position: 'relative',
            width: 160,
            height: 160,
            opacity: dynamicOpacity,
            transition: isListening ? 'opacity 0.1s ease-out' : undefined,
            // 将音量映射到 CSS 变量，驱动色相/发光
            ['--hue' as any]: `${hue}deg`,
            ['--sat' as any]: sat,
            ['--glow' as any]: glow
          }}
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
          
        </div>

        {/* 说话时的扩散波纹（挪到 orb-scale 内部，位于主球之上）*/}
        {isListening && isSpeaking && (
          <>
            <div className="orb-wave orb-wave-1" />
            <div className="orb-wave orb-wave-2" />
            <div className="orb-wave orb-wave-3" />
          </>
        )}
      </div>

      {/* 可爱大眼睛（固定在脸上，不随旋转缩放）*/}
      <div className="orb-eyes">
        <div className="orb-eye-wrap">
          <div className="orb-eye" />
        </div>
        <div className="orb-eye-wrap delay">
          <div className="orb-eye" />
        </div>
      </div>
    </div>
  );
};

export default VoiceOrb;

