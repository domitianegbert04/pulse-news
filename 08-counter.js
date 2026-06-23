// ============================================================
// 08-COUNTER.js — Counter-Cards (opposing viewpoints)
// ============================================================

async function generateCounterCard(original) {
  await new Promise(r => setTimeout(r, 800));

  const counterTitles = {
    Tech: "The Hidden Cost of Edge Intelligence: Why Local Processing Creates New Vulnerabilities",
    Science: "Room-Temperature Superconductivity: Replication Concerns and Measurement Errors",
    World: "Blockchain Logistics: Why Decentralized Tracking May Slow Critical Supply Chains",
    Business: "DeFi Regulation: The Risks of Unclear Jurisdictional Oversight",
    Health: "RNA Therapies: Long-Term Immune System Impacts Still Unstudied",
    Space: "Orbital Refueling: The Debris Risk No One Is Modeling",
    Climate: "Perovskite Solar: Manufacturing Waste and Rare Earth Dependencies"
  };

  const counterBodies = {
    Tech: "While edge processing reduces latency, it fragments security models and increases the attack surface across millions of endpoints rather than hardened data centers.",
    Science: "Independent labs have struggled to reproduce the magnetic flux measurements, suggesting possible instrumentation artifacts rather than genuine superconductivity.",
    World: "Decentralized ledgers introduce consensus delays that conflict with real-time logistics requirements, potentially creating bottlenecks during peak shipping periods.",
    Business: "Without unified regulatory frameworks, cross-border DeFi settlements face legal ambiguity that could freeze transactions during market stress events.",
    Health: "The lipid delivery mechanism may trigger unintended immune responses in long-term studies, a variable excluded from current short-term trial designs.",
    Space: "Each docking maneuver increases collision probability in already-crowded orbital bands, yet no international body tracks refueling debris risk.",
    Climate: "Perovskite cells require lead or rare earth elements in manufacturing, creating extraction impacts that offset some of the operational carbon savings."
  };

  return {
    id: `counter-${original.id}`,
    topic: original.topic,
    title: counterTitles[original.topic] || "Alternative Perspective",
    body: counterBodies[original.topic] || "A critical examination of the assumptions underlying this development.",
    source: "Pulse Counter-Analysis Desk",
    tagText: `⚠️ Counter: ${original.tagText}`,
    question: "What evidence would change your mind on this topic?",
    isCounter: true,
    originalId: original.id,
    pubDate: original.pubDate
  };
}
