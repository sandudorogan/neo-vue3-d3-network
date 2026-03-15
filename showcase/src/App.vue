<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/basic', label: 'Basic' },
  { path: '/drag-pin', label: 'Drag & Pin' },
  { path: '/zoom', label: 'Zoom' },
  { path: '/styling', label: 'Styling' },
  { path: '/labels', label: 'Labels' },
  { path: '/curved-links', label: 'Curves' },
  { path: '/selection', label: 'Selection' },
  { path: '/custom-nodes', label: 'Custom Nodes' },
  { path: '/forces', label: 'Forces' },
  { path: '/screenshot', label: 'Screenshot' },
  { path: '/kitchen', label: 'Kitchen Sink' },
]
</script>

<template>
  <div class="app">
    <nav class="sidebar">
      <h1 class="logo">
        neo-vue3-d3-network
      </h1>
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="nav-link"
        active-class="active"
      >
        {{ item.label }}
      </RouterLink>
    </nav>
    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #0f172a;
  color: #e2e8f0;
}

.app {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 220px;
  background: #1e293b;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  border-right: 1px solid #334155;
  flex-shrink: 0;
}

.logo {
  font-size: 0.875rem;
  font-weight: 700;
  color: #818cf8;
  margin-bottom: 1.5rem;
  padding: 0 0.75rem;
  letter-spacing: -0.02em;
}

.nav-link {
  color: #94a3b8;
  text-decoration: none;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.15s;
}

.nav-link:hover {
  color: #e2e8f0;
  background: #334155;
}

.nav-link.active {
  color: #818cf8;
  background: rgba(129, 140, 248, 0.1);
}

.content {
  flex: 1;
  padding: 2rem;
  overflow: auto;
}

.demo-section {
  margin-bottom: 2rem;
}

.demo-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #f1f5f9;
}

.demo-section p {
  color: #94a3b8;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.graph-container {
  width: 100%;
  height: 500px;
  background: #1e293b;
  border-radius: 12px;
  border: 1px solid #334155;
  overflow: hidden;
}

.controls {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.controls button {
  padding: 0.4rem 0.8rem;
  background: #334155;
  border: 1px solid #475569;
  color: #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.15s;
}

.controls button:hover {
  background: #475569;
}

.controls label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #94a3b8;
  font-size: 0.8rem;
}

.controls input[type="range"] {
  width: 100px;
}

.controls select {
  padding: 0.4rem 0.6rem;
  background: #334155;
  border: 1px solid #475569;
  color: #e2e8f0;
  border-radius: 6px;
  font-size: 0.8rem;
}
</style>
