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

This appears to be a fresh Next.js project intended for YouTube MP3 conversion functionality based on the project name, though the current implementation contains only the default Next.js starter template.