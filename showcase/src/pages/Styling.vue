<script setup lang="ts">
import { ForceGraph } from '@/index.ts'
import { styledLinks, styledNodes } from '../data.ts'
</script>

<template>
  <div class="demo-section">
    <h2>Styling</h2>
    <p>Nodes and links support per-element colors and sizes. Set <code>color</code> and <code>size</code> on nodes, <code>color</code> and <code>width</code> on links.</p>

    <div class="graph-container">
      <ForceGraph
        :nodes="styledNodes"
        :links="styledLinks"
        :node-labels="true"
        :link-width="1"
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
