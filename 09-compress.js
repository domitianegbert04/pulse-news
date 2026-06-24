// ============================================================
// 09-COMPRESS.js — 60-Second Compression Mode (meta-summary)
// ============================================================

let compressionOpen = false;

async function toggleCompression() {
  const panel = document.getElementById('compression-panel');
  compressionOpen = !compressionOpen;

  if (!compressionOpen) { panel.classList.remove('visible'); return; }

  panel.classList.add('visible');
  panel.innerHTML = `<h3>⚡ Synthesizing</h3><div class="thinking-dots"><span></span><span></span><span></span></div>`;

  const visible = window.allArticles?.filter(a => !a.isCounter).slice(0, window.displayedCount || 6);
  if (!visible || visible.length === 0) {
    panel.innerHTML = `<h3>⚡ 60-Second Mode</h3><p>Load some stories first, then come back here.</p>`;
    return;
  }

  try {
    const summary = await getCompressionSummary(visible);
    panel.innerHTML = `<h3>⚡ If you only have 60 seconds</h3><p>${summary}</p>`;
  } catch {
    panel.innerHTML = `<h3>⚡ 60-Second Mode</h3><p>Couldn't generate a summary right now. Try again in a moment.</p>`;
  }
}
