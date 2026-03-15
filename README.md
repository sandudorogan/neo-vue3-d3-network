# neo-vue3-d3-network

Vue 3 force-directed graph component powered by d3-force. SVG rendering with zoom, pan, drag, selection, labels, curved links, and screenshots.

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

| Prop | Type | Default |
|------|------|---------|
| `nodes` | `GraphNode[]` | required |
| `links` | `GraphLink[]` | required |
| `nodeSize` | `number` | `5` |
| `linkWidth` | `number` | `1` |
| `force` | `number` | `500` |
| `forces` | `ForcesConfig` | — |
| `customForces` | `Record<string, Force>` | — |
| `nodeLabels` | `boolean` | `false` |
| `linkLabels` | `boolean` | `false` |
| `fontSize` | `number` | `10` |
| `curvedLinks` | `boolean` | `false` |
| `draggable` | `boolean` | `true` |
| `zoomable` | `boolean` | `true` |
| `selectable` | `boolean` | `true` |
| `nodeFormatter` | `(node) => node` | — |
| `linkFormatter` | `(link) => link` | — |
| `simulationFormatter` | `(sim) => sim` | — |

## Events

| Event | Payload |
|-------|---------|
| `node-click` | `(node, event)` |
| `link-click` | `(link, event)` |
| `node-double-click` | `(node, event)` |
| `node-context-menu` | `(node, event)` |
| `link-double-click` | `(link, event)` |
| `link-context-menu` | `(link, event)` |
| `node-drag-start` | `(node, event)` |
| `node-drag-end` | `(node, event)` |
| `zoom-change` | `(transform)` |

## Methods

Access via template ref:

```vue
<script setup>
const graph = ref()
graph.value.zoomToFit()
</script>

<template>
  <ForceGraph ref="graph" :nodes="nodes" :links="links" />
</template>
```

- `selectNode(id)` / `deselectNode(id)` / `toggleNodeSelection(id)`
- `selectLink(id)` / `deselectLink(id)` / `toggleLinkSelection(id)`
- `clearSelection()`
- `pinNode(id)` / `unpinNode(id)`
- `zoomTo(scale)` / `zoomToFit()` / `resetZoom()`
- `restart()`
- `screenshot(options?)` — PNG or SVG blob

## Slots

| Slot | Props |
|------|-------|
| `#node` | `{ node, selected, pinned }` |
| `#link` | `{ link, selected }` |
| `#node-label` | `{ node }` |
| `#overlay` | `{ transform, nodes, links }` |

## Composables

For more control, use the composables directly. Each one handles a single concern and they stack on top of each other.

### useForceGraph — all-in-one

Wires everything together:

```ts
import { useForceGraph } from 'neo-vue3-d3-network'

const {
  containerRef,       // bind to your <svg>
  simulatedNodes,     // reactive node positions
  simulatedLinks,     // reactive link positions
  transform,          // zoom/pan state
  selectedNodes,      // selected nodes map
  selectedLinks,      // selected links map
  selectNode, deselectNode, toggleNodeSelection,
  selectLink, deselectLink, toggleLinkSelection,
  clearSelection,
  pinNode, unpinNode,
  zoomTo, zoomToFit, resetZoom,
  restart, screenshot, consumeDrag,
} = useForceGraph({
  nodes: ref([{ id: 1 }, { id: 2 }, { id: 3 }]),
  links: ref([{ source: 1, target: 2 }, { source: 2, target: 3 }]),
  force: 500,
  draggable: true,
  zoomable: true,
})
```

### Stacking composables individually

Each layer's output feeds into the next:

```ts
import {
  useGraphData, useForceSimulation, useZoom,
  useNodeDrag, useSelection, useScreenshot,
} from 'neo-vue3-d3-network'

// Layer 1 — normalize raw input
const { processedNodes, processedLinks, nodeMap } = useGraphData({
  nodes, links,
  nodeFormatter: (node) => ({ ...node, _size: node.size ?? 5 }),
})

// Layer 2 — run d3-force layout (positions update reactively each tick)
const containerRef = ref<SVGSVGElement | null>(null)
const size = shallowRef({ width: 800, height: 600 })
const { nodes: simNodes, links: simLinks, restart } = useForceSimulation({
  nodes: processedNodes,    // ← from useGraphData
  links: processedLinks,    // ← from useGraphData
  force: 500,
  size,
})

// Layer 3 — zoom + pan
const { transform, zoomTo, resetZoom, zoomToFitBounds } = useZoom({
  containerRef,
  zoomable: true,
})

// Layer 4 — node dragging (needs simulation nodes, zoom transform, and restart)
const { consumeDrag } = useNodeDrag({
  containerRef,
  nodes: simNodes,    // ← from useForceSimulation
  transform,          // ← from useZoom
  restart,            // ← from useForceSimulation
  draggable: true,
})

// Layer 5 — selection (standalone)
const { selectedNodes, selectedLinks, toggleNodeSelection, clearSelection } = useSelection()

// Layer 6 — screenshots (standalone)
const { screenshot } = useScreenshot({ containerRef })
```

### Pick what you need

```ts
// Simulation only — static layout, no interaction
const data = useGraphData({ nodes, links })
const sim = useForceSimulation({ nodes: data.processedNodes, links: data.processedLinks, size })

// Add zoom for a read-only interactive graph
const { transform } = useZoom({ containerRef, zoomable: true })

// Full stack minus screenshots
const drag = useNodeDrag({ containerRef, nodes: sim.nodes, transform, restart: sim.restart })
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
bun run dev        # showcase app
bun run build      # build library
bun run typecheck  # type check
bun run lint       # lint
```

## License

MIT
