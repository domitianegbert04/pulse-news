// ============================================================
// CORE.js — Feed System, Storage, Rendering, Initialization
// ============================================================

let allArticles = [];
let displayedCount = 0;
let isLoading = false;
let activeFilter = 'all';
const PAGE_SIZE = 5;
let visibleArticles = new Set();

const STORAGE_COMMENTS = 'pulse_comments_v4';

function getStorage() {
  try { return JSON.parse(localStorage.getItem(STORAGE_COMMENTS) || '{}'); } catch { return {}; }
}

function saveComment(articleId, userText, aiText) {
  const store = getStorage();
  store[articleId] = { user: userText, ai: aiText, time: new Date().toISOString() };
  localStorage.setItem(STORAGE_COMMENTS, JSON.stringify(store));
}

function generateLocalMockFeed() {
  const dataPool = [
    { topic: 'Tech', title: "Neural Mesh Architecture Eliminates Data Center Latency", body: "Engineers finalized an edge-intelligence framework capable of hosting full foundational arrays directly within lightweight phone processing units, reducing cloud dependency by 90%.", tag: "⚡ Tech", question: "How do you think this structural shift impacts operations in your immediate professional workspace?" },
    { topic: 'Science', title: "Ambient Superconductivity Validated in Crystalline Synthetics", body: "Research teams confirmed uniform magnetic flux pinning patterns within processed chemical compounds running at standard indoor ambient temperatures, potentially revolutionizing power transmission.", tag: "🔬 Science", question: "What applications of room-temperature superconductivity would most impact your daily life?" },
    { topic: 'World', title: "Global Logistics Corridors Pivot Toward Isolated Ledgers", body: "International cargo transport lanes completed standard baseline testing transitions to route primary tracking data over decentralized nodes, eliminating single-point-of-failure risks.", tag: "🌍 World", question: "Do you trust decentralized systems more or less than centralized ones for critical infrastructure?" },
    { topic: 'Business', title: "Sovereign Framework Restructures Automated Market Makers", body: "Financial authorities approved continuous system guidelines to settle asset transfers without reliance on central clearings, enabling 24/7 cross-border liquidity pools.", tag: "📈 Business", question: "How might DeFi regulation reshape traditional banking in your region?" },
    { topic: 'Health', title: "Targeted RNA Degradation Decelerates Cellular Senescence Markers", body: "Clinical biogroups verified synthetic lipid carriers safely delivered targeted transcripts downregulating aging metabolic variants in primate trials with zero adverse events.", tag: "❤️ Health", question: "If aging therapies become available, what ethical concerns should society address first?" },
    { topic: 'Space', title: "Autonomous Orbital Refueling Hub Completes Liquid Docking System", body: "Automated standard service vehicles locked fluid line connection vectors across structural margins without remote operator signals, proving fully autonomous space servicing.", tag: "🚀 Space", question: "Does autonomous space infrastructure excite you or make you nervous?" },
    { topic: 'Climate', title: "High-Density Perovskite Arrays Stabilize Regional Grid Fractures", body: "Energy deployment sectors mapped consistent baseline additions delivering grid integration options under variable environment patterns, achieving 28% efficiency in field tests.", tag: "🌿 Climate", question: "What would convince you to switch to solar if you haven't already?" }
  ];

  let list = [];
  for (let i = 0; i < 35; i++) {
    const baseline = dataPool[i % dataPool.length];
    const pubDate = new Date();
    pubDate.setHours(pubDate.getHours() - (i * 3));

    list.push({
      id: `art-${Date.now()}-${i}`,
      topic: baseline.topic,
      title: baseline.title,
      body: baseline.body,
      source: "Pulse Intelligence Desk",
      tagText: baseline.tag,
      question: baseline.question,
      pubDate: pubDate.toISOString(),
      imageUrl: `https://picsum.photos/seed/${Date.now() + i}/680/200`
    });
  }
  return list;
}

async function getAIResponse(article, userComment) {
  await new Promise(res => setTimeout(res, 1200));

  const bias = analyzeBias(userComment);
  recordBias(article.id, article.topic, bias);

  const strategicReplies = [
    `That directly hits the central issue. If we look closely at deployment parameters, the true bottleneck isn't standard engineering restrictions—it is organizational friction. Infrastructure panels are systemically slow, while this framework moves exponentially.`,
    `An excellent framework point. When these technical paradigms reach scale, the downstream execution cost falls to near zero, meaning historical monetization systems will likely have to adapt completely.`,
    `That is the exact micro friction layer. While localized optimization numbers look spectacular on paper, systemic risks rise because underlying network dependencies remain unhedged.`,
    `You raise a crucial tension. The capability is clearly there, but the governance and accountability structures lag by approximately two technology generations. That's where the real risk concentrates.`,
    `Precisely. The headline captures the innovation, but the footnotes reveal the constraints: energy density, regulatory ambiguity, and integration debt. The gap between demo and deploy is where most projects die.`
  ];
  return strategicReplies[Math.floor(Math.random() * strategicReplies.length)];
}

