// ============================================================
// 06-PACE.js — Reading Pace Tracking (dwell time → border color)
// ============================================================

const cardViewTimers = {};

function startPaceTracking(cardEl, articleId) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        cardViewTimers[articleId] = Date.now();
      } else if (cardViewTimers[articleId]) {
        const dwell = Date.now() - cardViewTimers[articleId];
        markReadStatus(cardEl, dwell);
        delete cardViewTimers[articleId];
      }
    });
  }, { threshold: 0.6 });
  obs.observe(cardEl);
}

function markReadStatus(cardEl, dwellMs) {
  if (!cardEl) return;
  if (dwellMs > 3500) {
    cardEl.style.borderLeft = '3px solid var(--green)';
  } else if (dwellMs > 800) {
    cardEl.style.borderLeft = '3px solid var(--orange)';
  }
}
