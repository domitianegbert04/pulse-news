// ============================================================
// CORE.js — News Fetch, Claude API, Rendering, Storage, Feed Assembly
// ============================================================

// ── CONFIG ────────────────────────────────────────────────────────────────────
const NEWSDATA_KEY = 'pub_87199f9f7c204d5faec86ed2bed0cd2c3c73';

const TOPIC_CATEGORY = {
  Tech: 'technology', Science: 'science', World: 'world',
  Business: 'business', Health: 'health', Space: 'science', Climate: 'environment',
};

const TAG_ICON = {
  Tech: '⚡', Science: '🔬', World: '🌍', Business: '📈',
  Health: '❤️', Space: '🚀', Climate: '🌿'
};

// CORS proxies — free-tier APIs block GitHub Pages origins
const CORS_PROXIES = [
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
  (url) => `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(url)}`,
];

// ── STATE ──────────────────────────────────────────────────────────────────────
let allArticles = [];
let displayedCount = 0;
let isLoading = false;
let activeFilter = 'all';
let cardCounter = 0;
const PAGE_SIZE = 5;

const COMMENTS_KEY = 'pulse_comments_v4';

// ── AI API ─────────────────────────────────────────────────────────────────────
async function callClaude(systemPrompt, userContent, maxTokens = 280) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }]
    })
  });
  if (!res.ok) throw new Error(`Claude API error ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text?.trim() || '';
}

// ── AI FEATURES (called by feature modules) ────────────────────────────────────
async function getAIResponse(article, userComment) {
  const system = `You are Pulse AI — sharp, curious, globally-minded. A reader shared their take on a news story.
1. Briefly acknowledge their view (1 sentence, no sycophancy)
2. Add 2-3 specific facts or angles they likely don't know
3. Connect it to a broader trend
4. End with one sharp forward-looking thought
Under 150 words. Flowing prose, no bullet points. Never start with "Great point".`;
  const content = `Story: "${article.title}"
Context: ${article.body}
Question: "${article.question}"
Reader's response: "${userComment}"`;
  return await callClaude(system, content, 280);
}

async function getFossilRevisit(article, oldComment) {
  const system = `You are Pulse AI. A reader commented on a news story over 30 days ago. Revisit their take now: gently note what's happened since (use general world knowledge, acknowledge uncertainty if you don't know specifics), and ask if their view changed. Under 90 words, conversational, not preachy.`;
  const content = `Story: "${article.title}"
Their take from a month ago: "${oldComment}"`;
  return await callClaude(system, content, 180);
}

async function getCompressionSummary(articles) {
  const system = `You are Pulse AI's "60-Second Mode." Given several news headlines, write ONE tight paragraph (max 90 words) that synthesizes what's happening across all of them — find the thread connecting them if one exists, otherwise just compress efficiently. No bullet points, no headers, flowing prose.`;
  const content = articles.map(a => `- [${a.topic}] ${a.title}: ${a.body}`).join('\n');
  return await callClaude(system, content, 220);
}

// ── NEWS FETCHING ────────────────────────────────────────────────────────────
function classifyTopic(title, desc) {
  const text = (title + ' ' + (desc || '')).toLowerCase();
  if (/space|nasa|spacex|rocket|satellite|asteroid|mars|moon|orbit/.test(text)) return 'Space';
  if (/climate|carbon|emission|renewable|solar|wind energy|glacier|temperature/.test(text)) return 'Climate';
  if (/health|hospital|vaccine|disease|cancer|mental health|medicine|drug/.test(text)) return 'Health';
  if (/\bai\b|artificial intelligence|machine learning|openai|deepmind|semiconductor|software/.test(text)) return 'Tech';
  if (/science|research|study finds|discovery|biology|physics|chemistry|genome/.test(text)) return 'Science';
  if (/market|stock|economy|gdp|inflation|startup|ipo|revenue|investment|crypto/.test(text)) return 'Business';
  return 'World';
}

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)
    + '-' + Math.random().toString(36).slice(2, 6);
}

