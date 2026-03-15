<script setup lang="ts">
import type { ForcesConfig } from '@/types.ts'
import { ref } from 'vue'
import { ForceGraph } from '@/index.ts'
import { generateLinks, generateNodes } from '../data.ts'

const nodes = ref(generateNodes(20))
const links = ref(generateLinks(20, 28))

const forceStrength = ref(500)
const useCenter = ref(false)
const xStrength = ref(0.5)
const yStrength = ref(0.5)
const useManyBody = ref(true)
const useLink = ref(true)
const useCollide = ref(false)
const collideRadius = ref(10)

const forcesConfig = ref<ForcesConfig>({})

function updateForces() {
  forcesConfig.value = {
    center: useCenter.value,
    x: xStrength.value,
    y: yStrength.value,
    manyBody: useManyBody.value,
    link: useLink.value,
    collide: useCollide.value ? collideRadius.value : false,
  }
}

updateForces()
</script>

<template>
  <div class="demo-section">
    <h2>Force Configuration</h2>
    <p>Tweak individual D3 forces to see how they affect the layout.</p>

    <div class="controls" style="flex-direction: column; gap: 0.5rem;">
      <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
        <label>
          Strength: {{ forceStrength }}
          <input v-model.number="forceStrength" type="range" min="50" max="2000" @input="updateForces">
        </label>
        <label>
          X pull: {{ xStrength }}
          <input v-model.number="xStrength" type="range" min="0" max="1" step="0.1" @input="updateForces">
        </label>
        <label>
          Y pull: {{ yStrength }}
          <input v-model.number="yStrength" type="range" min="0" max="1" step="0.1" @input="updateForces">
        </label>
      </div>
      <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
        <label>
          <input v-model="useCenter" type="checkbox" @change="updateForces">
          Center force
        </label>
        <label>
          <input v-model="useManyBody" type="checkbox" @change="updateForces">
          Many-body
        </label>
        <label>
          <input v-model="useLink" type="checkbox" @change="updateForces">
          Link force
        </label>
        <label>
          <input v-model="useCollide" type="checkbox" @change="updateForces">
          Collide (r={{ collideRadius }})
          <input v-model.number="collideRadius" type="range" min="2" max="30" @input="updateForces">
        </label>
      </div>
    </div>

    <div class="graph-container">
      <ForceGraph
        :nodes="nodes"
        :links="links"
        :force="forceStrength"
        :forces="forcesConfig"
        :node-size="6"
      />
    </div>
  </div>
</template>
