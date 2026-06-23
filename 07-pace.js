// ============================================================
// 07-PACE.js — Reading Pace Tracking (dwell time indicator)
// ============================================================

const STORAGE_PACE = 'pulse_pace_v1';
let dwellTimers = {};
let paceObserver = null;

function initPaceTracking() {
  if (paceObserver) paceObserver.disconnect();

  paceObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.id;
      if (entry.isIntersecting) {
        if (!dwellTimers[id]) dwellTimers[id] = { start: Date.now(), total: 0 };
        else dwellTimers[id].start = Date.now();
      } else {
        if (dwellTimers[id] && dwellTimers[id].start) {
          dwellTimers[id].total += Date.now() - dwellTimers[id].start;
          dwellTimers[id].start = null;
          checkPace(id, entry.target);
        }
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.card').forEach(card => paceObserver.observe(card));
}

function checkPace(id, card) {
  const time = dwellTimers[id]?.total || 0;
  const paceEl = card.querySelector('.card-pace');
  if (!paceEl) return;

  if (time > 8000) {
    paceEl.classList.add('read');
    paceEl.classList.remove('skimmed');
  } else if (time > 2000) {
    paceEl.classList.add('skimmed');
    paceEl.classList.remove('read');
  }

  const store = JSON.parse(localStorage.getItem(STORAGE_PACE) || '{}');
  store[id] = time;
  localStorage.setItem(STORAGE_PACE, JSON.stringify(store));
}
