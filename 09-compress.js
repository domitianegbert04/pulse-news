// ============================================================
// 09-COMPRESS.js — 60-Second Compression Mode
// ============================================================

async function compressFeed() {
  const visible = window.allArticles?.slice(0, window.displayedCount || 0);
  if (!visible || visible.length === 0) return;

  const result = document.getElementById('compression-result');
  const text = document.getElementById('comp-text');
  if (!result || !text) return;

  text.innerHTML = '<div class="thinking-dots"><span></span><span></span><span></span></div>';
  result.classList.add('visible');
  result.scrollIntoView({ behavior: 'smooth' });

  await new Promise(r => setTimeout(r, 2000));

  const topics = [...new Set(visible.map(a => a.topic))];
  const summary = `In the last ${visible.length} stories: ${topics.join(', ')} dominated the feed. Key tension points include infrastructure scaling challenges, regulatory uncertainty around novel frameworks, and the gap between laboratory validation and real-world deployment. The throughline: technological optimism is consistently tempered by systemic implementation risks.`;

  text.textContent = summary;
}
