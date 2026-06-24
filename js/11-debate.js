// ============================================================
// 11-DEBATE.js — Two-AI Debate (parallel Optimist vs Skeptic)
// ============================================================

async function getDebateResponses(article, userComment) {
  const optimistSystem = `You are "Optimist AI" in a debate. A reader shared a take on a news story. Respond in 2-3 sentences arguing the hopeful, opportunity-focused interpretation of this story. Be specific, direct, no preamble.`;
  const skepticSystem = `You are "Skeptic AI" in a debate. A reader shared a take on a news story. Respond in 2-3 sentences arguing the cautious, risk-focused interpretation of this story. Be specific, direct, no preamble.`;
  const content = `Story: "${article.title}"
Context: ${article.body}
Reader said: "${userComment}"`;

  const [optimist, skeptic] = await Promise.all([
    callClaude(optimistSystem, content, 150),
    callClaude(skepticSystem, content, 150)
  ]);
  return { optimist, skeptic };
}