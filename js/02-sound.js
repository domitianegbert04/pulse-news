// ============================================================
// 02-SOUND.js — Ambient Web Audio Per Topic (no audio files)
// ============================================================

let audioCtx = null;
let currentOscillators = [];
let soundEnabled = false;

const TOPIC_SOUND = {
  Tech:     { freq: 220, type: 'sine' },
  Science:  { freq: 330, type: 'sine' },
  World:    { freq: 110, type: 'triangle' },
  Business: { freq: 196, type: 'sine' },
  Health:   { freq: 261, type: 'sine' },
  Space:    { freq: 80,  type: 'sine' },
  Climate:  { freq: 174, type: 'triangle' },
};

function toggleSound() {
  soundEnabled = !soundEnabled;
  const btn = document.getElementById('sound-btn');
  if (btn) btn.textContent = soundEnabled ? '🔊' : '🔇';
  if (!soundEnabled) stopAmbient();
}

function stopAmbient() {
  currentOscillators.forEach(o => { try { o.stop(); } catch {} });
  currentOscillators = [];
}

function playAmbientForTopic(topic) {
  if (!soundEnabled) return;
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch { return; }
  }
  stopAmbient();
  const cfg = TOPIC_SOUND[topic] || TOPIC_SOUND.Tech;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = cfg.type;
  osc.frequency.setValueAtTime(cfg.freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(0, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.025, audioCtx.currentTime + 0.5);
  gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 2.2);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 2.3);
  currentOscillators.push(osc);
}