// ============================================================
// 02-BIAS.js — Bias Mirror Analysis
// ============================================================

const STORAGE_BIAS = 'pulse_bias_v1';

function analyzeBias(text) {
  const optimisticWords = ['great','amazing','excellent','breakthrough','success','win','progress','innovation','future','promising','optimistic','positive','advance','improve','benefit','opportunity','growth','solution','excited','hope','better'];
  const skepticalWords = ['concern','risk','problem','issue','danger','warning','threat','fail','crisis','negative','doubt','skeptical','worried','alarming','controversial','criticism','challenge','flaw','limitation','scam','fake','misleading'];

  const lower = text.toLowerCase();
  let optCount = optimisticWords.reduce((acc, w) => acc + (lower.split(w).length - 1), 0);
  let skpCount = skepticalWords.reduce((acc, w) => acc + (lower.split(w).length - 1), 0);

  if (optCount > skpCount) return 'optimist';
  if (skpCount > optCount) return 'skeptic';
  return 'neutral';
}

function recordBias(articleId, topic, bias) {
  const store = JSON.parse(localStorage.getItem(STORAGE_BIAS) || '{}');
  const weekKey = getWeekKey();
  if (!store[weekKey]) store[weekKey] = {};
  if (!store[weekKey][topic]) store[weekKey][topic] = { optimist: 0, skeptic: 0, total: 0 };
  store[weekKey][topic][bias]++;
  store[weekKey][topic].total++;
  localStorage.setItem(STORAGE_BIAS, JSON.stringify(store));
  checkBiasMirror();
}

function getWeekKey() {
  const now = new Date();
  return `${now.getFullYear()}-W${Math.ceil((now.getDate() + 6 - now.getDay()) / 7)}`;
}

function checkBiasMirror() {
  const store = JSON.parse(localStorage.getItem(STORAGE_BIAS) || '{}');
  const weekKey = getWeekKey();
  const weekData = store[weekKey] || {};

  let bannerShown = false;
  for (const [topic, data] of Object.entries(weekData)) {
    if (data.total >= 6) {
      const ratio = Math.max(data.optimist, data.skeptic) / data.total;
      if (ratio >= 0.7) {
        const lean = data.optimist > data.skeptic ? 'optimistic' : 'skeptical';
        const banner = document.getElementById('bias-banner');
        const text = document.getElementById('bias-text');
        if (banner && text) {
          text.textContent = `You've been ${Math.round(ratio * 100)}% ${lean} on ${topic}. Consider exploring the other side.`;
          banner.classList.add('visible');
        }
        bannerShown = true;
        break;
      }
    }
  }
  if (!bannerShown) {
    const banner = document.getElementById('bias-banner');
    if (banner) banner.classList.remove('visible');
  }
}
