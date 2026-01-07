# DJM Vision - AI Coding Agent Instructions

## TL;DR
DJM Vision is a React + TypeScript IPTV single‑page app (Vite). It: plays HLS streams (mpegts.js), parses M3U playlists (client + server), and uses a serverless endpoint to call Gemini for **one short Arabic sentence** describing channels. Keep UI text and AI prompts in Arabic and follow the parsing/storage conventions below.

## Quick start (commands)
- npm install
- Create `.env.local` and set: `GEMINI_API_KEY=...` (also set in Vercel for production)
- Run `npm run check-gemini` to verify the key is available locally
- npm run dev  (Vite → http://localhost:3000)
- npm run build / npm run preview
- npm run test-stream (validates M3U/HLS URLs)

## Key files & responsibilities
- `App.tsx` — core app: parseM3U (client), local/cloud sync, mpegts player setup, mixed‑content checks, UI flows
- `playlist.ts` — `INTERNAL_PLAYLIST` (fallback source, ~500 channels)
- `security.ts` — `SecurityManager.encrypt/decrypt()` (double base64 + SALT) and `obfuscateUrl()` (proxies logos via wsrv.nl)
- `geminiService.ts` — client wrapper POST /api/analyze
- `api/analyze.js` — server function that calls Gemini (`gemini-3-flash-preview`) and returns plain Arabic text
- `api/index.js` — simple CORS proxy for remote streams (`/api/?url=...`)
- `api/playlist.js` — server-side M3U parser / filters (same parsing rules as client)
- `test-stream.js` — CLI validator for HLS/M3U URLs
- `vite.config.ts` — loads `GEMINI_API_KEY` into `process.env` for build-time use

## Conventions & parsing rules (canonical) 🔧
- Parse logic (follow code in `App.tsx` / `api/playlist.js`):
  - Look for lines containing `#EXTINF`
  - Channel name = last segment after the final comma in `#EXTINF` line
  - Scan up to the next 5 lines for a URL that starts with `http` → stream URL
  - `tvg-logo="..."` ⇒ logo (use `SecurityManager.obfuscateUrl()` for proxying)
  - `group-title="..."` ⇒ category; default to **"قنوات عامة"** when missing
- LocalStorage keys:
  - `djm_playlist` — encrypted M3U (use `SecurityManager.encrypt()` / `decrypt()`)
  - `djm_cloud_url` — source URL used for sync
- Player details:
  - mpegts is loaded in `index.html` from CDN (version pinned in file)
  - Create with: `mpegts.createPlayer({ type:'mse', isLive:true, url, cors:true })` and attach to the `<video>` element
  - App checks mixed content and shows a warning when using `http:` streams on `https:` pages

## AI integration & important gotchas ⚙️
- Env: `GEMINI_API_KEY` must be set in Vercel (Production) and `.env.local` (dev). `api/analyze.js` runs server-side and requires it.
- Model: `gemini-3-flash-preview` (server-side). The server reads the model text and returns `{ analysis }` to the client.

Known issues to watch for (fixes included):
- api/analyze.js imports `@google/generative-ai` but `package.json` includes `@google/genai` — reconcile the import to match the installed package.
- api/analyze.js does `const analysis = response.text();` — this returns a Promise. Use `const analysis = await response.text();` before returning JSON.
- Prompt language: ensure the prompt itself is Arabic (not English). Recommended prompt:

  "أعطِ جملة واحدة قصيرة باللغة العربية تصف محتوى قناة التلفزيون هذه: \"${channelName}\". أعد النص باللغة العربية فقط."

## Testing & debugging tips ✅
- Use `npm run test-stream` to validate HLS/M3U URLs and counts.
- Test the CORS proxy: `GET /api/?url=https://example.com/stream.m3u8` — the proxy sets correct CORS headers and Content-Type.
- Check Vercel function logs when `api/*` fails (Functions tab).
- For playback issues: check console for mpegts.js errors and MIME/content-type mismatches.

## Common edits (copy/paste examples) 💡
- Add a channel to `INTERNAL_PLAYLIST` (`playlist.ts`):
  #EXTINF:-1 tvg-logo="https://logo.png" group-title="رياضة",قناة تجريبية
  https://stream.example.com/stream.m3u8

- Change the AI phrasing: edit `api/analyze.js` and replace the prompt with the Arabic example above; ensure `await response.text()` is used and the correct SDK import.

## Where to look (quick map) 🔭
- UI: `App.tsx`, `SearchResults.tsx`, `Infographic.tsx`
- AI & server: `geminiService.ts`, `api/analyze.js`, `api/index.js`, `api/playlist.js`
- Utilities: `security.ts`, `playlist.ts`, `test-stream.js`

---
If you'd like, I can (1) patch `api/analyze.js` to fix the import/await + replace the prompt with the Arabic example, (2) add a small unit or runtime check to validate `GEMINI_API_KEY` at startup. Tell me which you'd prefer and I'll implement it.</content>
<parameter name="filePath">/workspaces/djm-vision.vercel.app/.github/copilot-instructions.md