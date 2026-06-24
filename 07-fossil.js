// ============================================================
// 07-FOSSIL.js — Comment Fossils (AI revisits old takes after 30 days)
// ============================================================

function checkFossil(commentEntry) {
  if (!commentEntry || !commentEntry.time) return false;
  const ageMs = Date.now() - new Date(commentEntry.time).getTime();
  const days = ageMs / 86400000;
  return days >= 30 && !commentEntry.fossilShown;
}

async function revealFossil(articleId, e) {
  if (e) e.preventDefault();
  const article = window.allArticles?.find(a => a.id === articleId);
  const entry = getComment(articleId);
  const container = document.getElementById(`fossil-reveal-${articleId}`);
  const banner = document.getElementById(`fossil-${articleId}`);
  if (!article || !entry || !container) return;

  if (banner) banner.innerHTML = `<span>🦴</span><span>Looking back...</span>`;
  container.innerHTML = `<div class="thread"><div class="bubble ai"><div class="bubble-avatar">⏳</div><div class="bubble-content"><div class="bubble-name">Pulse AI · Looking back</div><div class="bubble-text"><div class="thinking-dots"><span></span><span></span><span></span></div></div></div></div></div>`;

  try {
    const revisit = await getFossilRevisit(article, entry.user);
    container.innerHTML = `<div class="thread"><div class="bubble ai"><div class="bubble-avatar">⏳</div><div class="bubble-content"><div class="bubble-name">30 Days Later</div><div class="bubble-text">${revisit}</div></div></div></div>`;
    markFossilShown(articleId);
    if (banner) banner.style.display = 'none';
  } catch {
    container.innerHTML = '';
    if (banner) banner.innerHTML = `<span>🦴</span><span>Couldn't look back right now. Try again later.</span>`;
  }
}
