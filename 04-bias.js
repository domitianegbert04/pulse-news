// ============================================================
// 04-BIAS.js — Bias Mirror (weekly stance tracking, 60-day retention)
// ============================================================

const BIAS_KEY = 'pulse_bias_log_v1';

function classifyStance(userComment) {
  const text = userComment.toLowerCase();
  const skepticWords = /worried|danger|risk|concern|bad|harmful|threat|scary|against|distrust|problem|wrong|fail/;
  const optimistWords = /great|good|excited|hope|positive|benefit|opportunity|love|amazing|support|agree|exciting/;
  if (skepticWords.test(text) && !optimistWords.test(text)) return 'skeptic';
  if (optimistWords.test(text) && !skepticWords.test(text)) return 'optimist';
  return 'neutral';
}

function logBiasStance(topic, stance) {
  if (stance === 'neutral') return;
  let log = [];
  try { log = JSON.parse(localStorage.getItem(BIAS_KEY) || '[]'); } catch {}
  log.push({ topic, stance, time: Date.now() });
  const cutoff = Date.now() - (60 * 86400000);
  log = log.filter(e => e.time > cutoff);
  localStorage.setItem(BIAS_KEY, JSON.stringify(log));
}

function checkBiasMirror() {
  let log = [];
  try { log = JSON.parse(localStorage.getItem(BIAS_KEY) || '[]'); } catch {}
  const weekAgo = Date.now() - (7 * 86400000);
  const recent = log.filter(e => e.time > weekAgo);
  if (recent.length < 6) return null;

  const counts = { skeptic: 0, optimist: 0 };
  const topicCounts = {};
  recent.forEach(e => {
    counts[e.stance]++;
    topicCounts[e.topic] = (topicCounts[e.topic] || 0) + 1;
  });

  const dominant = counts.skeptic > counts.optimist ? 'skeptic' : 'optimist';
  const dominantCount = Math.max(counts.skeptic, counts.optimist);
  const total = counts.skeptic + counts.optimist;
  if (total === 0 || dominantCount / total < 0.7) return null;

  const topTopic = Object.entries(topicCounts).sort((a, b) => b[1] - a[1])[0][0];
  return { dominant, count: dominantCount, total, topic: topTopic };
}

function renderBiasMirrorBanner() {
  const result = checkBiasMirror();
  if (!result) return;
  const feed = document.getElementById('feed');
  const banner = document.createElement('div');
  banner.className = 'card';
  banner.style.background = 'linear-gradient(135deg, #2C2C2E, #1C1C1E)';
  banner.style.color = '#fff';
  banner.innerHTML = `
    <div style="padding:18px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#AF52DE;margin-bottom:8px;">🪞 Bias Mirror</div>
      <div style="font-size:14px;line-height:1.6;">
        You've leaned <strong>${result.dominant}</strong> on ${result.count} of ${result.total} ${result.topic} stories this week.
        Worth reading something that pushes back on that lean today.
      </div>
    </div>
  `;
  feed.prepend(banner);
}
