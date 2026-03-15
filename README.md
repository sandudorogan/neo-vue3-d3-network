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

For more control, use the composables directly instead of the component:

```ts
import { useForceGraph } from 'neo-vue3-d3-network'
```

Available composables: `useForceGraph`, `useForceSimulation`, `useGraphData`, `useNodeDrag`, `useScreenshot`, `useSelection`, `useZoom`.

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
