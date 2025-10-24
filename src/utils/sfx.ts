// 轻量可爱待机音效（不打扰识别与播报）
// 原理：使用 WebAudio 生成短促的上滑“bubble”音色，极低音量，
// IDLE 时每 7-11 秒随机播放一次，进入其它状态或 TTS 讲话时停止。

let audioCtx: AudioContext | null = null;
let intervalId: number | null = null;
let unlocked = false;

const createBubble = () => {
  if (!audioCtx) return;
  const ctx = audioCtx;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // 起始频率稍低，快速上滑，较“可爱”
  const now = ctx.currentTime;
  const startFreq = 520 + Math.random() * 120; // 520~640 Hz
  const endFreq = startFreq + 280 + Math.random() * 120; // +280~+400 Hz

  osc.type = 'sine';
  osc.frequency.setValueAtTime(startFreq, now);
  osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.12);

  // 音量包络：极低音量，快速起落
  const base = 0.08; // 再提升音量（总体仍较小）
  gain.gain.setValueAtTime(0.0, now);
  gain.gain.linearRampToValueAtTime(base, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.22);
};

// 眨眼音效：更短更亮的“ting”，与眼睛眨动同步
export const playBlinkSfx = () => {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch { return; }
  }
  // 若尚未解锁，尝试恢复（不会强制播放）
  audioCtx.resume().catch(() => {});

  const ctx = audioCtx!;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  const now = ctx.currentTime;
  const start = 900 + Math.random() * 150; // 900~1050 Hz
  const end = start + 450; // 更亮

  osc.type = 'sine';
  osc.frequency.setValueAtTime(start, now);
  osc.frequency.exponentialRampToValueAtTime(end, now + 0.07);

  const base = 0.12; // 更明显的“ting”
  gain.gain.setValueAtTime(0.0, now);
  gain.gain.linearRampToValueAtTime(base, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);

  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.12);
};

const setupUnlock = () => {
  if (!audioCtx || unlocked) return;
  const tryResume = async () => {
    try {
      await audioCtx!.resume();
      unlocked = true;
      // 轻微提示音确认已解锁
      createBubble();
    } catch {}
    window.removeEventListener('pointerdown', tryResume);
    window.removeEventListener('touchstart', tryResume);
    window.removeEventListener('click', tryResume);
  };
  window.addEventListener('pointerdown', tryResume, { once: true });
  window.addEventListener('touchstart', tryResume, { once: true });
  window.addEventListener('click', tryResume, { once: true });
};

export const startIdleSfx = () => {
  // iOS 需用户手势后才能创建 AudioContext，这里容错
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  } catch {
    return;
  }
  setupUnlock();
  if (intervalId) return; // 已在播放

  const schedule = () => {
    // 如果 TTS 在说话或页面不可见，就跳过
    if (typeof window !== 'undefined') {
      const speaking = (window as any).speechSynthesis?.speaking;
      if (speaking) return;
      if (document.hidden) return;
    }
    createBubble();
  };

  // 先延迟一点，随后随机间隔（5~9s）
  const tick = () => {
    schedule();
    const next = 5000 + Math.random() * 4000;
    intervalId = window.setTimeout(tick, next) as unknown as number;
  };
  intervalId = window.setTimeout(tick, 1200) as unknown as number;
};

export const stopIdleSfx = () => {
  if (intervalId) {
    clearTimeout(intervalId);
    intervalId = null;
  }
  // 保留 AudioContext，避免频繁重建；但若需要完全释放：
  // try { audioCtx?.close(); } catch {}
  // audioCtx = null;
};


