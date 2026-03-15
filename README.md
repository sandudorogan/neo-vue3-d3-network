# neo-vue3-d3-network

A Vue 3 force-directed graph component powered by d3-force. Renders network graphs as SVG with support for zoom, pan, drag, selection, labels, curved links, custom node icons, and screenshots.

## Install

```bash
bun add neo-vue3-d3-network
```

## Quick start

```vue
<script setup>
import { ForceGraph } from 'neo-vue3-d3-network'
import 'neo-vue3-d3-network/style.css'

const nodes = [
  { id: 1, name: 'Node 1' },
  { id: 2, name: 'Node 2' },
  { id: 3, name: 'Node 3' },
]

const links = [
  { source: 1, target: 2 },
  { source: 2, target: 3 },
]
</script>

<template>
  <ForceGraph :nodes="nodes" :links="links" :node-labels="true" />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `nodes` | `GraphNode[]` | required | Array of nodes |
| `links` | `GraphLink[]` | required | Array of links |
| `nodeSize` | `number` | `5` | Default node radius |
| `linkWidth` | `number` | `1` | Default link stroke width |
| `force` | `number` | `500` | Force simulation strength |
| `forces` | `ForcesConfig` | — | Enable/disable individual forces (center, x, y, manyBody, link, collide) |
| `customForces` | `Record<string, Force>` | — | Custom d3 forces |
| `nodeLabels` | `boolean` | `false` | Show node labels |
| `linkLabels` | `boolean` | `false` | Show link labels |
| `fontSize` | `number` | `10` | Label font size |
| `curvedLinks` | `boolean` | `false` | Use curved link paths |
| `draggable` | `boolean` | `true` | Enable node dragging |
| `zoomable` | `boolean` | `true` | Enable zoom and pan |
| `selectable` | `boolean` | `true` | Enable node/link selection |
| `nodeFormatter` | `(node) => node` | — | Transform nodes before rendering |
| `linkFormatter` | `(link) => link` | — | Transform links before rendering |
| `simulationFormatter` | `(sim) => sim` | — | Configure the d3 simulation directly |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `node-click` | `(node, event)` | Node clicked |
| `link-click` | `(link, event)` | Link clicked |
| `node-double-click` | `(node, event)` | Node double-clicked |
| `node-context-menu` | `(node, event)` | Node right-clicked |
| `link-double-click` | `(link, event)` | Link double-clicked |
| `link-context-menu` | `(link, event)` | Link right-clicked |
| `node-drag-start` | `(node, event)` | Node drag started |
| `node-drag-end` | `(node, event)` | Node drag ended |
| `zoom-change` | `(transform)` | Zoom/pan changed |

## Exposed methods

Access via template ref:

```vue
<script setup>
const graph = ref()
</script>

<template>
  <ForceGraph ref="graph" :nodes="nodes" :links="links" />
</template>
```

- `selectNode(id)` / `deselectNode(id)` / `toggleNodeSelection(id)`
- `selectLink(id)` / `deselectLink(id)` / `toggleLinkSelection(id)`
- `clearSelection()`
- `pinNode(id)` / `unpinNode(id)`
- `zoomTo(transform)` / `zoomToFit()` / `resetZoom()`
- `restart()`
- `screenshot(options?)` — export as PNG or SVG

## Slots

- `#node="{ node, selected, pinned }"` — custom node rendering
- `#link="{ link, selected }"` — custom link rendering
- `#node-label="{ node }"` — custom node label
- `#overlay="{ transform, nodes, links }"` — SVG overlay layer

## Composables

For more control, use the composables directly instead of the component. Each composable handles one concern, and they stack on top of each other — start with data, add simulation, then layer on zoom, drag, selection, and screenshots as needed.

### useForceGraph — all-in-one

The simplest way to use composables. Wires everything together for you:

```ts
import { useForceGraph } from 'neo-vue3-d3-network'

const {
  containerRef,       // bind to your <svg> element
  simulatedNodes,     // reactive node positions (from useForceSimulation)
  simulatedLinks,     // reactive link positions (from useForceSimulation)
  transform,          // current zoom/pan state (from useZoom)
  selectedNodes,      // selected nodes map (from useSelection)
  selectedLinks,      // selected links map (from useSelection)
  selectNode, deselectNode, toggleNodeSelection,
  selectLink, deselectLink, toggleLinkSelection,
  clearSelection,
  pinNode, unpinNode,
  zoomTo, zoomToFit, resetZoom,
  restart,
  screenshot,
  consumeDrag,
} = useForceGraph({
  nodes: ref([{ id: 1 }, { id: 2 }, { id: 3 }]),
  links: ref([{ source: 1, target: 2 }, { source: 2, target: 3 }]),
  force: 500,
  draggable: true,
  zoomable: true,
})
```

