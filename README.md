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

Use the lower-level composables when you need finer control. Each layer's output feeds into the next:

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

You don't have to use every layer:

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
bun run dev        # run showcase app
bun run build      # build library
bun run typecheck  # type check
bun run lint       # lint
```

## License

MIT
