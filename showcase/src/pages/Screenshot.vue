<script setup lang="ts">
import { ref } from 'vue'
import { ForceGraph } from '@/index.ts'
import { sampleLinks, sampleNodes } from '../data.ts'

const graphRef = ref<InstanceType<typeof ForceGraph>>()
const format = ref<'png' | 'svg'>('png')

async function takeScreenshot() {
  if (!graphRef.value)
    return

  const blob = await graphRef.value.screenshot({
    format: format.value,
    background: format.value === 'png' ? '#1e293b' : undefined,
  })

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `graph.${format.value}`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="demo-section">
    <h2>Screenshot Export</h2>
    <p>Export the graph as PNG or SVG. The screenshot API returns a Blob for full control.</p>

    <div class="controls">
      <select v-model="format">
        <option value="png">
          PNG
        </option>
        <option value="svg">
          SVG
        </option>
      </select>
      <button @click="takeScreenshot">
        Download {{ format.toUpperCase() }}
      </button>
    </div>

    <div class="graph-container">
      <ForceGraph
        ref="graphRef"
        :nodes="sampleNodes"
        :links="sampleLinks"
        :node-size="8"
        :node-labels="true"
        :force="300"
      />
    </div>
  </div>
</template>
