# Repository Guidelines

## Project Structure & Module Organization

This Next.js 14 application uses React, TypeScript, Tailwind CSS, and React Three Fiber to visualize DualSense and Xbox controller input.

- `src/app/`: App Router entry points, including `page.tsx` and `layout.tsx`.
- `src/components/`: Controller displays, scene rendering, and interface components; reusable controls live in `ui/`.
- `src/hooks/useGamepadState.ts`: Gamepad state and polling logic.
- `src/lib/`: Input mapping, calibration settings, and shared utilities.
- `src/styles/globals.css`: Global styles alongside Tailwind utilities.
- `public/`: Runtime models, textures, SVGs, and controller assets. `media/` contains README images.

## Build, Test, and Development Commands

- `npm ci`: Install dependencies from `package-lock.json`.
- `npm run dev`: Start the local development server at `http://localhost:3000`.
- `npm run build`: Produce a production build and run Next.js build checks.
- `npm start`: Serve the production build after building.
- `npm run lint`: Run Next.js ESLint checks using `next/core-web-vitals`.
- `npx tsc --noEmit`: Check TypeScript types without emitting JavaScript.

## Coding Style & Naming Conventions

Use TypeScript for application changes and respect strict typing. Match nearby code: application files generally use four-space indentation, double-quoted strings, and semicolons. No separate formatter is configured.

Use PascalCase for React components and types, camelCase for functions and variables, and `use` prefixes for hooks. Preserve existing component filenames such as `analogStickViz.tsx`. Use the `@/` alias for imports from `src/`. Keep browser APIs in client-side code and guard access to `window` where server rendering is possible.

## Testing Guidelines

No automated test framework, test script, or coverage threshold is currently configured. Run lint, type checks, and a production build before submitting changes.

For input or rendering changes, manually verify controller connection and reconnection, button mappings, sticks, triggers, calibration controls, saved settings after reload, and model loading. Test both controller families when available; record hardware and browser limitations in the pull request.

## Commit & Pull Request Guidelines

History uses short descriptive subjects, sometimes prefixed with `feat:` or `enhancement:`. Follow that style, for example `feat: add trigger calibration`.

Use a feature branch such as `feature/trigger-calibration` and open a pull request from your fork, following the README workflow. Describe the change, link relevant issues, list validation performed, and include screenshots or a short recording for visual changes.
