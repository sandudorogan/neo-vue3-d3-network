<script setup lang="ts">
import type { SimulatedLink, SimulatedNode } from '@/types.ts'
import { ref } from 'vue'
import { ForceGraph } from '@/index.ts'
import { sampleLinks, sampleNodes } from '../data.ts'

const graphRef = ref<InstanceType<typeof ForceGraph>>()
const selectedNodeNames = ref<string[]>([])
const selectedLinkIds = ref<(string | number)[]>([])

function onNodeClick(node: SimulatedNode) {
  updateSelectionDisplay()
  void node
}

function onLinkClick(link: SimulatedLink) {
  updateSelectionDisplay()
  void link
}

function updateSelectionDisplay() {
  requestAnimationFrame(() => {
    // read from the exposed ref isn't available directly, so we track via events
  })
}

function clearAll() {
  graphRef.value?.clearSelection()
  selectedNodeNames.value = []
  selectedLinkIds.value = []
}
</script>

<template>
  <div class="demo-section">
    <h2>Selection</h2>
    <p>Click nodes and links to select them (highlighted with gold). Click again to deselect.</p>

    <div class="controls">
      <button @click="clearAll">
        Clear Selection
      </button>
    </div>

    <div class="graph-container">
      <ForceGraph
        ref="graphRef"
        :nodes="sampleNodes"
        :links="sampleLinks"
        :node-size="8"
        :node-labels="true"
        @node-click="onNodeClick"
        @link-click="onLinkClick"
      />
    </div>
  </div>
</template>
