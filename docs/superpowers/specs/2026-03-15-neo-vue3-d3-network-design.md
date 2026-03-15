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
  center?: boolean            // default: false
  x?: number | boolean        // default: 0.5 (strength)
  y?: number | boolean        // default: 0.5 (strength)
  manyBody?: boolean          // default: true
  link?: boolean              // default: true
  collide?: number | boolean  // default: false (disabled)
}

interface ScreenshotOptions {
  filename?: string
  background?: string
  format?: 'png' | 'svg'
  inlineAllCss?: boolean
}

// D3-enriched types after simulation processes them
interface SimulatedNode extends GraphNode {
  x: number             // assigned by d3-force
  y: number             // assigned by d3-force
  vx: number            // velocity x
  vy: number            // velocity y
  index: number         // array index in simulation
}

interface SimulatedLink {
  id: string | number
  source: SimulatedNode  // resolved from id to object by d3-force
  target: SimulatedNode  // resolved from id to object by d3-force
  name?: string
  color?: string
  width?: number
  cssClass?: string | string[]
  svgAttrs?: Record<string, string>
  index: number
  [key: string]: unknown
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
| `customForces` | `MaybeRef<Record<string, d3.Force>>` | `{}` | Pre-constructed d3 force instances keyed by name (e.g., `{ radial: d3.forceRadial(100) }`). On reactive change, all existing custom forces are removed from the simulation and replaced with the new set. |
| `nodeLabels` | `MaybeRef<boolean>` | `false` | Show node name labels |
| `linkLabels` | `MaybeRef<boolean>` | `false` | Show link name labels |
| `fontSize` | `MaybeRef<number>` | `10` | Label font size |
| `curvedLinks` | `MaybeRef<boolean>` | `false` | Curved (quadratic bezier) vs straight links |
| `draggable` | `MaybeRef<boolean>` | `true` | Enable node dragging |
| `zoomable` | `MaybeRef<boolean>` | `true` | Enable zoom/pan |
| `selectable` | `MaybeRef<boolean>` | `true` | Enable click selection |
| `nodeFormatter` | `(node: GraphNode) => GraphNode` | identity | Transform nodes during build |
| `linkFormatter` | `(link: GraphLink) => GraphLink` | identity | Transform links during build |
| `simulationFormatter` | `(sim: Simulation) => Simulation` | identity | Direct simulation access. Called after all forces are configured, so user can override or add to the setup. |

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
| `useGraphData(nodes, links, opts)` | Normalize input arrays, assign default IDs (nodes: array index if missing; links: `"link-{index}"`), build id-to-node lookup map, apply formatters. Does NOT mutate input — returns new arrays. |
| `useForceSimulation(nodes, links, opts)` | Create d3-force simulation, configure forces (Center, X, Y, ManyBody, Link, Collide), apply custom forces, run tick loop via `requestAnimationFrame`, expose `restart()`. On each tick, calls `triggerRef()` on the nodes/links shallowRef to notify Vue's reactivity system without copying arrays — d3 mutates node positions in-place, so we use `shallowRef` + manual trigger for performance. |
| `useNodeDrag(simulation, containerRef, nodes, transform, opts)` | Handle `mousedown`/`touchstart` on nodes, `mousemove`/`touchmove` on container, `mouseup`/`touchend`. Node resolution uses `event.target` — each SVG node element carries a `data-node-id` attribute, so the handler walks up from the event target to find it (no spatial search needed). Receives `transform` ref from `useZoom` to convert screen coordinates to graph-space via `transform.invert()` during drag. Receives `nodes` shallowRef for id-to-node lookup. Only handles single-touch (first touch point) to avoid conflicts with d3-zoom's pinch gestures. Respects `opts.draggable` toggle. Sets `fx`/`fy` during drag, releases on drop unless `pinned`. Restarts simulation during drag. |
| `useZoom(containerRef, opts)` | Attach `d3-zoom` to the SVG container. Expose reactive `transform` ref. Provide `zoomTo` and `resetZoom`. Handle zoom enable/disable reactively. `zoomToFit()` is wired at the orchestrator level in `useForceGraph` since it needs access to simulated node positions to compute the bounding box. |
| `useSelection()` | Maintain `selectedNodes` and `selectedLinks` as reactive `Map`s. Provide select/deselect/toggle/clear methods. |
| `useScreenshot(containerRef)` | Clone SVG element, inline computed CSS, serialize to SVG string or render to canvas for PNG. Return as `Promise<Blob>`. Default behavior inlines only CSS rules matching elements in the SVG. When `inlineAllCss: true`, inlines all document CSS rules (useful when styles come from external sheets). |

## Component Design

### `<ForceGraph>`

Props mirror `ForceGraphOptions` (the options type for `useForceGraph`, unwrapped from `MaybeRef` since Vue props handle reactivity). Emits:

| Event | Payload |
|---|---|
| `node-click` | `(node: GraphNode, event: MouseEvent)` |
| `link-click` | `(link: GraphLink, event: MouseEvent)` |
| `node-double-click` | `(node: GraphNode, event: MouseEvent)` |
| `node-context-menu` | `(node: GraphNode, event: MouseEvent)` |
| `node-drag-start` | `(node: GraphNode, event: MouseEvent)` |
| `node-drag-end` | `(node: GraphNode, event: MouseEvent)` |
| `link-double-click` | `(link: GraphLink, event: MouseEvent)` |
| `link-context-menu` | `(link: GraphLink, event: MouseEvent)` |
| `zoom-change` | `(transform: { x: number; y: number; k: number })` |

### Slots

| Slot | Props | Purpose |
|---|---|---|
| `node` | `{ node, selected, pinned }` | Custom node rendering |
| `link` | `{ link, selected }` | Custom link rendering |
| `node-label` | `{ node }` | Custom node label |
| `overlay` | `{ transform, nodes, links }` | Extra SVG content inside zoom group, with access to current node/link positions |

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
│       └── svg.ts              # SVG string parsing (svgIcon → DOM), path generators (straight/curved link paths)
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

**Runtime:** `d3-force`, `d3-zoom`, `d3-selection` (individual modules — no `d3-drag`, drag is implemented with raw mouse/touch events)

**Peer:** `vue >= 3.4`

**Dev:** `typescript`, `vite`, `@vitejs/plugin-vue`, `vue-tsc`, `eslint`, `@antfu/eslint-config`, `vue-router` (showcase only)

## Build Outputs

Library mode via Vite:
- `dist/neo-vue3-d3-network.es.js` (ESM)
- `dist/neo-vue3-d3-network.umd.js` (UMD)
- `dist/style.css`
- `dist/types/` (declaration files via vue-tsc)

## Feature Parity with Reference (`vue3-d3-network`)

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

7. **Resize handling via ResizeObserver** owned by `useForceGraph` orchestrator. On resize: updates internal size state, recalculates force center positions, restarts simulation at low alpha (0.1). No separate composable needed — it's a few lines wired in the orchestrator's `onMounted`/`onUnmounted`.

8. **viewBox uses `"0 0 width height"` (origin at top-left).** Force center targets `(width/2, height/2)`. This is the simplest coordinate system and aligns with how d3-zoom works — the zoom transform translates from this origin.

9. **shallowRef + triggerRef for simulation reactivity.** D3 mutates node objects in-place during simulation ticks. Rather than copying arrays every frame (expensive for large graphs), we store nodes/links in `shallowRef` and call `triggerRef()` after each tick to notify Vue. This gives us 60fps rendering without GC pressure.
