# Implementation Plan

## Phase 1: Project Scaffolding
1. Initialize bun project, install all dependencies
2. Configure TypeScript (tsconfig.json, tsconfig.lib.json)
3. Configure Vite (library build + showcase)
4. Configure ESLint with @antfu/eslint-config
5. Set up project structure (directories, barrel exports)

## Phase 2: Core Library
1. Types (types.ts) — all interfaces
2. utils/svg.ts — SVG parsing, path generators
3. useGraphData — data normalization composable
4. useForceSimulation — d3-force simulation composable
5. useSelection — selection state composable
6. useZoom — d3-zoom composable
7. useNodeDrag — drag interaction composable
8. useScreenshot — SVG/PNG export composable
9. useForceGraph — orchestrator composable
10. ForceGraph.vue — component shell
11. index.ts — public API exports

## Phase 3: Showcase App
1. Scaffold showcase Vite app with vue-router
2. App shell with navigation
3. Home page (landing)
4. BasicGraph page
5. DragAndPin page
6. ZoomPan page
7. Styling page
8. Labels page
9. CurvedLinks page
10. Selection page
11. CustomNodes page
12. Forces page
13. Screenshot page
14. Kitchen sink page

## Phase 4: Polish
1. Fix any typecheck/lint issues
2. GitHub Pages workflow
3. Final verification
