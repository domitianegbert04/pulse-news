// ============================================================
// 04-DNA.js — Reading DNA Badge (conic-gradient pie chart)
// ============================================================

const STORAGE_DNA = 'pulse_dna_v1';

function updateReadingDNA() {
  const dna = JSON.parse(localStorage.getItem(STORAGE_DNA) || '{}');
  const total = Object.values(dna).reduce((a, b) => a + b, 0);
  const badge = document.getElementById('reading-dna');
  if (!badge) return;

  if (total === 0) {
    badge.style.background = 'var(--surface3)';
    return;
  }

  const colors = {
    Tech: '#007AFF', Science: '#5856D6', World: '#FF6B35',
    Business: '#34C759', Health: '#FF3B30', Space: '#AF52DE', Climate: '#30B041'
  };

  let gradient = 'conic-gradient(';
  let current = 0;
  const entries = Object.entries(dna).sort((a, b) => b[1] - a[1]);

  entries.forEach(([topic, count]) => {
    const pct = (count / total) * 100;
    const start = current;
    current += pct;
    gradient += `${colors[topic] || '#8E8E93'} ${start}% ${current}%, `;
  });

  gradient = gradient.slice(0, -2) + ')';
  badge.style.background = gradient;

  const breakdown = document.getElementById('dna-breakdown');
  if (breakdown) {
    breakdown.innerHTML = entries.map(([topic, count]) => {
      const pct = Math.round((count / total) * 100);
      return `<div class="dna-item"><div class="dna-color" style="background:${colors[topic]}"></div><div class="dna-label">${topic}</div><div class="dna-pct">${pct}%</div></div>`;
    }).join('');
  }
}

function recordTopicEngagement(topic) {
  const dna = JSON.parse(localStorage.getItem(STORAGE_DNA) || '{}');
  dna[topic] = (dna[topic] || 0) + 1;
  localStorage.setItem(STORAGE_DNA, JSON.stringify(dna));
  updateReadingDNA();
}

function toggleDNATooltip() {
  const tooltip = document.getElementById('dna-tooltip');
  if (tooltip) tooltip.classList.toggle('visible');
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('#reading-dna') && !e.target.closest('#dna-tooltip')) {
    const tooltip = document.getElementById('dna-tooltip');
    if (tooltip) tooltip.classList.remove('visible');
  }
});
