<script setup lang="ts">
import type { ZoomTransform } from '@/types.ts'
import { ref } from 'vue'
import { ForceGraph } from '@/index.ts'
import { sampleLinks, sampleNodes } from '../data.ts'

const graphRef = ref<InstanceType<typeof ForceGraph>>()
const currentTransform = ref<ZoomTransform>({ x: 0, y: 0, k: 1 })

function onZoomChange(t: ZoomTransform) {
  currentTransform.value = t
}
</script>

<template>
  <div class="demo-section">
    <h2>Zoom & Pan</h2>
    <p>Scroll to zoom, click and drag the background to pan. Use the buttons to control zoom programmatically.</p>

    <div class="controls">
      <button @click="graphRef?.zoomTo(2)">
        Zoom 2x
      </button>
      <button @click="graphRef?.zoomTo(0.5)">
        Zoom 0.5x
      </button>
      <button @click="graphRef?.zoomToFit()">
        Fit to View
      </button>
      <button @click="graphRef?.resetZoom()">
        Reset Zoom
      </button>
      <span style="color: #64748b; font-size: 0.75rem; align-self: center;">
        x={{ currentTransform.x.toFixed(0) }}
        y={{ currentTransform.y.toFixed(0) }}
        scale={{ currentTransform.k.toFixed(2) }}
      </span>
    </div>

    <div class="graph-container">
      <ForceGraph
        ref="graphRef"
        :nodes="sampleNodes"
        :links="sampleLinks"
        :node-size="8"
        :node-labels="true"
        @zoom-change="onZoomChange"
      />
    </div>
  </div>
</template>
