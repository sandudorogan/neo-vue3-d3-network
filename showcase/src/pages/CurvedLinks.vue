<script setup lang="ts">
import { ref } from 'vue'
import { ForceGraph } from '@/index.ts'
import { sampleLinks, sampleNodes } from '../data.ts'

const curved = ref(false)
</script>

<template>
  <div class="demo-section">
    <h2>Curved Links</h2>
    <p>Toggle between straight lines and quadratic bezier curves for link paths.</p>

    <div class="controls">
      <label>
        <input v-model="curved" type="checkbox">
        Curved links
      </label>
    </div>

    <div class="graph-container">
      <ForceGraph
        :nodes="sampleNodes"
        :links="sampleLinks"
        :curved-links="curved"
        :node-size="7"
        :node-labels="true"
      />
    </div>
  </div>
</template>
