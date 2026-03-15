<script setup lang="ts">
import type { SimulatedNode } from '@/types.ts'
import { ref } from 'vue'
import { ForceGraph } from '@/index.ts'
import { sampleLinks, sampleNodes } from '../data.ts'

const graphRef = ref<InstanceType<typeof ForceGraph>>()
const pinnedNodes = ref<Set<number | string>>(new Set())

function onNodeDoubleClick(node: SimulatedNode) {
  if (pinnedNodes.value.has(node.id)) {
    pinnedNodes.value.delete(node.id)
    graphRef.value?.unpinNode(node.id)
  }
  else {
    pinnedNodes.value.add(node.id)
    graphRef.value?.pinNode(node.id)
  }
  pinnedNodes.value = new Set(pinnedNodes.value)
}

function unpinAll() {
  for (const id of pinnedNodes.value) {
    graphRef.value?.unpinNode(id)
  }
  pinnedNodes.value = new Set()
}
</script>

<template>
  <div class="demo-section">
    <h2>Drag & Pin</h2>
    <p>Drag nodes to rearrange. Double-click to pin/unpin a node at its current position. Pinned nodes show a red border.</p>

    <div class="controls">
      <button @click="unpinAll">
        Unpin All
      </button>
      <span v-if="pinnedNodes.size" style="color: #94a3b8; font-size: 0.8rem; align-self: center;">
        {{ pinnedNodes.size }} pinned
      </span>
    </div>

    <div class="graph-container">
      <ForceGraph
        ref="graphRef"
        :nodes="sampleNodes"
        :links="sampleLinks"
        :node-size="8"
        :node-labels="true"
        @node-double-click="onNodeDoubleClick"
      />
    </div>
  </div>
</template>
