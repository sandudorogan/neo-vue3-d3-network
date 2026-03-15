<script setup lang="ts">
import type { GraphLink, GraphNode } from '@/types.ts'
import { ref } from 'vue'
import { ForceGraph } from '@/index.ts'

const showNodeLabels = ref(true)
const showLinkLabels = ref(true)
const fontSize = ref(11)

const nodes: GraphNode[] = [
  { id: 0, name: 'Server' },
  { id: 1, name: 'Database' },
  { id: 2, name: 'Cache' },
  { id: 3, name: 'Client A' },
  { id: 4, name: 'Client B' },
  { id: 5, name: 'CDN' },
]

const links: GraphLink[] = [
  { source: 3, target: 0, name: 'HTTP' },
  { source: 4, target: 0, name: 'WebSocket' },
  { source: 0, target: 1, name: 'SQL' },
  { source: 0, target: 2, name: 'Redis' },
  { source: 3, target: 5, name: 'Static' },
  { source: 4, target: 5, name: 'Assets' },
]
</script>

<template>
  <div class="demo-section">
    <h2>Labels</h2>
    <p>Toggle node and link labels. Link labels follow the link path using SVG textPath.</p>

    <div class="controls">
      <label>
        <input v-model="showNodeLabels" type="checkbox">
        Node labels
      </label>
      <label>
        <input v-model="showLinkLabels" type="checkbox">
        Link labels
      </label>
      <label>
        Font: {{ fontSize }}px
        <input v-model.number="fontSize" type="range" min="8" max="18">
      </label>
    </div>

    <div class="graph-container">
      <ForceGraph
        :nodes="nodes"
        :links="links"
        :node-labels="showNodeLabels"
        :link-labels="showLinkLabels"
        :font-size="fontSize"
        :node-size="8"
        :force="250"
      />
    </div>
  </div>
</template>
