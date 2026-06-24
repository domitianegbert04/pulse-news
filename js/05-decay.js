// ============================================================
// 05-DECAY.js — Confidence Decay (visual staleness overlay)
// ============================================================

function applyDecayOverlay(el, publishedAt) {
  if (!publishedAt || !el) return;
  const ageHours = (Date.now() - new Date(publishedAt).getTime()) / 3600000;
  // Decay starts after 12h, maxes around 72h
  const decayPct = Math.max(0, Math.min(1, (ageHours - 12) / 60));
  if (decayPct <= 0) return;
  el.style.opacity = String(1 - decayPct * 0.35);
  el.style.filter = `saturate(${1 - decayPct * 0.4})`;
}