function renderCard(article, index) {
  const existing = getStorage()[article.id];
  const isFossil = shouldShowFossil(article.id);
  const card = document.createElement('div');
  card.className = `card ${article.isCounter ? 'counter-card' : ''}`;
  card.id = `card-${article.id}`;
  card.dataset.loadTime = Date.now();
  card.dataset.topic = article.topic;

  const paceHTML = '<div class="card-pace"></div>';

  let imageHTML = '';
  if (!article.isCounter && !article.isSilent) {
    imageHTML = `<div class="card-image-wrap"><img class="card-image" src="${article.imageUrl}" alt="" loading="lazy" onload="this.classList.add('loaded')"><div class="card-image-placeholder">${article.tagText.split(' ')[0]}</div></div>`;
  }

  let actionsHTML = '';
  if (!article.isCounter && !article.isSilent) {
    actionsHTML = `<div class="card-actions">
        <button class="card-action-btn debate-btn" onclick="triggerDebate('${article.id}')">⚔️ Get both sides</button>
        <button class="card-action-btn time-btn" onclick="triggerTimeShift('${article.id}')">🕰️ 10 years ago</button>
        ${isFossil ? `<button class="card-action-btn fossil-btn" onclick="showFossil('${article.id}')">🦴 See what's changed</button>` : ''}
      </div>`;
  }

  let debateHTML = `<div class="debate-view" id="debate-${article.id}"><div class="debate-header">⚔️ Two-AI Debate</div><div class="debate-bubbles" id="debate-bubbles-${article.id}"></div></div>`;
  let timeShiftHTML = `<div class="time-shift-view" id="timeshift-${article.id}"><div class="time-shift-header">🕰️ 2014 Perspective</div><div class="time-shift-text" id="timeshift-text-${article.id}"></div></div>`;
  let fossilHTML = `<div class="fossil-view" id="fossil-${article.id}"><div class="fossil-header">🦴 Comment Fossil</div><div class="fossil-text" id="fossil-text-${article.id}"></div></div>`;

  let commentHTML;
  if (article.isCounter) {
    commentHTML = `<div class="comment-section" style="padding:12px 16px 16px; font-size:13px; color:var(--label3); font-style:italic;">This is a counter-perspective card. It exists to challenge the assumptions in the preceding story.</div>`;
  } else if (article.isSilent) {
    commentHTML = '';
  } else {
    commentHTML = existing ? buildThreadHTML(existing.user, existing.ai, existing.time) : buildInputHTML(article.id);
  }

  const questionHTML = (!article.isCounter && !article.isSilent) ? `<div class="card-question-wrap"><div class="card-question-label">Ask yourself</div><div class="card-question-text">${article.question}</div></div>` : '';
  const dividerHTML = (!article.isSilent) ? '<div class="card-divider"></div>' : '';

  card.innerHTML = `${paceHTML}${imageHTML}<div class="card-top"><div class="card-meta"><span class="card-tag tag-${article.topic.toLowerCase()}">${article.tagText}</span><span class="card-time">${formatTime(article.pubDate)}</span></div><div class="card-title">${article.title}</div><div class="card-body">${article.body}</div><div class="card-source"><span class="source-dot"></span><span>${article.source}</span></div></div>${questionHTML}${actionsHTML}${debateHTML}${timeShiftHTML}${fossilHTML}${dividerHTML}<div class="comment-section" id="cs-${article.id}">${commentHTML}</div>`;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!visibleArticles.has(article.id)) {
          visibleArticles.add(article.id);
          recordTopicEngagement(article.topic);
          if (typeof soundEnabled !== 'undefined' && soundEnabled) playTopicTone(article.topic);
        }
      }
    });
  }, { threshold: 0.3 });
  obs.observe(card);

  return card;
}

function formatTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function buildInputHTML(id) {
  return `<div class="comment-input-wrap"><textarea class="comment-input" id="ta-${id}" placeholder="Share your thoughts..." rows="3"></textarea><button class="comment-send" onclick="submitComment('${id}')">Send ↑</button></div>`;
}

function buildThreadHTML(userText, aiText, time) {
  const t = time ? new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now';
  return `<div class="thread"><div class="bubble user"><div class="bubble-avatar">YOU</div><div class="bubble-content"><div class="bubble-name">You</div><div class="bubble-text">${escapeHtml(userText)}</div><div class="bubble-time">${t}</div></div></div><div class="bubble ai"><div class="bubble-avatar">AI</div><div class="bubble-content"><div class="bubble-name">Pulse AI</div><div class="bubble-text">${escapeHtml(aiText)}</div><div class="bubble-time">Just now</div></div></div></div>`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function submitComment(id) {
  const ta = document.getElementById(`ta-${id}`);
  const cs = document.getElementById(`cs-${id}`);
  const text = ta ? ta.value.trim() : '';
  if (!text) return;

  cs.innerHTML = `<div class="thread"><div class="bubble user"><div class="bubble-avatar">YOU</div><div class="bubble-content"><div class="bubble-text">${escapeHtml(text)}</div></div></div><div class="bubble ai"><div class="bubble-avatar">AI</div><div class="bubble-content"><div class="bubble-text"><div class="thinking-dots"><span></span><span></span><span></span></div></div></div></div></div>`;

  const article = allArticles.find(a => a.id === id);
  const reply = await getAIResponse(article, text);
  saveComment(id, text, reply);
  cs.innerHTML = buildThreadHTML(text, reply, new Date().toISOString());
}

function filteredArticles() {
  if (activeFilter === 'all') return allArticles;
  return allArticles.filter(a => a.topic === activeFilter);
}

async function displayNextPage() {
  const articles = filteredArticles();
  const slice = articles.slice(displayedCount, displayedCount + PAGE_SIZE);
  const feed = document.getElementById('feed');

  for (let i = 0; i < slice.length; i++) {
    const art = slice[i];
    feed.appendChild(renderCard(art, displayedCount + i));

    if ((displayedCount + i + 1) % 5 === 0 && i === slice.length - 1) {
      const counter = await generateCounterCard(art);
      feed.appendChild(renderCard(counter, displayedCount + i + 1));
      displayedCount++;
    }

    if ((displayedCount + i + 1) % 7 === 0 && i === slice.length - 1) {
      const silent = createSilentCard(Math.floor((displayedCount + i + 1) / 7));
      feed.appendChild(silent);
      displayedCount++;
    }
  }

  displayedCount += slice.length;
  initPaceTracking();

  if (displayedCount >= PAGE_SIZE) {
    const compBar = document.getElementById('compression-bar');
    if (compBar) compBar.classList.add('visible');
  }
}

function loadMore() {
  if (isLoading) return;
  isLoading = true;
  const spinner = document.getElementById('load-spinner');
  if (spinner) spinner.classList.add('visible');
  setTimeout(() => {
    displayNextPage();
    if (spinner) spinner.classList.remove('visible');
    isLoading = false;
  }, 500);
}

function initialLoad() {
  allArticles = generateLocalMockFeed();
  displayedCount = 0;
  visibleArticles.clear();
  const feed = document.getElementById('feed');
  if (feed) feed.innerHTML = '';
  const compResult = document.getElementById('compression-result');
  if (compResult) compResult.classList.remove('visible');
  displayNextPage();
}

function refreshFeed() {
  const btn = document.getElementById('refresh-btn');
  if (btn) btn.classList.add('spinning');
  displayedCount = 0;
  visibleArticles.clear();
  setTimeout(() => {
    initialLoad();
    if (btn) btn.classList.remove('spinning');
  }, 600);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  const chips = document.getElementById('chips');
  if (chips) {
    chips.addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeFilter = chip.dataset.topic;
      displayedCount = 0;
      visibleArticles.clear();
      const feed = document.getElementById('feed');
      if (feed) feed.innerHTML = '';
      const compResult = document.getElementById('compression-result');
      if (compResult) compResult.classList.remove('visible');
      displayNextPage();
    });
  }

  const loadTrigger = document.getElementById('load-trigger');
  if (loadTrigger) {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !isLoading && displayedCount < filteredArticles().length) {
        loadMore();
      }
    }, { rootMargin: '150px' });
    observer.observe(loadTrigger);
  }

  // Initialize
  initTheme();
  updateReadingDNA();
  checkBiasMirror();
  initialLoad();
});
