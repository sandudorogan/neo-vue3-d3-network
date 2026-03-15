<script setup lang="ts">
import type { ForcesConfig, GraphLink, GraphNode, SimulatedNode } from '@/types.ts'
import { ref } from 'vue'
import { ForceGraph } from '@/index.ts'
import { generateLinks, generateNodes } from '../data.ts'

const graphRef = ref<InstanceType<typeof ForceGraph>>()
const nodeCount = ref(15)
const linkCount = ref(22)
const nodes = ref<GraphNode[]>(generateNodes(nodeCount.value))
const links = ref<GraphLink[]>(generateLinks(nodeCount.value, linkCount.value))

const nodeSize = ref(7)
const linkWidth = ref(1)
const forceStrength = ref(400)
const showNodeLabels = ref(true)
const showLinkLabels = ref(false)
const fontSize = ref(10)
const curved = ref(false)
const draggable = ref(true)
const zoomable = ref(true)
const selectable = ref(true)

const forces = ref<ForcesConfig>({
  center: false,
  x: 0.5,
  y: 0.5,
  manyBody: true,
  link: true,
})

function regenerate() {
  nodes.value = generateNodes(nodeCount.value)
  links.value = generateLinks(nodeCount.value, linkCount.value)
}

function addNode() {
  const id = nodes.value.length
  nodes.value = [...nodes.value, { id, name: `Node ${id}` }]
  if (nodes.value.length > 1) {
    const target = Math.floor(Math.random() * (nodes.value.length - 1))
    links.value = [...links.value, { source: id, target }]
  }
}

function removeNode() {
  if (nodes.value.length <= 1)
    return
  const removed = nodes.value.at(-1)!
  nodes.value = nodes.value.slice(0, -1)
  links.value = links.value.filter(l => l.source !== removed.id && l.target !== removed.id)
}

function onNodeDoubleClick(node: SimulatedNode) {
  if (node.pinned) {
    graphRef.value?.unpinNode(node.id)
  }
  else {
    graphRef.value?.pinNode(node.id)
  }
}
</script>

<template>
  <div class="demo-section">
    <h2>Kitchen Sink</h2>
    <p>All features in one place. Every option is controllable.</p>

    <div class="controls" style="flex-direction: column; gap: 0.5rem;">
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <button @click="regenerate">
          Regenerate
        </button>
        <button @click="addNode">
          + Node
        </button>
        <button @click="removeNode">
          - Node
        </button>
        <button @click="graphRef?.zoomToFit()">
          Fit
        </button>
        <button @click="graphRef?.resetZoom()">
          Reset Zoom
        </button>
        <button @click="graphRef?.clearSelection()">
          Clear Selection
        </button>
      </div>
      <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
        <label>
          Nodes: {{ nodeCount }}
          <input v-model.number="nodeCount" type="range" min="3" max="50">
        </label>
        <label>
          Links: {{ linkCount }}
          <input v-model.number="linkCount" type="range" min="2" max="80">
        </label>
        <label>
          Node size: {{ nodeSize }}
          <input v-model.number="nodeSize" type="range" min="2" max="20">
        </label>
        <label>
          Link width: {{ linkWidth }}
          <input v-model.number="linkWidth" type="range" min="1" max="5">
        </label>
      </div>
      <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
        <label>
          Force: {{ forceStrength }}
          <input v-model.number="forceStrength" type="range" min="50" max="2000">
        </label>
        <label>
          Font: {{ fontSize }}px
          <input v-model.number="fontSize" type="range" min="6" max="18">
        </label>
      </div>
      <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
        <label><input v-model="showNodeLabels" type="checkbox"> Node labels</label>
        <label><input v-model="showLinkLabels" type="checkbox"> Link labels</label>
        <label><input v-model="curved" type="checkbox"> Curved</label>
        <label><input v-model="draggable" type="checkbox"> Draggable</label>
        <label><input v-model="zoomable" type="checkbox"> Zoomable</label>
        <label><input v-model="selectable" type="checkbox"> Selectable</label>
      </div>
    </div>

    <div class="graph-container" style="height: 600px;">
      <ForceGraph
        ref="graphRef"
        :nodes="nodes"
        :links="links"
        :node-size="nodeSize"
        :link-width="linkWidth"
        :force="forceStrength"
        :forces="forces"
        :node-labels="showNodeLabels"
        :link-labels="showLinkLabels"
        :font-size="fontSize"
        :curved-links="curved"
        :draggable="draggable"
        :zoomable="zoomable"
        :selectable="selectable"
        @node-double-click="onNodeDoubleClick"
      />
    </div>
  </div>
</template>
