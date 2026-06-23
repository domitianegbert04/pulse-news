// ============================================================
// 10-SILENT.js — Silent Cards (deliberate pause cards)
// ============================================================

const silentPrompts = [
  { icon: "🌊", text: "Take a breath. Notice what you're feeling right now before reading on.", sub: "No headline here — just space." },
  { icon: "🌿", text: "Information flows endlessly. What would you choose to remember from today?", sub: "A moment of reflection." },
  { icon: "🌙", text: "Not every gap needs filling. Rest your attention here for a moment.", sub: "Silence is also information." },
  { icon: "🍃", text: "Before the next story shapes your thinking — what do you already believe about this topic?", sub: "Check your priors." },
  { icon: "🔥", text: "The firehose of news never stops. You can pause without missing anything essential.", sub: "This is a deliberate gap." },
  { icon: "💎", text: "Quality over quantity. Which of the last 5 stories actually changed your mind?", sub: "Reflect before continuing." }
];

function createSilentCard(index) {
  const prompt = silentPrompts[index % silentPrompts.length];
  const card = document.createElement('div');
  card.className = 'card silent-card';
  card.innerHTML = `<div class="silent-icon">${prompt.icon}</div><div class="silent-text">${prompt.text}</div><div class="silent-sub">${prompt.sub}</div>`;
  return card;
}
