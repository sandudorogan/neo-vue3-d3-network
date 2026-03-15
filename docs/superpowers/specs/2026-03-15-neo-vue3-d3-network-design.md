# neo-vue3-d3-network Design Spec

A Vue 3 composable-first library for rendering force-directed network graphs using D3. TypeScript throughout, SVG renderer with architecture that supports future Canvas renderer addition.

## Data Model

```typescript
interface GraphNode {
  id: string | number
  name?: string
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
  pinned?: boolean
  color?: string
  cssClass?: string | string[]
  labelClass?: string
  size?: number
  svgIcon?: string
  iconWidth?: number
  iconHeight?: number
  svgAttrs?: Record<string, string>
  [key: string]: unknown
}

interface GraphLink {
  id?: string | number
  source: string | number
  target: string | number
  name?: string
  color?: string
  width?: number
  cssClass?: string | string[]
  svgAttrs?: Record<string, string>
  [key: string]: unknown
}

interface ForcesConfig {
  center?: boolean
  x?: number | boolean
  y?: number | boolean
  manyBody?: boolean
  link?: boolean
  collide?: number | boolean
}

interface ScreenshotOptions {
  filename?: string
  background?: string
  format?: 'png' | 'svg'
  inlineAllCss?: boolean
}
```

## Composable Architecture

### `useForceGraph(options)` — Orchestrator

Wires together all inner composables. Accepts reactive options, returns reactive state and methods.

**Options:**

| Option | Type | Default | Description |
|---|---|---|---|
| `nodes` | `MaybeRef<GraphNode[]>` | required | Input nodes |
| `links` | `MaybeRef<GraphLink[]>` | required | Input links |
| `nodeSize` | `MaybeRef<number>` | `5` | Default node radius |
| `linkWidth` | `MaybeRef<number>` | `1` | Default link stroke width |
| `force` | `MaybeRef<number>` | `500` | ManyBody strength (applied as negative) |
| `forces` | `MaybeRef<ForcesConfig>` | see ForcesConfig | Toggle/configure individual forces |
| `customForces` | `MaybeRef<Record<string, unknown[]>>` | `{}` | Additional d3 forces |
| `nodeLabels` | `MaybeRef<boolean>` | `false` | Show node name labels |
| `linkLabels` | `MaybeRef<boolean>` | `false` | Show link name labels |
| `fontSize` | `MaybeRef<number>` | `10` | Label font size |
| `curvedLinks` | `MaybeRef<boolean>` | `false` | Curved (quadratic bezier) vs straight links |
| `draggable` | `MaybeRef<boolean>` | `true` | Enable node dragging |
| `zoomable` | `MaybeRef<boolean>` | `true` | Enable zoom/pan |
| `selectable` | `MaybeRef<boolean>` | `true` | Enable click selection |
| `nodeFormatter` | `(node: GraphNode) => GraphNode` | identity | Transform nodes during build |
| `linkFormatter` | `(link: GraphLink) => GraphLink` | identity | Transform links during build |
| `simulationFormatter` | `(sim: Simulation) => Simulation` | identity | Direct simulation access |

**Returns:**

| Property | Type | Description |
|---|---|---|
| `simulatedNodes` | `Readonly<Ref<SimulatedNode[]>>` | Nodes with x,y populated by simulation |
| `simulatedLinks` | `Readonly<Ref<SimulatedLink[]>>` | Links with resolved source/target objects |
| `selectedNodes` | `Ref<Map<string\|number, GraphNode>>` | Currently selected nodes |
| `selectedLinks` | `Ref<Map<string\|number, GraphLink>>` | Currently selected links |
| `transform` | `Readonly<Ref<{ x: number; y: number; k: number }>>` | Current zoom/pan transform |
| `selectNode(id)` | method | Select a node by id |
| `deselectNode(id)` | method | Deselect a node by id |
| `toggleNodeSelection(id)` | method | Toggle node selection |
| `selectLink(id)` | method | Select a link by id |
| `clearSelection()` | method | Clear all selections |
| `pinNode(id)` | method | Pin a node at current position |
| `unpinNode(id)` | method | Unpin a node |
| `zoomTo(scale)` | method | Zoom to specific scale |
| `zoomToFit()` | method | Fit all nodes in view |
| `resetZoom()` | method | Reset to identity transform |
| `restart(alpha?)` | method | Restart simulation |
| `screenshot(options?)` | method | Export as PNG or SVG blob |
| `containerRef` | `Ref<SVGSVGElement\|null>` | Bind to SVG container element |

### Inner Composables

All exported for power users who want to compose their own setup.

| Composable | Responsibility |
|---|---|
| `useGraphData(nodes, links, opts)` | Normalize input arrays, assign default IDs, build id-to-node lookup map, apply formatters. Does NOT mutate input — returns new arrays. |
| `useForceSimulation(nodes, links, opts)` | Create d3-force simulation, configure forces (Center, X, Y, ManyBody, Link, Collide), apply custom forces, run tick loop via `requestAnimationFrame`, expose `restart()`. Updates node x/y reactively on each tick. |
| `useNodeDrag(simulation, containerRef)` | Handle `mousedown`/`touchstart` on nodes, `mousemove`/`touchmove` on container, `mouseup`/`touchend`. Set `fx`/`fy` during drag, release on drop unless `pinned`. Restart simulation during drag. |
| `useZoom(containerRef, opts)` | Attach `d3-zoom` to the SVG container. Expose reactive `transform` ref. Provide `zoomTo`, `zoomToFit`, `resetZoom`. Handle zoom enable/disable reactively. |
| `useSelection()` | Maintain `selectedNodes` and `selectedLinks` as reactive `Map`s. Provide select/deselect/toggle/clear methods. |
| `useScreenshot(containerRef)` | Clone SVG element, inline computed CSS, serialize to SVG string or render to canvas for PNG. Return as `Promise<Blob>`. |

