# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a frontend-only portfolio website for Austin Totty built with Next.js. The project uses:
- **Next.js 15** with React 19 and Pages Router (not App Router)
- **TypeScript** with strict type checking
- **Tailwind CSS v4** for styling
- **pnpm** as package manager
- **shadcn** for front end components

## Common Commands

Development:
```bash
pnpm dev          # Start development server with Turbo
pnpm build        # Build for production
pnpm preview      # Build and start production server
pnpm start        # Start production server
```

Code Quality:
```bash
pnpm lint         # Run ESLint
pnpm lint:fix     # Run ESLint with auto-fix
pnpm typecheck    # Run TypeScript type checking
pnpm check        # Run both lint and typecheck together
```

Formatting:
```bash
pnpm format:check # Check code formatting
pnpm format:write # Format code
```

## Architecture

### Pages Structure
- Uses Next.js Pages Router (not App Router)
- Main pages in `src/pages/`
- Custom `_app.tsx` with Geist font


### Styling
- Tailwind CSS with custom configuration
- Global styles in `src/styles/globals.css`
- Uses Geist font family

### Path Aliases
- `~/` maps to `./src/` for clean imports

## Environment
- TypeScript path aliases configured in `tsconfig.json`
- Strict TypeScript configuration with `noUncheckedIndexedAccess`
