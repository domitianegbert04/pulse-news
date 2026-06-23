// ============================================================
// 06-SOUND.js — Ambient Web Audio (topic-specific tones)
// ============================================================

let soundEnabled = false;
let audioCtx = null;
let currentOscillators = [];

function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function getTopicFrequency(topic) {
  const freqs = { Tech: 440, Science: 523, World: 330, Business: 392, Health: 294, Space: 659, Climate: 349 };
  return freqs[topic] || 440;
}

function playTopicTone(topic) {
  if (!soundEnabled || !audioCtx) return;

  const freq = getTopicFrequency(topic);
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(0, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.03, audioCtx.currentTime + 0.5);
  gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 3);

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 3);

  currentOscillators.push({ osc, gain });
  setTimeout(() => {
    currentOscillators = currentOscillators.filter(o => o.osc !== osc);
  }, 3000);
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  const btn = document.getElementById('sound-btn');
  if (btn) {
    btn.textContent = soundEnabled ? '🔊' : '🔇';
    btn.classList.toggle('active', soundEnabled);
  }

  if (soundEnabled) {
    initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  } else {
    currentOscillators.forEach(({ osc, gain }) => {
      try {
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);
        osc.stop(audioCtx.currentTime + 0.3);
      } catch(e) {}
    });
    currentOscillators = [];
  }
}
