<script setup lang="ts">
import type { GraphLink, GraphNode } from '@/types.ts'
import { ForceGraph } from '@/index.ts'

const starSvg = `<svg viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="currentColor"/></svg>`
const hexSvg = `<svg viewBox="0 0 24 24"><polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" fill="currentColor"/></svg>`

const nodes: GraphNode[] = [
  { id: 0, name: 'Star A', svgIcon: starSvg, color: '#f59e0b', size: 14 },
  { id: 1, name: 'Star B', svgIcon: starSvg, color: '#ef4444', size: 12 },
  { id: 2, name: 'Hex A', svgIcon: hexSvg, color: '#22c55e', size: 14 },
  { id: 3, name: 'Hex B', svgIcon: hexSvg, color: '#06b6d4', size: 12 },
  { id: 4, name: 'Circle', size: 10 },
  { id: 5, name: 'Small', size: 5 },
]

const links: GraphLink[] = [
  { source: 0, target: 1 },
  { source: 0, target: 2 },
  { source: 1, target: 3 },
  { source: 2, target: 3 },
  { source: 3, target: 4 },
  { source: 4, target: 5 },
  { source: 5, target: 0 },
]
</script>

<template>
  <div class="demo-section">
    <h2>Custom Nodes</h2>
    <p>Use <code>svgIcon</code> on nodes to render custom SVG shapes. Nodes without icons render as circles.</p>

    <div class="graph-container">
      <ForceGraph
        :nodes="nodes"
        :links="links"
        :node-labels="true"
        :force="200"
      />
    </div>
  </div>
</template>

<style scoped>
code {
  background: rgba(129, 140, 248, 0.1);
  color: #818cf8;
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
  font-size: 0.8rem;
}
</style>
