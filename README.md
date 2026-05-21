# Pollen Studio

A static browser app for exploring [Pollinations.AI](https://pollinations.ai) image, text, and TTS models side-by-side. Bring your own pollen — connect via the BYOP authorize flow and the key never touches a server.

Live at **<https://pollenstudio.cru2.net>**.

## Three modes

- **Simple** — single prompt, vibe presets, one-click share.
- **Compare** — N×M matrix across models, seeds, and parameters.
- **Advanced** — raw request console with history rail and JSON inspector.

## How it works

- Auth: `enter.pollinations.ai/authorize` returns the key in a URL fragment; it lands in `localStorage` and is never POSTed anywhere.
- Surfaces: `image.pollinations.ai/prompt/{p}` for images, `POST text.pollinations.ai/openai` (OpenAI chat shape) for text, `GET text.pollinations.ai/{p}?model=openai-audio&voice=…` for TTS.
- Persistence: every run is a shareable URL hash plus a local IndexedDB gallery — no backend.
- Earnings: `earningsEnabled` is on (+25%, disclosed pre-redirect and in the consent UI).

## Develop

```sh
pnpm install
cp .env.example .env   # add your pk_ from enter.pollinations.ai
pnpm dev               # http://localhost:5173
pnpm test              # unit + wire-format tests against the bundled mock
pnpm test:e2e          # playwright happy-path
pnpm build             # static output in build/
```

## Deploy

`scripts/deploy.sh` builds and rsyncs `build/` to the production host. Apache serves the static files; SPA fallback lives in `.htaccess` (excluded from `rsync --delete`).

## Stack

SvelteKit (static adapter) · Svelte 5 runes · TypeScript · Vitest · Playwright · happy-dom.

---

© 2026 [Dave Alan Caruana / Techmagic](https://techmagic.info).
