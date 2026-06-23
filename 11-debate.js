// ============================================================
// 11-DEBATE.js — Two-AI Debate (Optimist vs Skeptic)
// ============================================================

async function triggerDebate(articleId) {
  const view = document.getElementById(`debate-${articleId}`);
  const bubbles = document.getElementById(`debate-bubbles-${articleId}`);
  const article = window.allArticles?.find(a => a.id === articleId);
  if (!view || !bubbles || !article) return;

  view.classList.add('visible');
  bubbles.innerHTML = `
    <div class="debate-bubble optimist">
      <div class="debate-avatar">OPT</div>
      <div class="debate-content">
        <div class="debate-name">Optimist AI</div>
        <div class="debate-text"><div class="thinking-dots"><span></span><span></span><span></span></div></div>
      </div>
    </div>
    <div class="debate-bubble skeptic">
      <div class="debate-avatar">SKP</div>
      <div class="debate-content">
        <div class="debate-name">Skeptic AI</div>
        <div class="debate-text"><div class="thinking-dots"><span></span><span></span><span></span></div></div>
      </div>
    </div>`;

  await new Promise(r => setTimeout(r, 1500));

  const optimistReplies = [
    `This represents a genuine paradigm shift. The efficiency gains alone justify accelerated adoption, and early pilot data suggests the scaling curve is more favorable than skeptics assume.`,
    `The underlying technology has crossed the threshold from experimental to operational. We're seeing network effects that compound weekly, making first-mover advantages significant.`,
    `Historical parallels to the early internet are apt here. The infrastructure challenges are real but transient; the fundamental capability unlock is permanent.`
  ];

  const skepticReplies = [
    `The pilot data covers controlled conditions, not production scale. Every similar technology has faced a 'valley of death' between proof-of-concept and reliable deployment.`,
    `Network effects cut both ways — early standardization around an immature protocol creates costly lock-in when flaws emerge post-adoption. The rush to deploy is the risk.`,
    `The internet comparison is precisely the cautionary tale. Decades of security debt, monopolistic concentration, and unanticipated externalities followed that 'paradigm shift'.`
  ];

  const optText = optimistReplies[Math.floor(Math.random() * optimistReplies.length)];
  const skpText = skepticReplies[Math.floor(Math.random() * skepticReplies.length)];

  bubbles.innerHTML = `
    <div class="debate-bubble optimist">
      <div class="debate-avatar">OPT</div>
      <div class="debate-content">
        <div class="debate-name">Optimist AI</div>
        <div class="debate-text">${optText}</div>
      </div>
    </div>
    <div class="debate-bubble skeptic">
      <div class="debate-avatar">SKP</div>
      <div class="debate-content">
        <div class="debate-name">Skeptic AI</div>
        <div class="debate-text">${skpText}</div>
      </div>
    </div>`;
}
