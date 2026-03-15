<script setup lang="ts">
import { ref } from 'vue'
import { ForceGraph } from '@/index.ts'
import { generateLinks, generateNodes } from '../data.ts'

const nodeCount = ref(12)
const linkCount = ref(16)
const nodes = ref(generateNodes(nodeCount.value))
const links = ref(generateLinks(nodeCount.value, linkCount.value))

function regenerate() {
  nodes.value = generateNodes(nodeCount.value)
  links.value = generateLinks(nodeCount.value, linkCount.value)
}
</script>

<template>
  <div class="demo-section">
    <h2>Basic Graph</h2>
    <p>The simplest setup: pass nodes and links, get a force-directed graph.</p>

    <div class="controls">
      <label>
        Nodes: {{ nodeCount }}
        <input v-model.number="nodeCount" type="range" min="3" max="50">
      </label>
      <label>
        Links: {{ linkCount }}
        <input v-model.number="linkCount" type="range" min="2" max="80">
      </label>
      <button @click="regenerate">
        Regenerate
      </button>
    </div>

    <div class="graph-container">
      <ForceGraph :nodes="nodes" :links="links" :node-size="6" />
    </div>
  </div>
</template>
