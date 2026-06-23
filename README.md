# Pulse — News You Actually Think About

**Live:** [domitianegbert04.github.io/pulse-news](https://domitianegbert04.github.io/pulse-news/)

Pulse is not a newsletter and not a feed you scroll past. It's a single-page news experience where every story comes with a question — and every answer you give gets a real response back. No accounts. No emails collected. No tracking sent anywhere. Everything lives in your browser.

## Why this exists

Most news apps are built to maximize time-on-app. Pulse is built to maximize *thinking time per story*. You read something, you're asked what you think, you say it once, and an AI responds with context, pushback, or a wider lens — then it's saved, and you move on. One take per story. No infinite arguing in the replies.

## How it works

- **Endless scroll feed** — fresh stories load automatically as you scroll, pulled live across Tech, Science, World, Business, Health, Space, and Climate
- **One comment per story** — you get exactly one shot to respond to each headline; after that, your exchange is locked in as a permanent thread
- **AI replies, not a comment section** — every response is generated fresh, grounded in the specific story you just read
- **Zero accounts** — your comment history lives in your browser's local storage only; clear your cache, and it's gone. By design.
- **Filterable by topic** — tap a category chip to narrow the feed instantly
- **iOS-inspired interface** — blurred nav bars, rounded cards, system color palette, native-feeling motion

## Stack

| Layer | Tool |
|---|---|
| Frontend | Vanilla HTML / CSS / JS — no framework, no build step |
| News data | [NewsData.io](https://newsdata.io) free tier |
| AI responses | Claude API |
| Hosting | GitHub Pages |
| Cost to run | $0 |

## Local setup

No build tools required. Clone the repo and open `index.html` directly, or serve it with any static server:

```bash
git clone https://github.com/domitianegbert04/pulse-news.git
cd pulse-news
python3 -m http.server 8000
```

You'll need your own free API keys for news data and AI responses — see the config section at the top of `index.html`.

## Roadmap

- [ ] Article images with graceful fallback
- [ ] Counter-take cards — AI-generated opposing views inserted into the feed
- [ ] 60-second compression mode — collapse the visible feed into one summary
- [ ] Two-AI debate mode on select stories

## License

MIT — fork it, remix it, ship your own version.

## Author

Built by [Egbert Domitian](https://github.com/domitianegbert04).