## Component Design

### `<ForceGraph>`

All `ForceGraphOptions` as props. Emits:

| Event | Payload |
|---|---|
| `node-click` | `(node: GraphNode, event: MouseEvent)` |
| `link-click` | `(link: GraphLink, event: MouseEvent)` |
| `node-double-click` | `(node: GraphNode, event: MouseEvent)` |
| `node-context-menu` | `(node: GraphNode, event: MouseEvent)` |
| `node-drag-start` | `(node: GraphNode, event: MouseEvent)` |
| `node-drag-end` | `(node: GraphNode, event: MouseEvent)` |
| `zoom-change` | `(transform: { x: number; y: number; k: number })` |

### Slots

| Slot | Props | Purpose |
|---|---|---|
| `node` | `{ node, selected, pinned }` | Custom node rendering |
| `link` | `{ link, selected }` | Custom link rendering |
| `node-label` | `{ node }` | Custom node label |
| `overlay` | `{ transform }` | Extra SVG content inside zoom group |

Default slot content renders circles for nodes, paths for links, text for labels.

### SVG Structure

```xml
<svg class="force-graph" :viewBox="viewBox">
  <defs><!-- markers, clips --></defs>
  <g class="zoom-layer" :transform="zoomTransform">
    <g class="links"><!-- link paths --></g>
    <g class="nodes"><!-- node circles/icons --></g>
    <g class="labels"><!-- text labels --></g>
    <slot name="overlay" />
  </g>
</svg>
```

## Project Structure

```
neo-vue3-d3-network/
├── src/
│   ├── index.ts
│   ├── types.ts
│   ├── composables/
│   │   ├── useForceGraph.ts
│   │   ├── useGraphData.ts
│   │   ├── useForceSimulation.ts
│   │   ├── useNodeDrag.ts
│   │   ├── useZoom.ts
│   │   ├── useSelection.ts
│   │   └── useScreenshot.ts
│   ├── components/
│   │   └── ForceGraph.vue
│   └── utils/
│       └── svg.ts
├── showcase/
│   ├── index.html
│   ├── src/
│   │   ├── main.ts
│   │   ├── App.vue
│   │   ├── router.ts
│   │   └── pages/
│   │       ├── Home.vue
│   │       ├── BasicGraph.vue
│   │       ├── DragAndPin.vue
│   │       ├── ZoomPan.vue
│   │       ├── Styling.vue
│   │       ├── Labels.vue
│   │       ├── CurvedLinks.vue
│   │       ├── Selection.vue
│   │       ├── CustomNodes.vue
│   │       ├── Forces.vue
│   │       ├── Screenshot.vue
│   │       └── Kitchen.vue
│   └── vite.config.ts
├── package.json
├── tsconfig.json
├── tsconfig.lib.json
├── vite.config.ts
├── eslint.config.ts
└── .github/workflows/pages.yml
```

## Dependencies

**Runtime:** `d3-force`, `d3-zoom`, `d3-selection`, `d3-drag` (individual modules)

**Peer:** `vue >= 3.4`

**Dev:** `typescript`, `vite`, `@vitejs/plugin-vue`, `vue-tsc`, `eslint`, `@antfu/eslint-config`, `vue-router` (showcase only)

## Build Outputs

Library mode via Vite:
- `dist/neo-vue3-d3-network.es.js` (ESM)
- `dist/neo-vue3-d3-network.umd.js` (UMD)
- `dist/style.css`
- `dist/types/` (declaration files via vue-tsc)

## Feature Parity with Reference

| Feature | Reference | This library |
|---|---|---|
| Force simulation | d3-force v1 | d3-force v3 |
| SVG renderer | yes | yes |
| Canvas renderer | yes | no (architecture supports future addition) |
| Node drag | mouse + touch | mouse + touch |
| Node pinning | yes | yes |
| Selection | prop-driven object | reactive Map, composable methods |
| Node icons (SVG) | global + per-node | global + per-node + slot override |
| Labels | node + link | node + link |
| Curved links | quadratic bezier | quadratic bezier |
| Screenshot export | PNG + SVG | PNG + SVG (async, returns Blob) |
| Custom forces | prop | prop |
| Simulation callback | prop | prop |
| Resize handling | window listener | ResizeObserver |
| Zoom/Pan | not implemented | d3-zoom (new feature) |
| Slots | none | node, link, node-label, overlay |
| TypeScript | none | full |
| Collision force | none | configurable (new) |

## Key Design Decisions

1. **No input mutation.** The reference mutates input node/link arrays directly. We copy and normalize, leaving caller data untouched.

2. **ResizeObserver over window.resize.** More precise, handles container resizes that aren't window resizes.

3. **d3-zoom for zoom/pan.** Standard approach — applies SVG transform to a wrapper `<g>` element. Handles wheel zoom, pinch zoom, and click-drag pan.

4. **Reactive Maps for selection** instead of plain objects keyed by id. Better ergonomics, proper iteration, reactive by default with Vue's reactivity system.

5. **Async screenshot** returning `Promise<Blob>` instead of auto-downloading. Gives consumers control over what to do with the output.

6. **Individual d3 modules** instead of the full d3 bundle. Keeps the library lightweight.
