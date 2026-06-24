// ============================================================
// 08-COUNTER.js — Counter-Cards (AI generates opposing perspective)
// ============================================================

async function generateCounterCard(sourceArticle) {
  const system = `You are a counter-argument generator for a news app. Given a news story, write the strongest good-faith OPPOSING perspective to the obvious reading of it. Return ONLY valid JSON, no markdown: {"title":"A punchy counter-headline","body":"2-3 sentences making the strongest opposing case, factual and fair, not strawmanning.","question":"A question that challenges the reader's assumption."}`;
  const content = `Original story: "${sourceArticle.title}"
Context: ${sourceArticle.body}`;
  try {
    const text = await callClaude(system, content, 300);
    const clean = text.replace(/```json|```/gi, '').trim();
    const start = clean.indexOf('{');
    const end = clean.lastIndexOf('}');
    if (start === -1 || end === -1) return null;
    const parsed = JSON.parse(clean.slice(start, end + 1));
    return {
      id: 'counter-' + sourceArticle.id,
      topic: sourceArticle.topic,
      title: parsed.title,
      body: parsed.body,
      question: parsed.question,
      isCounter: true,
      sourceTitle: sourceArticle.title
    };
  } catch { return null; }
}
