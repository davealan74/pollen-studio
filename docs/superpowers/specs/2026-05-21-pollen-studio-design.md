# Pollen Studio — Design Spec

**Date:** 2026-05-21
**Author:** Dave Alan Caruana / Techmagic
**Status:** Draft

## 1. Overview

Pollen Studio is a static-files browser app that lets users connect their Pollinations.AI account via the BYOP (Bring Your Own Pollen) authorization flow and explore Pollinations' image, text, and TTS models side-by-side. It is positioned as a Techmagic product and intended as a flagship reference implementation of BYOP — a candidate to receive Pollinations' "Flower" developer tier.

**Hosting:** `https://pollenstudio.cru2.net` (newhetzner3 Apache vhost, Cloudflare-proxied, Let's Encrypt cert via DNS-01).

**One-liner:** *Connect your Pollinations account, then explore image, text, and TTS models side-by-side. Share any run as a link your friends can run with their own pollen.*

### 1.1 Goals

- Provide a polished, distinctive Pollinations playground that exercises the full image + text + audio API surface.
- Implement BYOP cleanly enough to serve as a reference for other Pollinations developers.
- Drive Pollinations signups via URL-shareable runs (recipients must connect their own key to run).
- Generate ongoing revenue for Techmagic via the `earningsEnabled` flag (+25% disclosed).
- Qualify for Pollinations' Flower tier on the strength of (1) responsible BYOK handling, (2) community-contribution value, (3) professional positioning.

### 1.2 Non-goals (v1)

- No cloud-hosted gallery, no social/comments/likes, no prompt marketplace.
- No team workspaces, no multi-user accounts.
- No mobile-native app (PWA installability is acceptable, no app stores).
- No public API of our own (we are a client to Pollinations).
- No prompt-engineering tutorial content (would turn it into a blog — separate concern).

### 1.3 Audience

Three distinct user groups, served by three modes within one SPA:

- **Curious newcomers** — heard about Pollinations, want to try it without learning prompt-craft. Served by **Simple** mode.
- **Working artists/designers** — picking the right model for a project. Need side-by-side galleries of their own prompts. Served by **Compare** mode.
- **Prompt engineers / power users** — production work, full parameter access, inspectable request/response. Served by **Advanced** mode.

### 1.4 Branding & attribution (strict)

- Footer on every page: `© 2026 Dave Alan Caruana / Techmagic`, linked to `https://techmagic.info`.
- `package.json` `author` field, repo description, and any user-facing string identifies Techmagic only.
- **No mention** of Claude, Claude Code, AI assistance, "generated with", or similar phrasing anywhere in the app, README, meta tags, commit messages, or repo description.
- No `Co-Authored-By: Claude` lines in commits.

## 2. The Three Modes

### 2.1 Simple mode (`/simple`)

A single-prompt flow with opinionated defaults.

- One large prompt textarea.
- "Vibe" selector (chips): **Photoreal**, **Illustration**, **3D Render**, **Voice-over**.
- Behind the vibe sits a mapping table `{vibe → {model, size, quality, enhance, negative_prompt}}`.
  - `Voice-over` routes to the TTS surface (audio), with a voice picker; all others go to the image surface.
- Single big **Generate** button. Loading spinner. Result appears below.
- Below result: **Tweak it →** (jumps to Compare with this prompt pre-loaded), **Save to gallery**, **Share link**, **Try a new vibe**.
- No model names, seeds, or JSON exposed.

### 2.2 Compare mode (`/compare`) — the heart of the app

A matrix-builder for varying axes across a single prompt.

- Surface switcher at top: **Image / Text / Audio**.
- Prompt textarea below the switcher.
- Beneath: an **AxisBuilder** with chip rows for each axis:
  - **Model** axis — multi-select chips (`flux`, `gptimage`, `imagen-4`, …).
  - **Seed** axis — 1 / 3 / 5 / custom list.
  - **Size** axis — 512² / 768² / 1024² / portrait / landscape (image only).
  - **Params** axis — quality (low/medium/high/hd), enhance on/off (image only).
  - For text: model axis, temperature axis, max-tokens axis.
  - For audio: voice axis (the available TTS voices), speed axis.
- A live grid preview shows N cells before generation; a `CostEstimate` strip displays running pollen cost.
- **Generate Matrix** button.
- Each cell, once rendered: star (winner), download, copy URL, fork to Advanced.
- Cells fail/retry independently.

### 2.3 Advanced mode (`/advanced`)

Two-pane layout for prompt engineers.

- **Left rail (collapsible):** request history — every run with timestamp, model, prompt excerpt, pollen cost, status. Click to reload into the editor.
- **Center:** full parameter editor for the currently-selected surface (image/text/audio). Every Pollinations knob exposed.
- **Right:** result preview + JSON inspector showing the underlying request body and the raw response (headers + body or blob meta).
- Above the result: **Copy as curl / fetch / Python** dropdown.
- Below the history: **Diff** view — pick two history entries, see what changed between requests and what changed between results.

### 2.4 Cross-mode plumbing

- Tabs are real routes; deep links are stable.
- `+layout.svelte` carries: header (logo, key pill, mode tabs), gallery drawer, toast root, footer.
- Switching modes never loses the current prompt — it copies across.
- A single global `RunsStore` writes to IndexedDB and synchronises the URL hash regardless of which mode produced the run.

## 3. Authentication: BYOP Flow

Primary path: Pollinations' BYOP OAuth-like flow at `enter.pollinations.ai/authorize`. Fallback: paste a key.

### 3.1 Authorize redirect

The app sends the user to:

```
https://enter.pollinations.ai/authorize
  ?client_id=pk_<our-publishable-key>
  &redirect_uri=https://pollenstudio.cru2.net/auth/callback
  &scope=profile+usage
  &budget=500
  &expiry=30
  &state=<crypto-random>
```

The `state` value is generated client-side and stashed in `sessionStorage` for CSRF verification on return.

The `budget=500` and `expiry=30` shown above are the **defaults used on first Connect**. They are not user-tunable on the first authorize; the user-tunable sliders described in §3.4 apply only to the re-authorize drawer on return visits.

### 3.2 Consent screen

Pollinations renders the consent UI showing the app name (from the `pk_` metadata), the requested scope, the budget cap, and the expiry. Because `earningsEnabled` is set on the app registration, the consent screen also discloses the +25% surcharge that funds the developer.

Pollen Studio's own pre-redirect copy duplicates the earnings disclosure so users see it before clicking Connect.

### 3.3 Callback

Pollinations redirects to:

```
https://pollenstudio.cru2.net/auth/callback#api_key=sk_xxx&state=<echoed>
```

The fragment is not transmitted to any server. Pollen Studio's `/auth/callback` route:

1. Reads `api_key` and `state` from `location.hash`.
2. Verifies `state` matches the value stashed in `sessionStorage`. Mismatch → error UI, no key stored.
3. Persists the key (see §3.6).
4. Calls `history.replaceState` to strip the fragment from the URL.
5. Routes the user to their original destination (or `/simple` by default).

### 3.4 Return visits

Key in `localStorage` → skip auth. Header shows a `KeyPill` with `connected • budget <used>/<cap> • expires in <n> days`. Click pill → drawer with: **disconnect**, **re-authorize** (with sliders for new budget/expiry), **view usage**.

### 3.5 Paste-key fallback

Below the Connect button: small link "or paste a key". Modal with textarea + "Where do I get this?" link to `enter.pollinations.ai/dashboard`. Prefix detection:

- `sk_…` — stored, full access.
- `pk_…` — stored, with a banner warning that pk_ has a 1 pollen/IP/hour limit.
- Anything else — rejected with a clear error.

### 3.6 Storage

- Default: `localStorage["pollen_studio.key"]` (plain string). The fragment delivery means the key never hits a server; storing in `localStorage` is consistent with Pollinations' threat model.
- **Session-only mode** (Settings toggle, default off): store in `sessionStorage` instead. Key dies with the tab. For shared/public machines.
- We never transmit the key to any origin other than `*.pollinations.ai`.

### 3.7 Disconnect

Clears the key from local/session storage. Does **not** attempt remote revocation in v1; if Pollinations exposes a revoke endpoint at build-time, the disconnect drawer gains a "revoke remotely as well" checkbox (off by default).

### 3.8 App registration (manual prerequisite)

Before first deploy, Dave must log in to `enter.pollinations.ai` and register the app:

- Name: "Pollen Studio"
- `redirectUris`: `https://pollenstudio.cru2.net/auth/callback`, `http://localhost:5173/auth/callback`
- `earningsEnabled`: true
- Save the resulting `pk_…` as the build-time env var `VITE_POLLINATIONS_CLIENT_ID`.

## 4. Data Model & Persistence

### 4.1 Canonical types

```ts
type Surface = 'image' | 'text' | 'audio';
type Mode = 'simple' | 'compare' | 'advanced';

type Request = ImageRequest | TextRequest | AudioRequest;

type Run = {
  id: string;              // ulid
  createdAt: number;
  surface: Surface;
  mode: Mode;
  prompt: string;
  request: ImageRequest | TextRequest | AudioRequest;
  cells: RunCell[];
};

type RunCell = {
  id: string;
  variant: Partial<Request>;  // differences from the parent request
  status: 'pending' | 'ok' | 'error';
  startedAt: number;
  finishedAt?: number;
  pollenCost?: number;
  result?: ImageResult | TextResult | AudioResult;
  error?: { code: string; message: string };
  starred?: boolean;
};
```

Image results store a blob reference (IndexedDB blob id); text results store the string; audio results store a blob reference.

### 4.2 Storage layers

- **`localStorage`** — the active key, settings, last-seen budget cache. Small + synchronous.
- **IndexedDB** — full run history, via the `idb` library (~1kb).
  - `runs` object store, indexed by `createdAt`.
  - `blobs` object store, keyed by cell id. Image and audio binaries live here so `runs` rows stay small.
- Quota management: when `navigator.storage.estimate()` returns ≥ 80% of available, a non-blocking banner offers **Purge older than 30 days** or **Export then wipe**.

### 4.3 Shareable runs (URL hash)

- `#run=<base64url(compact-json)>` — encodes only the *request* (no result blob, no `id`, no timestamps, no defaults that match documented Pollinations defaults).
- Target hash payload ≤ 200 bytes for typical inputs; **hard cap 1500 bytes** (browsers vary but all support ≥2KB URLs comfortably).
- If a run exceeds the hard cap, the **Share** button shows "this run is too large to share as a link" and offers two fallbacks: (a) **Copy as JSON** (clipboard), or (b) **Download .pollenrun file** which the recipient can drag onto Pollen Studio to import.
- Opening such a link routes the user to the appropriate mode, pre-fills the inputs, and shows a **Run with my key** button. Clicking spends the recipient's pollen and produces their own result.
- `#share=<id>` (separate variant) is for self-shares of historical runs *including* the original result blobs. Resolved locally only; never works on someone else's browser.

## 5. Module Breakdown

```
src/
├── routes/
│   ├── +layout.svelte               # shell: nav, key pill, gallery drawer, toast root, footer
│   ├── +page.svelte                 # landing: connect CTA + brief explainer
│   ├── auth/
│   │   ├── start/+page.svelte       # builds authorize URL, redirects out
│   │   └── callback/+page.svelte    # reads fragment, persists key, routes on
│   ├── simple/+page.svelte
│   ├── compare/+page.svelte
│   ├── advanced/+page.svelte
│   ├── gallery/+page.svelte         # full IDB gallery view
│   └── privacy/+page.svelte         # the "what we store, what we never send" page
├── lib/
│   ├── pollinations/
│   │   ├── client.ts                # thin fetch wrapper, injects auth header
│   │   ├── auth.ts                  # buildAuthorizeUrl, parseCallback, storeKey, currentKey
│   │   ├── image.ts                 # generateImage(req): Promise<Blob>
│   │   ├── text.ts                  # generateText(req): Promise<string>
│   │   ├── audio.ts                 # generateAudio(req): Promise<Blob>
│   │   ├── models.ts                # catalog: id, label, surface, supports, defaults
│   │   └── pricing.ts               # estimatePollenCost(req): number
│   ├── stores/
│   │   ├── key.svelte.ts            # $state rune; persisted; budget/expiry meta
│   │   ├── settings.svelte.ts       # session-only mode, default model, theme
│   │   ├── runs.svelte.ts           # in-memory mirror of IDB; CRUD; IDB writes background
│   │   └── share.svelte.ts          # url-hash encode/decode helpers, deep-link router
│   ├── db/
│   │   ├── idb.ts                   # idb wrapper, migrations, quota helpers
│   │   └── purge.ts                 # quota policy, export-then-wipe
│   ├── components/
│   │   ├── KeyConnect.svelte
│   │   ├── KeyPill.svelte
│   │   ├── PromptBox.svelte
│   │   ├── AxisBuilder.svelte
│   │   ├── MatrixGrid.svelte
│   │   ├── RunCard.svelte
│   │   ├── CostEstimate.svelte
│   │   ├── JsonInspector.svelte
│   │   ├── CopyAs.svelte
│   │   ├── HistoryRail.svelte
│   │   ├── GalleryDrawer.svelte
│   │   ├── Toast.svelte
│   │   └── Footer.svelte
│   └── utils/
│       ├── ulid.ts
│       ├── base64url.ts
│       └── csp.ts
```

Each file has one clear purpose. Stores own their own state and persistence; components stay presentational; `lib/pollinations/*` is the only place that talks to the network.

## 6. Error Handling

| Failure | Detection | UX |
| --- | --- | --- |
| No key set | `currentKey() === null` before request | Inline "Connect Pollinations to run" prompt; Generate button doubles as Connect CTA |
| Key expired | 401 + JWT `exp` past now | Toast + auto-route to `/auth/start` with deep-link return |
| Budget exhausted | 402 from API | Toast + re-authorize drawer with bigger budget |
| Rate limit (Flower tier: 1 req/3s per Pollinations API docs, May 2026) | 429 | Defensive: Compare mode already paces requests 3.1s apart client-side; on 429, exponential backoff. Pacing constant lives in `lib/pollinations/client.ts` and must be revisited if Pollinations changes their published limit. |
| Model unavailable | 404 or specific error code | Cell shows "model unavailable", offers nearest substitute from `models.ts` |
| Network / 5xx | fetch reject or 5xx | Cell error state with Retry; MatrixGrid offers Bulk Retry |
| Quota near full (IDB ≥ 80%) | `navigator.storage.estimate()` | Non-blocking banner: Purge old / Export & wipe |
| Corrupt run in IDB | JSON parse fail on load | Skip + console log; Settings offers Reset gallery |

## 7. Testing Strategy

- **Unit (Vitest):** `auth.ts` (URL build, fragment parse, state verify), `share.svelte.ts` (round-trip encode/decode), `pricing.ts` (cost estimates), `idb.ts` (CRUD against `fake-indexeddb`).
- **Component (Vitest + `@testing-library/svelte`):** `PromptBox` autosize, `AxisBuilder` chip combinations, `MatrixGrid` renders N cells, `KeyConnect` detects `sk_`/`pk_` prefix.
- **Integration (Playwright against a mock Pollinations server):** full happy path `connect → simple run → save to gallery → share link → open link in second context → run with second key`. No real pollen spent in CI. The mock server is **built as part of this project** (small Node script under `tests/mock-pollinations/`) — it stubs the three surface endpoints plus the BYOP authorize/callback redirect dance and serves a handful of canned responses keyed by prompt text.
- **Manual smoke checklist** in `docs/smoke.md` — the irreducible "before-ship" list executed with a real key.
- **CI:** GitHub Actions — typecheck, unit, component, Playwright. Build artifact uploaded.

## 8. Hosting & Deployment

- **Build:** `pnpm build` produces a pure static `dist/`.
- **Deploy:** `rsync -avz --delete dist/ root@newhetzner3:/var/www/autodom/pollenstudio.cru2.net/htdocs/ && ssh root@newhetzner3 'chown -R apache:apache /var/www/autodom/pollenstudio.cru2.net/htdocs/'`.
- **Vhost** already in place at `/etc/httpd/conf.d/pollenstudio.cru2.net{,-le-ssl}.conf`. Apache serves the static files directly; no PHP handler is invoked.
- **Cert** renews automatically via the existing certbot timer (DNS-01 via `/root/.secrets/cloudflare.ini`).
- **CSP** header set in the SSL vhost: `default-src 'self'; connect-src 'self' https://*.pollinations.ai; img-src 'self' data: blob: https://*.pollinations.ai; media-src 'self' blob: https://*.pollinations.ai; style-src 'self' 'unsafe-inline'; script-src 'self'; frame-ancestors 'none'`.
- Once production is stable, deploy script becomes a GitHub Actions workflow on `main` push.

## 9. Pollinations API Surface (consumed)

- `GET https://gen.pollinations.ai/image/{url-encoded-prompt}?...` — image generation
- `POST https://text.pollinations.ai/...` — text/chat completions (exact endpoint to confirm against current Pollinations docs at build-time)
- `POST https://audio.pollinations.ai/...` — TTS (same caveat)
- `https://enter.pollinations.ai/authorize` — BYOP authorize endpoint
- `https://enter.pollinations.ai/api/...` — budget/usage queries (read-only)

All calls authenticated with `Authorization: Bearer <user-key>`. Implementation must verify exact endpoint shapes against the live Pollinations API docs at build-time; the design here pins behaviour, not URL strings.

## 10. Open Follow-ups (not blocking the spec)

- Register the `pk_…` app entry at `enter.pollinations.ai` (manual, requires Dave's login).
- Decide whether to mirror the repo from `git.techmagic.info` to a public GitHub repo for community visibility (relevant to the Flower-tier pitch as a "reference implementation").
- Verify whether Pollinations exposes a key-revoke endpoint; if so, wire up the optional remote-revoke checkbox in §3.7.
- After v1 ships, evaluate whether a "Prompt Library" community surface (originally idea #5 from the brainstorm) becomes a v2.
