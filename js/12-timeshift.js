// ============================================================
// 12-TIMESHIFT.js — Time-Shifted Reframe (10 years ago perspective)
// ============================================================

async function getTimeShiftedVersion(article) {
  const system = `Rewrite this modern headline and one-sentence summary as if it were written by a journalist 10 years ago — same core event, but period-appropriate language, assumptions, and framing. Return valid JSON: { "title": "...", "body": "..." }`;
  const content = `Modern headline: "${article.title}"
Modern summary: ${article.body}`;
  try {
    const text = await callClaude(system, content, 200);
    const clean = text.replace(/```json|```/gi, '').trim();
    const start = clean.indexOf('{');
    const end = clean.lastIndexOf('}');
    if (start === -1 || end === -1) return null;
    return JSON.parse(clean.slice(start, end + 1));
  } catch { return null; }
}

async function showTimeShift(articleId, e) {
  if (e) e.preventDefault();
  const btn = e?.target;
  const article = window.allArticles?.find(a => a.id === articleId);
  const container = document.getElementById(`timeshift-${articleId}`);
  if (!article || !container) return;

  if (btn) { btn.disabled = true; btn.textContent = '🕰️ Time-traveling...'; }
  container.innerHTML = `<div class="thinking-dots" style="margin:8px 0;"><span></span><span></span><span></span></div>`;

  try {
    const shifted = await getTimeShiftedVersion(article);
    if (shifted) {
      container.innerHTML = `
        <div style="background:var(--bg-inset);border-radius:12px;padding:12px;margin:8px 0;border-left:3px solid var(--label3);">
          <div style="font-size:10.5px;text-transform:uppercase;letter-spacing:0.06em;color:var(--label3);margin-bottom:6px;">10 Years Ago, This Might Have Read:</div>
          <div style="font-size:14px;font-weight:700;margin-bottom:4px;">${escHtml(shifted.title)}</div>
          <div style="font-size:13px;color:var(--label2);line-height:1.5;">${escHtml(shifted.body)}</div>
        </div>`;
    } else {
      container.innerHTML = `<div style="font-size:12px;color:var(--label3);margin:6px 0;">Couldn't time-travel right now.</div>`;
    }
  } catch {
    container.innerHTML = `<div style="font-size:12px;color:var(--label3);margin:6px 0;">Couldn't time-travel right now.</div>`;
  }
  if (btn) btn.remove();
}