function generateQuestion(title, description) {
  const text = (title + ' ' + (description || '')).toLowerCase();
  if (/ai|artificial intelligence|machine learning|robot/.test(text))
    return 'Will AI developments like this help or threaten people in your field?';
  if (/climate|emission|carbon|renewable|fossil/.test(text))
    return 'Does your country feel the effects of this climate issue yet?';
  if (/war|conflict|attack|missile|troops|military/.test(text))
    return 'How do conflicts like this reshape global power dynamics?';
  if (/health|disease|virus|cancer|vaccine|hospital/.test(text))
    return 'How prepared do you think your country is for health challenges like this?';
  if (/space|rocket|nasa|satellite|moon|mars/.test(text))
    return 'Should governments prioritize space exploration over other pressing issues?';
  if (/economy|inflation|recession|gdp|market|stock/.test(text))
    return 'How are economic shifts like this affecting your daily life?';
  if (/election|president|government|parliament|democracy|vote/.test(text))
    return 'What does this political development signal for global democracy?';
  if (/tech|software|app|startup|data|privacy|cyber/.test(text))
    return 'How much do developments like this shape your digital life?';
  if (/science|discovery|research|study|experiment/.test(text))
    return 'How might this scientific finding change the way we live?';
  if (/energy|oil|gas|nuclear|solar|power/.test(text))
    return 'Is your country moving fast enough on energy transition?';
  return 'What does this story reveal about where the world is heading?';
}

async function fetchWithCorsFallback(targetUrl) {
  let lastError = null;
  try {
    const res = await fetch(targetUrl);
    if (res.ok) return res;
    lastError = new Error(`Direct HTTP ${res.status}`);
  } catch (e) { lastError = e; }

  for (const buildProxyUrl of CORS_PROXIES) {
    try {
      const res = await fetch(buildProxyUrl(targetUrl));
      if (res.ok) return res;
      lastError = new Error(`Proxy HTTP ${res.status}`);
    } catch (e) { lastError = e; }
  }
  throw lastError || new Error('All fetch attempts failed');
}

async function fetchNews(topics, existingIds = []) {
  const topic = topics[Math.floor(Math.random() * topics.length)];
  const category = TOPIC_CATEGORY[topic] || 'world';
  const url = `https://newsdata.io/api/1/latest?apikey=${NEWSDATA_KEY}&language=en&category=${category}&size=10`;

  let res;
  try { res = await fetchWithCorsFallback(url); }
  catch (e) { throw new Error('CORS_OR_NETWORK_BLOCK: ' + e.message); }

  if (!res.ok) {
    let txt = '';
    try { txt = await res.text(); } catch {}
    throw new Error(`NEWSDATA_HTTP_${res.status}: ${txt}`);
  }

  const data = await res.json();
  if (data.status !== 'success') throw new Error('NEWSDATA_API_ERROR: ' + JSON.stringify(data));

  const raw = (data.results || []).filter(a => a.title && a.description && a.description.length > 40);
  if (raw.length === 0) throw new Error('NO_ARTICLES: NewsData returned zero usable articles');

  const batch = raw.slice(0, 6);
  return batch.map(a => ({
    id: slugify(a.title),
    topic: classifyTopic(a.title, a.description),
    title: a.title,
    body: a.description,
    question: generateQuestion(a.title, a.description),
    source: a.source_name || a.source_id || 'Global News',
    publishedAt: a.pubDate || new Date().toISOString(),
    url: a.link || '#',
    imageUrl: a.image_url || null,
  }));
}

// ── COMMENT STORAGE ────────────────────────────────────────────────────────────
function getCommentStore() {
  try { return JSON.parse(localStorage.getItem(COMMENTS_KEY) || '{}'); }
  catch { return {}; }
}

function saveComment(articleId, userText, aiText, extra = {}) {
  const store = getCommentStore();
  store[articleId] = { user: userText, ai: aiText, time: new Date().toISOString(), ...extra };
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(store));
}

function getComment(articleId) {
  return getCommentStore()[articleId] || null;
}

function markFossilShown(articleId) {
  const store = getCommentStore();
  if (store[articleId]) {
    store[articleId].fossilShown = true;
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(store));
  }
}

