<script setup lang="ts">
import { ForceGraph } from '@/index.ts'
import { sampleLinks, sampleNodes } from '../data.ts'
</script>

<template>
  <div class="home">
    <div class="hero">
      <h1>neo-vue3-d3-network</h1>
      <p>A composable-first Vue 3 library for force-directed network graphs powered by D3.</p>
      <div class="badges">
        <span class="badge">Vue 3</span>
        <span class="badge">TypeScript</span>
        <span class="badge">D3 Force</span>
        <span class="badge">Composable API</span>
      </div>
    </div>

    <div class="graph-container hero-graph">
      <ForceGraph
        :nodes="sampleNodes"
        :links="sampleLinks"
        :node-labels="true"
        :font-size="11"
        :node-size="8"
        :force="300"
      />
    </div>

    <div class="features">
      <div class="feature">
        <h3>Composable-First</h3>
        <p>Use <code>useForceGraph()</code> for full control or <code>&lt;ForceGraph&gt;</code> for quick setup.</p>
      </div>
      <div class="feature">
        <h3>TypeScript Native</h3>
        <p>Full type safety with well-defined interfaces for nodes, links, and configuration.</p>
      </div>
      <div class="feature">
        <h3>Interactive</h3>
        <p>Drag, pin, zoom, pan, and select nodes and links out of the box.</p>
      </div>
      <div class="feature">
        <h3>Customizable</h3>
        <p>Slots for custom node/link rendering, per-node styling, SVG icon support.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  max-width: 900px;
}

.hero {
  margin-bottom: 2rem;
}

.hero h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #f1f5f9;
  margin-bottom: 0.5rem;
}

.hero p {
  color: #94a3b8;
  font-size: 1.125rem;
  line-height: 1.6;
}

.badges {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.badge {
  background: rgba(129, 140, 248, 0.15);
  color: #818cf8;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.hero-graph {
  height: 400px;
  margin-bottom: 2rem;
}

.features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.feature {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 1.25rem;
}

.feature h3 {
  font-size: 1rem;
  color: #f1f5f9;
  margin-bottom: 0.5rem;
}

.feature p {
  color: #94a3b8;
  font-size: 0.875rem;
  line-height: 1.5;
}

.feature code {
  background: rgba(129, 140, 248, 0.1);
  color: #818cf8;
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
  font-size: 0.8rem;
}
</style>
