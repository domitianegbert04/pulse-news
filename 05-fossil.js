// ============================================================
// 05-FOSSIL.js — Comment Fossils (old comments resurface)
// ============================================================

const STORAGE_FOSSIL = 'pulse_fossil_v1';

function shouldShowFossil(articleId) {
  const store = JSON.parse(localStorage.getItem('pulse_comments_v4') || '{}');
  const comment = store[articleId];
  if (!comment || !comment.time) return false;

  const age = Date.now() - new Date(comment.time).getTime();
  const days = age / (1000 * 60 * 60 * 24);
  return days > 30;
}

function getFossilPrompt(article, oldComment) {
  const prompts = [
    `You previously said: "${oldComment.user.substring(0, 80)}..." Has your view on "${article.title}" shifted? What's changed since then?`,
    `Six months ago you engaged with this story. Looking back at "${article.title}" — do you still stand by your take?`,
    `Your past comment on this topic: "${oldComment.user.substring(0, 60)}..." With hindsight, what would you add or revise?`
  ];
  return prompts[Math.floor(Math.random() * prompts.length)];
}

async function showFossil(articleId) {
  const store = JSON.parse(localStorage.getItem('pulse_comments_v4') || '{}');
  const comment = store[articleId];
  const article = window.allArticles?.find(a => a.id === articleId);
  if (!comment || !article) return;

  const view = document.getElementById(`fossil-${articleId}`);
  const text = document.getElementById(`fossil-text-${articleId}`);
  if (!view || !text) return;

  text.innerHTML = '<div class="thinking-dots"><span></span><span></span><span></span></div>';
  view.classList.add('visible');

  await new Promise(r => setTimeout(r, 1500));

  const prompt = getFossilPrompt(article, comment);
  text.textContent = prompt;
}