// ── RENDERING ──────────────────────────────────────────────────────────────────
function timeAgo(iso) {
  if (!iso) return 'just now';
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

function escHtml(s) {
  return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function renderCard(article, indexInBatch) {
  const icon = TAG_ICON[article.topic] || '📰';
  const tagCls = 'tag-' + article.topic.toLowerCase();
  const existing = getComment(article.id);
  const card = document.createElement('div');
  card.className = 'card';
  card.id = `card-${article.id}`;
  card.style.animationDelay = `${(indexInBatch % PAGE_SIZE) * 60}ms`;

  if (article.isCounter) card.classList.add('counter-card');

  const commentHTML = existing
    ? buildThreadHTML(article, existing)
    : buildInputHTML(article.id);

  const imageHTML = article.imageUrl
    ? `<div class="card-image-wrap">
         <img class="card-image" src="${article.imageUrl}" alt="" loading="lazy"
              onload="this.classList.add('loaded')"
              onerror="this.parentElement.innerHTML='<div class=card-image-fallback>${icon}</div>'">
       </div>`
    : `<div class="card-image-wrap"><div class="card-image-fallback">${icon}</div></div>`;

  const counterLabel = article.isCounter
    ? `<div style="font-size:11px;color:var(--orange);font-weight:600;margin-bottom:6px;">↺ COUNTER-TAKE on "${escHtml(article.sourceTitle).slice(0,50)}..."</div>`
    : '';

  card.innerHTML = `
    ${imageHTML}
    <div class="card-top">
      <div class="card-meta">
        <span class="card-tag ${article.isCounter ? 'tag-counter' : tagCls}">${article.isCounter ? '↺' : icon} ${article.isCounter ? 'Counter-Take' : article.topic}</span>
        <span class="card-time">${timeAgo(article.publishedAt)}</span>
      </div>
      ${counterLabel}
      <div class="card-title">${escHtml(article.title)}</div>
      <div class="card-body">${escHtml(article.body)}</div>
      ${!article.isCounter ? `<div id="timeshift-${article.id}"></div>
      <button class="debate-btn" style="margin-top:8px;font-size:11.5px;padding:6px 10px;" onclick="showTimeShift('${article.id}', event)">🕰️ See this headline 10 years ago</button>` : ''}
      ${!article.isCounter ? `<div class="card-source">
        <span class="source-dot"></span>
        <span>${escHtml(article.source || 'Global News')}</span>
        ${article.url && article.url !== '#' ? `<a href="${article.url}" target="_blank" rel="noopener">Read →</a>` : ''}
      </div>` : ''}
    </div>
    <div class="card-question-wrap">
      <div class="card-question-label">Ask yourself</div>
      <div class="card-question-text">${escHtml(article.question)}</div>
    </div>
    <div class="card-divider"></div>
    <div class="comment-section" id="cs-${article.id}">${commentHTML}</div>
  `;

  if (!article.isCounter) {
    const bodyEl = card.querySelector('.card-body');
    applyDecayOverlay(bodyEl, article.publishedAt);
  }

  return card;
}

function buildInputHTML(articleId) {
  return `
    <div class="comment-input-wrap">
      <textarea class="comment-input" id="ta-${articleId}" placeholder="Share your thoughts…" rows="3"></textarea>
      <div class="comment-actions">
        <button class="debate-btn" onclick="submitComment('${articleId}', true)">⚔️ Get both sides</button>
        <button class="comment-send" onclick="submitComment('${articleId}', false)">Send ↑</button>
      </div>
    </div>
  `;
}

function buildThreadHTML(article, entry) {
  const t = entry.time ? new Date(entry.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  let fossilHTML = '';

  if (checkFossil(entry)) {
    fossilHTML = `<div class="fossil-banner" id="fossil-${article.id}">
      <span>🦴</span>
      <span>You said this 30+ days ago. <a href="#" onclick="revealFossil('${article.id}', event)" style="color:#8A5A00;font-weight:600;">See what's changed →</a></span>
    </div>`;
  }

  if (entry.debate) {
    return `
      ${fossilHTML}
      <div class="thread">
        <div class="bubble user">
          <div class="bubble-avatar">YOU</div>
          <div class="bubble-content"><div class="bubble-name">You</div><div class="bubble-text">${escHtml(entry.user)}</div><div class="bubble-time">${t}</div></div>
        </div>
        <div class="bubble ai optimist">
          <div class="bubble-avatar">+</div>
          <div class="bubble-content"><div class="bubble-name">Optimist AI</div><div class="bubble-text">${entry.optimist}</div></div>
        </div>
        <div class="bubble ai skeptic">
          <div class="bubble-avatar">−</div>
          <div class="bubble-content"><div class="bubble-name">Skeptic AI</div><div class="bubble-text">${entry.skeptic}</div></div>
        </div>
      </div>
      <div id="fossil-reveal-${article.id}"></div>
    `;
  }

  return `
    ${fossilHTML}
    <div class="thread">
      <div class="bubble user">
        <div class="bubble-avatar">YOU</div>
        <div class="bubble-content"><div class="bubble-name">You</div><div class="bubble-text">${escHtml(entry.user)}</div><div class="bubble-time">${t}</div></div>
      </div>
      <div class="bubble ai">
        <div class="bubble-avatar">AI</div>
        <div class="bubble-content"><div class="bubble-name">Pulse AI</div><div class="bubble-text">${entry.ai}</div><div class="bubble-time">Just now</div></div>
      </div>
    </div>
    <div id="fossil-reveal-${article.id}"></div>
  `;
}

// ── SUBMIT COMMENT ─────────────────────────────────────────────────────────────
async function submitComment(articleId, debateMode) {
  const ta = document.getElementById(`ta-${articleId}`);
  const cs = document.getElementById(`cs-${articleId}`);
  const userText = ta ? ta.value.trim() : '';
  if (!userText) {
    if (ta) { ta.style.borderColor = 'var(--red)'; setTimeout(() => ta.style.borderColor = '', 1500); }
    return;
  }

  const article = allArticles.find(a => a.id === articleId);
  if (!article) return;

  recordDnaEngagement(article.topic);
  logBiasStance(article.topic, classifyStance(userText));

  cs.innerHTML = `
    <div class="thread">
      <div class="bubble user"><div class="bubble-avatar">YOU</div><div class="bubble-content"><div class="bubble-name">You</div><div class="bubble-text">${escHtml(userText)}</div></div></div>
    </div>
    ${debateMode ? `
      <div class="thread" style="margin-top:10px;">
        <div class="bubble ai optimist"><div class="bubble-avatar">+</div><div class="bubble-content"><div class="bubble-name">Optimist AI</div><div class="bubble-text"><div class="thinking-dots"><span></span><span></span><span></span></div></div></div></div>
        <div class="bubble ai skeptic"><div class="bubble-avatar">−</div><div class="bubble-content"><div class="bubble-name">Skeptic AI</div><div class="bubble-text"><div class="thinking-dots"><span></span><span></span><span></span></div></div></div></div>
      </div>
    ` : `
      <div class="thread" style="margin-top:10px;">
        <div class="bubble ai"><div class="bubble-avatar">AI</div><div class="bubble-content"><div class="bubble-name">Pulse AI</div><div class="bubble-text"><div class="thinking-dots"><span></span><span></span><span></span></div></div></div></div>
      </div>
    `}
  `;

  try {
    if (debateMode) {
      const { optimist, skeptic } = await getDebateResponses(article, userText);
      saveComment(articleId, userText, null, { debate: true, optimist, skeptic });
      cs.innerHTML = buildThreadHTML(article, getComment(articleId));
    } else {
      const aiText = await getAIResponse(article, userText);
      saveComment(articleId, userText, aiText);
      cs.innerHTML = buildThreadHTML(article, getComment(articleId));
    }
  } catch (e) {
    cs.innerHTML = buildInputHTML(articleId);
    const newTa = document.getElementById(`ta-${articleId}`);
    if (newTa) { newTa.value = userText; newTa.style.borderColor = 'var(--red)'; }
  }
}

// ── FEED ASSEMBLY ──────────────────────────────────────────────────────────────
function filteredArticles() {
  if (activeFilter === 'all') return allArticles.filter(a => !a.isCounter);
  return allArticles.filter(a => a.topic === activeFilter && !a.isCounter);
}

async function displayNextPage() {
  const articles = filteredArticles();
  const slice = articles.slice(displayedCount, displayedCount + PAGE_SIZE);
  const feed = document.getElementById('feed');

  for (let i = 0; i < slice.length; i++) {
    const article = slice[i];
    cardCounter++;

    const card = renderCard(article, i);
    feed.appendChild(card);
    startPaceTracking(card, article.id);

    if (i === 0) playAmbientForTopic(article.topic);

    if (cardCounter % 7 === 0) {
      feed.appendChild(renderSilentCard());
    }

    if (cardCounter % 5 === 0) {
      generateCounterCard(article).then(counter => {
        if (counter) {
          allArticles.push(counter);
          const counterCard = renderCard(counter, 0);
          feed.appendChild(counterCard);
        }
      }).catch(() => {});
    }
  }

  displayedCount += slice.length;
}

// ── SKELETONS / STATES ───────────────────────────────────────────────────────
function showSkeletons(n = 3) {
  const feed = document.getElementById('feed');
  for (let i = 0; i < n; i++) {
    const sk = document.createElement('div');
    sk.className = 'skeleton-card';
    sk.innerHTML = `<div class="skel skel-tag"></div><div class="skel skel-title"></div><div class="skel skel-title2"></div><div class="skel skel-body"></div><div class="skel skel-body2"></div><div class="skel skel-body3"></div>`;
    feed.appendChild(sk);
  }
}

function clearSkeletons() {
  document.querySelectorAll('.skeleton-card').forEach(el => el.remove());
}

// ── LOAD / REFRESH / FILTER / INFINITE SCROLL ─────────────────────────────────
async function loadMore() {
  if (isLoading) return;
  isLoading = true;
  document.getElementById('load-spinner').classList.add('visible');

  try {
    const topics = activeFilter === 'all'
      ? ['Tech','Science','World','Business','Health','Space','Climate']
      : [activeFilter];
    const existingIds = allArticles.map(a => a.id);
    const newArticles = await fetchNews(topics, existingIds);
    allArticles.push(...newArticles);
    await displayNextPage();
  } catch (err) {
    console.error('Load more failed:', err);
    if (displayedCount === 0) {
      document.getElementById('feed').innerHTML = `
        <div class="state-card">
          <div class="state-icon">📡</div>
          <div class="state-title">Couldn't load news</div>
          <div class="state-body">Check your connection and try again.</div>
          <button class="state-btn" onclick="refreshFeed()">Try again</button>
        </div>`;
    }
  }

  document.getElementById('load-spinner').classList.remove('visible');
  isLoading = false;
}

async function initialLoad() {
  const feed = document.getElementById('feed');
  feed.innerHTML = '';
  displayedCount = 0;
  cardCounter = 0;
  showSkeletons(4);

  try {
    const topics = ['Tech','Science','World','Business','Health','Space','Climate'];
    allArticles = await fetchNews(topics, []);
  } catch (err) {
    clearSkeletons();
    const reason = err.message || 'Unknown error';
    let humanHint = 'Check your connection and try again.';
    if (reason.startsWith('CORS_OR_NETWORK_BLOCK')) {
      humanHint = 'The news source likely blocks direct requests from this app (CORS), or your device has no connection right now.';
    } else if (reason.includes('NEWSDATA_HTTP_401') || reason.includes('NEWSDATA_HTTP_403')) {
      humanHint = 'The news API key was rejected (invalid, expired, or out of free credits).';
    } else if (reason.includes('NEWSDATA_HTTP_429')) {
      humanHint = 'Daily free-tier limit reached on the news source. Try again tomorrow.';
    } else if (reason.startsWith('NO_ARTICLES')) {
      humanHint = 'The news source responded but had nothing usable right now.';
    }
    feed.innerHTML = `
      <div class="state-card">
        <div class="state-icon">📡</div>
        <div class="state-title">Couldn't fetch today's news</div>
        <div class="state-body">${humanHint}</div>
        <div style="margin-top:10px;font-size:11px;color:var(--label3);word-break:break-word;font-family:monospace;">${escHtml(reason.slice(0, 200))}</div>
        <button class="state-btn" onclick="refreshFeed()">Try again</button>
      </div>`;
    isLoading = false;
    return;
  }

  clearSkeletons();
  await displayNextPage();
  renderBiasMirrorBanner();
  isLoading = false;
}

function refreshFeed() {
  document.getElementById('refresh-btn').classList.add('spinning');
  initialLoad().then(() => document.getElementById('refresh-btn').classList.remove('spinning'));
}

document.getElementById('chips').addEventListener('click', e => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  activeFilter = chip.dataset.topic;
  displayedCount = 0;
  cardCounter = 0;
  document.getElementById('feed').innerHTML = '';

  const visible = filteredArticles();
  if (visible.length > 0) displayNextPage();
  else loadMore();
});

const observer = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && !isLoading) {
    const visible = filteredArticles();
    if (displayedCount < visible.length) displayNextPage();
    else loadMore();
  }
}, { rootMargin: '200px' });
observer.observe(document.getElementById('load-trigger'));

// ── KEYBOARD SHORTCUT ─────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey && e.target.classList.contains('comment-input')) {
    e.preventDefault();
    const id = e.target.id.replace('ta-', '');
    submitComment(id, false);
  }
});

// ── BOOT ─────────────────────────────────────────────────────────────────────
initTheme();
renderDnaBadge();
initialLoad();
