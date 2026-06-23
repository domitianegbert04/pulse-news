// ============================================================
// 12-TIMESHIFT.js — Time-Shifted Reframe (10 years ago)
// ============================================================

async function triggerTimeShift(articleId) {
  const view = document.getElementById(`timeshift-${articleId}`);
  const text = document.getElementById(`timeshift-text-${articleId}`);
  const article = window.allArticles?.find(a => a.id === articleId);
  if (!view || !text || !article) return;

  view.classList.add('visible');
  text.innerHTML = '<div class="thinking-dots"><span></span><span></span><span></span></div>';

  await new Promise(r => setTimeout(r, 1500));

  const periodFramings = {
    Tech: `2014 TechCrunch Headline: "${article.title.replace(/Neural|AI|Edge/g, 'Cloud').replace(/framework/g, 'platform')}" — Analysts warn the 'phone processing' claim ignores battery constraints. VCs remain skeptical after the Google Glass debacle.`,
    Science: `2014 Nature Blog: "${article.title.replace(/Ambient/g, 'High-Temperature').replace(/standard indoor/g, 'liquid nitrogen')}" — Peer reviewers note the 'room temperature' claim lacks independent replication. Previous superconductor claims collapsed within months.`,
    World: `2014 FT Alphaville: "${article.title.replace(/decentralized nodes/g, 'proprietary databases')}" — Supply chain experts call blockchain a solution looking for a problem. UPS and FedEx decline to comment on 'ledger' pilots.`,
    Business: `2014 WSJ Markets: "${article.title.replace(/Automated Market Makers/g, 'High-Frequency Trading')}" — Regulators struggle to define 'decentralized' assets. The CFTC warns of enforcement gaps. Mt. Gox collapse still fresh in memory.`,
    Health: `2014 NEJM Watch: "${article.title.replace(/RNA Degradation/g, 'Gene Therapy')}" — FDA places hold on similar lipid nanoparticle trials after immune responses in primates. Long-term safety data 'a decade away.'`,
    Space: `2014 SpaceNews: "${article.title.replace(/Autonomous/g, 'Proposed').replace(/without remote operator/g, 'with ground control')}" — NASA budget cuts delay orbital servicing. SpaceX focuses on reusability, not refueling. Congress skeptical.`,
    Climate: `2014 Guardian Environment: "${article.title.replace(/Perovskite/g, 'Solar').replace(/High-Density/g, 'Experimental')}" — Energy analysts doubt grid-scale viability. German solar subsidies face cuts. 'Too early to call,' says IEA.`
  };

  text.textContent = periodFramings[article.topic] || `2014 Perspective: "${article.title}" — Industry observers urge caution. Early adopters face unproven risks. Regulatory frameworks unclear.`;
}