### Stacking composables individually

When you need finer control, use the lower-level composables directly. Each one returns values that feed into the next:

```ts
import {
  useGraphData,
  useForceSimulation,
  useSelection,
  useZoom,
  useNodeDrag,
  useScreenshot,
} from 'neo-vue3-d3-network'
```

#### Layer 1: Data processing

`useGraphData` normalizes raw input into simulation-ready format. Start here.

```ts
const { processedNodes, processedLinks, nodeMap } = useGraphData({
  nodes: ref([{ id: 1 }, { id: 2 }, { id: 3 }]),
  links: ref([{ source: 1, target: 2 }, { source: 2, target: 3 }]),
  nodeFormatter: (node) => ({ ...node, _size: node.size ?? 5 }),
})
```

#### Layer 2: Force simulation

`useForceSimulation` takes processed data and runs the d3-force layout. Node positions update reactively on every tick.

```ts
const containerRef = ref<SVGSVGElement | null>(null)
const size = shallowRef({ width: 800, height: 600 })

const { nodes, links, restart } = useForceSimulation({
  nodes: processedNodes,    // ← from useGraphData
  links: processedLinks,    // ← from useGraphData
  force: 500,
  forces: { center: false, x: 0.5, y: 0.5, manyBody: true, link: true },
  size,
})
```

#### Layer 3: Zoom + pan

`useZoom` adds zoom/pan to the SVG container. Returns a `transform` that other composables need.

```ts
const { transform, zoomTo, resetZoom, zoomToFitBounds } = useZoom({
  containerRef,
  zoomable: true,
})
```

#### Layer 4: Node dragging

`useNodeDrag` enables dragging nodes. Needs the simulated nodes, the zoom transform (to convert screen→graph coordinates), and the simulation's `restart` function to reheat on drag.

```ts
const { consumeDrag } = useNodeDrag({
  containerRef,
  nodes,          // ← from useForceSimulation
  transform,      // ← from useZoom
  draggable: true,
  restart,        // ← from useForceSimulation
  onDragStart: (node, event) => { /* ... */ },
  onDragEnd: (node, event) => { /* ... */ },
})
```

#### Layer 5: Selection

`useSelection` is standalone — it just manages which nodes/links are selected.

```ts
const {
  selectedNodes, selectedLinks,
  selectNode, deselectNode, toggleNodeSelection,
  selectLink, deselectLink, toggleLinkSelection,
  clearSelection,
} = useSelection()
```

#### Layer 6: Screenshots

`useScreenshot` exports the current SVG state as PNG or SVG.

```ts
const { screenshot } = useScreenshot({ containerRef })
const blob = await screenshot({ format: 'png', background: '#fff' })
```

### Pick what you need

You don't have to use every layer. Some practical combinations:

**Simulation only** (no interaction) — static layout for a dashboard:
```ts
const { processedNodes, processedLinks } = useGraphData({ nodes, links })
const { nodes: positions, links: resolvedLinks } = useForceSimulation({
  nodes: processedNodes,
  links: processedLinks,
  size: shallowRef({ width: 800, height: 600 }),
})
```

**Simulation + zoom** (read-only interactive graph):
```ts
const data = useGraphData({ nodes, links })
const sim = useForceSimulation({ nodes: data.processedNodes, links: data.processedLinks, size })
const { transform } = useZoom({ containerRef, zoomable: true })
```

**Full stack minus screenshots** — just skip `useScreenshot`:
```ts
const data = useGraphData({ nodes, links })
const sim = useForceSimulation({ nodes: data.processedNodes, links: data.processedLinks, size })
const zoom = useZoom({ containerRef })
const drag = useNodeDrag({ containerRef, nodes: sim.nodes, transform: zoom.transform, restart: sim.restart })
const selection = useSelection()
```

### Data flow

```
Raw nodes/links
    │
    ▼
useGraphData ──→ processedNodes, processedLinks, nodeMap
    │
    ▼
useForceSimulation ──→ simulatedNodes, simulatedLinks, restart()
    │                         │
    │                         ├──→ useNodeDrag (reads nodes, calls restart)
    │                         └──→ rendering (v-for over positions)
    │
useZoom ──→ transform
    │           │
    │           └──→ useNodeDrag (screen→graph coordinate conversion)
    │
useSelection ──→ selectedNodes, selectedLinks (standalone)
    │
useScreenshot ──→ screenshot() (standalone, needs containerRef)
```

## Development

```bash
bun install
bun run dev        # run showcase app
bun run build      # build library
bun run typecheck  # type check
bun run lint       # lint
```

## License

MIT
