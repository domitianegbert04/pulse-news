// ============================================================
// 03-DECAY.js — Confidence Decay (cards fade over time)
// ============================================================

function applyConfidenceDecay() {
  const now = Date.now();
  document.querySelectorAll('.card').forEach(card => {
    const loadTime = parseInt(card.dataset.loadTime || now);
    const hours = (now - loadTime) / (1000 * 60 * 60);
    if (hours > 12) {
      const intensity = Math.min((hours - 12) / 60, 1);
      card.style.opacity = 1 - (intensity * 0.5);
      card.style.filter = `saturate(${1 - intensity * 0.7})`;
    }
  });
}

setInterval(applyConfidenceDecay, 60000);
