// ============================================================
// 03-DNA.js — Reading DNA Badge (conic-gradient pie + bar breakdown)
// ============================================================

const READING_DNA_KEY = 'pulse_reading_dna_v1';

const DNA_COLORS = {
  Tech: '#007AFF', Science: '#5856D6', World: '#FF6B35',
  Business: '#34C759', Health: '#FF3B30', Space: '#AF52DE', Climate: '#30B041'
};

function getReadingDna() {
  try { return JSON.parse(localStorage.getItem(READING_DNA_KEY) || '{}'); }
  catch { return {}; }
}

function recordDnaEngagement(topic) {
  const dna = getReadingDna();
  dna[topic] = (dna[topic] || 0) + 1;
  localStorage.setItem(READING_DNA_KEY, JSON.stringify(dna));
  renderDnaBadge();
}

function renderDnaBadge() {
  const dna = getReadingDna();
  const badge = document.getElementById('dna-badge');
  if (!badge) return;
  const topics = Object.keys(dna);
  if (topics.length === 0) {
    badge.style.background = 'linear-gradient(135deg, #C2C2D1, #8E8E93)';
    return;
  }
  const total = Object.values(dna).reduce((a, b) => a + b, 0);
  let gradientStops = [];
  let acc = 0;
  topics.sort((a, b) => dna[b] - dna[a]).forEach(t => {
    const pct = (dna[t] / total) * 100;
    gradientStops.push(`${DNA_COLORS[t] || '#8E8E93'} ${acc}% ${acc + pct}%`);
    acc += pct;
  });
  badge.style.background = `conic-gradient(${gradientStops.join(', ')})`;
}

function toggleDnaPanel() {
  const panel = document.getElementById('dna-panel');
  const content = document.getElementById('dna-content');
  if (!panel) return;
  const isVisible = panel.classList.contains('visible');

  if (!isVisible) {
    const dna = getReadingDna();
    const total = Object.values(dna).reduce((a, b) => a + b, 0);
    if (total === 0) {
      content.innerHTML = `<div style="color:var(--label3);font-style:italic;">Engage with a few stories and your reading pattern will form here.</div>`;
    } else {
      const sorted = Object.entries(dna).sort((a, b) => b[1] - a[1]);
      const top = sorted[0][0];
      let bars = sorted.map(([topic, count]) => {
        const pct = Math.round((count / total) * 100);
        const color = DNA_COLORS[topic] || '#8E8E93';
        return `<div class="dna-bar-row">
          <span class="dna-bar-label">${topic}</span>
          <div class="dna-bar-track"><div class="dna-bar-fill" style="width:${pct}%;background:${color}"></div></div>
        </div>`;
      }).join('');
      content.innerHTML = `<div style="margin-bottom:6px;">You lean <strong>${top}</strong> right now.</div><div class="dna-bars">${bars}</div>`;
    }
  }
  panel.classList.toggle('visible');
}