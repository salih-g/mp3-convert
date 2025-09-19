# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build production application with Turbopack
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint for code quality checks

## Project Architecture

This is a Next.js 15 application using the App Router pattern with TypeScript and React 19. The project is configured for modern development with:

### Technology Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS v4 with PostCSS
- **Fonts**: Geist Sans and Geist Mono from Google Fonts
- **Build Tool**: Turbopack (enabled for both dev and build)
- **Package Manager**: pnpm (note: uses pnpm-workspace.yaml)

### Project Structure
- `src/app/` - App Router pages and layouts following Next.js 13+ conventions
  - `layout.tsx` - Root layout with font configuration and global styles
  - `page.tsx` - Home page component
  - `globals.css` - Global styles with Tailwind CSS imports and CSS custom properties
- Path alias `@/*` maps to `./src/*` for cleaner imports

### Key Configuration Details
- Uses Tailwind CSS v4 with `@theme inline` directive for custom properties
- ESLint configured with Next.js Core Web Vitals and TypeScript support
- TypeScript configured with bundler module resolution and strict mode
- Custom CSS properties for theming with dark mode support via `prefers-color-scheme`

## YouTube MP3 Conversion Features

This is a YouTube to MP3 converter application with the following functionality:

### Core Features
- **YouTube Video Info Extraction**: Fetches video metadata (title, duration, thumbnail, author)
- **MP3 Conversion**: Converts YouTube videos to MP3 format using FFmpeg WASM
- **Bot Detection Bypass**: Advanced anti-bot detection system for YouTube API calls
- **Internationalization**: Multi-language support (English, Turkish) using next-intl
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

### YouTube Integration (`src/lib/youtube.ts`)
- Uses `@distube/ytdl-core` for YouTube video information extraction
- Implements multiple retry attempts with randomized headers to bypass bot detection
- Includes fallback mechanisms for different request configurations
- Supports both full video info and basic info retrieval methods
- Random user agents and headers to appear more human-like

### API Endpoints
- **`/api/video-info`**: POST endpoint to fetch YouTube video metadata
  - Validates YouTube URLs
  - Enforces 10-minute duration limit
  - Returns video title, duration, thumbnail, and author info
- **`/api/convert`**: POST endpoint for MP3 conversion (uses FFmpeg WASM)

### Deployment Configuration
- **Runtime**: Forced to Node.js runtime for ytdl-core compatibility on Vercel
- **Bot Detection Handling**: Multiple retry mechanisms with delays and header randomization
- **Error Handling**: Comprehensive error messages for different failure scenarios

### Known Limitations
- Maximum video duration: 10 minutes
- Serverless environment constraints (no binary dependencies like youtube-dl)
- YouTube's anti-bot measures require sophisticated header spoofing