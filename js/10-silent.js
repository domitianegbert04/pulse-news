// ============================================================
// 10-SILENT.js — Silent Cards (deliberate pause, no AI voice)
// ============================================================

const SILENT_PROMPTS = [
  "Before you scroll — what do you actually think happened here, before anyone tells you what to think?",
  "No AI take this time. Just sit with the last story for a second.",
  "This space is intentionally empty. What's your gut reaction to what you just read?",
  "Pause. What would you have predicted about this a year ago?"
];

function renderSilentCard() {
  const card = document.createElement('div');
  card.className = 'card silent-card';
  const prompt = SILENT_PROMPTS[Math.floor(Math.random() * SILENT_PROMPTS.length)];
  card.innerHTML = `<div class="silent-icon">◌</div><div class="silent-text">${prompt}</div>`;
  return card;
}