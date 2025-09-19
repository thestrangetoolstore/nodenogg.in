# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

nodenogg.in is an in-person collaborative multiscreen web tool for education feedback and critiques. It's a privacy-focused, local-first application built as a pnpm monorepo with Vue.js frontend and YJS sync server backend.

## Development Commands

### Setup
```bash
pnpm install  # Install all dependencies
```

### Development
```bash
pnpm dev              # Run both app and sync server (recommended)
pnpm dev:app          # Run only the Vue.js app (localhost:5173)
pnpm dev:server       # Run only the YJS sync server (localhost:8787)
```

### Building and Testing
```bash
pnpm build           # Build all packages
pnpm lint            # Lint all packages
pnpm format          # Format all packages
pnpm test            # Run tests for all packages
pnpm test:watch      # Run tests in watch mode
```

### Documentation
```bash
pnpm docs:dev        # Run VitePress docs locally (localhost:8081)
pnpm docs:build      # Build documentation
pnpm docs:preview    # Preview built documentation
```

### Individual Package Commands
For the main app (`products/app/`):
- `pnpm --filter nodenogg.in dev` - Development server
- `pnpm --filter nodenogg.in build` - Build production
- `pnpm --filter nodenogg.in test` - Run Vitest unit tests
- `pnpm --filter nodenogg.in test:e2e` - Run Playwright E2E tests
- `pnpm --filter nodenogg.in type-check` - TypeScript type checking

For the sync server (`products/yjs-sync-server/`):
- `pnpm --filter @nodenogg.in/yjs-sync-server dev` - Development with auto-reload
- `pnpm --filter @nodenogg.in/yjs-sync-server build` - Build for production
- `pnpm --filter @nodenogg.in/yjs-sync-server start` - Start production server

## Architecture

### Monorepo Structure
- **products/app/** - Main Vue.js application (nodenogg.in)
- **products/yjs-sync-server/** - YJS websocket sync server using Hocuspocus
- **packages/core/** - Core shared utilities
- **packages/schema/** - Data schemas and validation
- **packages/spatial-view/** - Spatial visualization components
- **packages/y-microcosm/** - YJS integration utilities
- **docs/** - VitePress documentation

### Key Technologies
- **Frontend**: Vue 3 + TypeScript + Vite + Pinia + Vue Router
- **UI**: Reka UI components, TipTap editor, Vue Flow
- **Backend**: Hono server with Hocuspocus YJS sync
- **Real-time**: YJS for collaborative editing
- **Validation**: Valibot for schema validation
- **Testing**: Vitest (unit), Playwright (E2E)

### Development Flow
The app uses YJS for real-time collaboration. During development:
1. The sync server runs on port 8787 with websocket endpoint `/sync`
2. The Vue app connects to `ws://localhost:8787/sync` for real-time sync
3. Both can be started together with `pnpm dev` or individually

### Package Dependencies
Internal packages use workspace protocol (`workspace:*`) for cross-references. The main app depends on all internal packages, while the sync server is standalone.

## Release Management
- Uses conventional commits with commitlint
- Changelogen for automated changelog generation
- Version sync script maintains consistency across packages
- Husky pre-commit hooks for linting and formatting