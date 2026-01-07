# DJM Vision - AI Coding Agent Instructions

## Project Overview
DJM Vision is a React-based IPTV streaming application focused on Islamic channels, featuring AI-powered channel insights and infographic generation. The app uses HLS streaming with mpegts.js, parses M3U playlists, and integrates Google Gemini AI for Arabic-language content analysis.

## Architecture & Data Flow
- **Frontend**: React 19 + TypeScript + Vite, deployed on Vercel
- **Streaming**: HLS playback via mpegts.js library
- **Playlists**: M3U format parsed from internal constants and cloud URLs
- **AI Integration**: Google Gemini API for channel insights in Arabic
- **Storage**: Encrypted playlists in localStorage via SecurityManager
- **Backend**: Vercel serverless function (`api/index.js`) for CORS-bypassing stream proxy

## Key Components & Files
- `App.tsx`: Main application logic, playlist parsing, channel filtering, and UI state management
- `types.ts`: Core interfaces (Channel, AIInsight, GeneratedImage, SearchResultItem)
- `geminiService.ts`: Gemini AI integration for Arabic channel summaries
- `security.ts`: Base64 encryption/decryption for playlist storage
- `playlist.ts`: Internal M3U playlist constant with Islamic channels
- `api/index.js`: Serverless proxy for streaming URLs to handle CORS

## Critical Patterns & Conventions
- **Arabic Content**: All AI prompts and responses use Arabic language
- **Playlist Encryption**: Always encrypt/decrypt M3U content with `SecurityManager.encrypt/decrypt`
- **M3U Parsing**: Parse `#EXTINF` metadata lines, extract channel names from comma-separated values, find next `http` URL within 5 lines
- **Environment Variables**: Access Gemini API key via `process.env.API_KEY` (defined in `vite.config.ts`)
- **UI Theme**: Dark slate theme with cyan accents, Lucide React icons
- **Error Handling**: Graceful fallbacks (e.g., internal playlist if cloud sync fails)
- **Component Structure**: Functional components with hooks, TypeScript interfaces

## Development Workflow
- **Setup**: `npm install`, set `GEMINI_API_KEY` in `.env.local`
- **Run**: `npm run dev` (Vite dev server on port 3000)
- **Build**: `npm run build` (outputs to `dist/`)
- **Deploy**: Automatic Vercel deployment from `main` branch

## Integration Points
- **Cloud Sync**: Fetch M3U from configurable URL (default: GitHub raw), fallback to internal playlist
- **Stream Proxy**: Route streams through `/api/?url=...` to bypass CORS restrictions
- **AI Insights**: Generate channel summaries on demand using Gemini 3-flash-preview model
- **Image Obfuscation**: Proxy logos through `wsrv.nl` for privacy

## Common Tasks
- **Add Channels**: Update `INTERNAL_PLAYLIST` in `playlist.ts` with valid M3U format
- **Modify AI Prompts**: Edit prompts in `geminiService.ts` to maintain Arabic responses
- **Update Security**: Enhance encryption in `SecurityManager` if needed
- **Add Features**: Follow existing component patterns in root-level TSX files</content>
<parameter name="filePath">/workspaces/djm-vision.vercel.app/.github/copilot-instructions.md