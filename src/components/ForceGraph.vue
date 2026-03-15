<script setup lang="ts">
import type { Force, Simulation } from 'd3-force'
import type { ComponentPublicInstance } from 'vue'
import type {
  ForcesConfig,
  GraphLink,
  GraphNode,
  ScreenshotOptions,
  SimulatedLink,
  SimulatedNode,
  ZoomTransform,
} from '../types.ts'
import { computed, toRefs, watch } from 'vue'
import { useForceGraph } from '../composables/useForceGraph.ts'
import { curvedLinkPath, linkClasses, nodeClasses, parseSvgIcon, straightLinkPath } from '../utils/svg.ts'

const props = withDefaults(defineProps<{
  nodes: GraphNode[]
  links: GraphLink[]
  nodeSize?: number
  linkWidth?: number
  force?: number
  forces?: ForcesConfig
  customForces?: Record<string, Force<SimulatedNode, SimulatedLink>>
  nodeLabels?: boolean
  linkLabels?: boolean
  fontSize?: number
  curvedLinks?: boolean
  draggable?: boolean
  zoomable?: boolean
  selectable?: boolean
  nodeFormatter?: (node: GraphNode) => GraphNode
  linkFormatter?: (link: GraphLink) => GraphLink
  simulationFormatter?: (sim: Simulation<SimulatedNode, SimulatedLink>) => Simulation<SimulatedNode, SimulatedLink>
}>(), {
  nodeSize: 5,
  linkWidth: 1,
  force: 500,
  fontSize: 10,
  curvedLinks: false,
  draggable: true,
  zoomable: true,
  selectable: true,
  nodeLabels: false,
  linkLabels: false,
})

const emit = defineEmits<{
  'node-click': [node: SimulatedNode, event: MouseEvent]
  'link-click': [link: SimulatedLink, event: MouseEvent]
  'node-double-click': [node: SimulatedNode, event: MouseEvent]
  'node-context-menu': [node: SimulatedNode, event: MouseEvent]
  'link-double-click': [link: SimulatedLink, event: MouseEvent]
  'link-context-menu': [link: SimulatedLink, event: MouseEvent]
  'node-drag-start': [node: SimulatedNode, event: MouseEvent | TouchEvent]
  'node-drag-end': [node: SimulatedNode, event: MouseEvent | TouchEvent]
  'zoom-change': [transform: ZoomTransform]
}>()

const { nodes, links } = toRefs(props)

const graph = useForceGraph({
  nodes,
  links,
  nodeSize: computed(() => props.nodeSize),
  linkWidth: computed(() => props.linkWidth),
  force: computed(() => props.force),
  forces: computed(() => props.forces),
  customForces: computed(() => props.customForces),
  nodeLabels: computed(() => props.nodeLabels),
  linkLabels: computed(() => props.linkLabels),
  fontSize: computed(() => props.fontSize),
  curvedLinks: computed(() => props.curvedLinks),
  draggable: computed(() => props.draggable),
  zoomable: computed(() => props.zoomable),
  selectable: computed(() => props.selectable),
  nodeFormatter: props.nodeFormatter,
  linkFormatter: props.linkFormatter,
  simulationFormatter: props.simulationFormatter,
})

const viewBox = computed(() => `0 0 ${graph.size.value.width} ${graph.size.value.height}`)
const zoomTransformStr = computed(() => `translate(${graph.transform.value.x},${graph.transform.value.y}) scale(${graph.transform.value.k})`)

function getLinkPath(link: SimulatedLink): string {
  return props.curvedLinks ? curvedLinkPath(link) : straightLinkPath(link)
}

function isNodeSelected(node: SimulatedNode): boolean {
  return graph.selectedNodes.value.has(node.id)
}

function isLinkSelected(link: SimulatedLink): boolean {
  return graph.selectedLinks.value.has(link.id)
}

function onNodeClick(node: SimulatedNode, event: MouseEvent) {
  if (graph.consumeDrag())
    return
  if (props.selectable) {
    graph.toggleNodeSelection(node.id)
  }
  emit('node-click', node, event)
}

function onLinkClick(link: SimulatedLink, event: MouseEvent) {
  if (props.selectable) {
    graph.toggleLinkSelection(link.id)
  }
  emit('link-click', link, event)
}

function getNodeIcon(node: SimulatedNode) {
  if (!node.svgIcon)
    return null
  return parseSvgIcon(node.svgIcon)
}

watch(() => graph.transform.value, (t) => {
  emit('zoom-change', t)
})

defineExpose({
  selectNode: graph.selectNode,
  deselectNode: graph.deselectNode,
  toggleNodeSelection: graph.toggleNodeSelection,
  selectLink: graph.selectLink,
  deselectLink: graph.deselectLink,
  toggleLinkSelection: graph.toggleLinkSelection,
  clearSelection: graph.clearSelection,
  pinNode: graph.pinNode,
  unpinNode: graph.unpinNode,
  zoomTo: graph.zoomTo,
  zoomToFit: graph.zoomToFit,
  resetZoom: graph.resetZoom,
  restart: graph.restart,
  screenshot: (opts?: ScreenshotOptions) => graph.screenshot(opts),
})
</script>

<template>
  <svg
    :ref="(el: Element | ComponentPublicInstance | null) => { graph.containerRef.value = el as SVGSVGElement | null }"
    class="force-graph"
    :viewBox="viewBox"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g class="zoom-layer" :transform="zoomTransformStr">
      <g class="links">
        <template v-for="link in graph.simulatedLinks.value" :key="link.id">
          <slot
            name="link"
            :link="link"
            :selected="isLinkSelected(link)"
          >
            <path
              :id="`link-${link.id}`"
              :data-link-id="link.id"
              :class="linkClasses(link, isLinkSelected(link))"
              :d="getLinkPath(link)"
              :stroke="link.color ?? '#999'"
              :stroke-width="link.width ?? props.linkWidth"
              fill="none"
              v-bind="link.svgAttrs"
              @click.stop="onLinkClick(link, $event)"
              @dblclick.stop="emit('link-double-click', link, $event)"
              @contextmenu.prevent="emit('link-context-menu', link, $event)"
            />
          </slot>
        </template>
      </g>

      <g class="nodes">
        <template v-for="node in graph.simulatedNodes.value" :key="node.id">
          <slot
            name="node"
            :node="node"
            :selected="isNodeSelected(node)"
            :pinned="!!node.pinned"
          >
            <g
              :data-node-id="node.id"
              :class="nodeClasses(node, isNodeSelected(node), !!node.pinned)"
              :transform="`translate(${node.x},${node.y})`"
              :style="node.color ? { color: node.color } : undefined"
              @click.stop="onNodeClick(node, $event)"
              @dblclick.stop="emit('node-double-click', node, $event)"
              @contextmenu.prevent="emit('node-context-menu', node, $event)"
            >
              <template v-if="getNodeIcon(node)">
                <svg
                  :x="-(node.iconWidth ?? node.size ?? props.nodeSize)"
                  :y="-(node.iconHeight ?? node.size ?? props.nodeSize)"
                  :width="(node.iconWidth ?? node.size ?? props.nodeSize) * 2"
                  :height="(node.iconHeight ?? node.size ?? props.nodeSize) * 2"
                  :viewBox="getNodeIcon(node)!.viewBox"
                  v-bind="node.svgAttrs"
                  v-html="getNodeIcon(node)!.content"
                />
              </template>
              <template v-else>
                <circle
                  :r="node.size ?? props.nodeSize"
                  :fill="node.color ?? '#6366f1'"
                  v-bind="node.svgAttrs"
                />
              </template>
            </g>
          </slot>
        </template>
      </g>

      <g v-if="props.nodeLabels" class="node-labels">
        <template v-for="node in graph.simulatedNodes.value" :key="`label-${node.id}`">
          <slot name="node-label" :node="node">
            <text
              :x="node.x"
              :y="node.y - (node.size ?? props.nodeSize) - 3"
              class="node-label" :class="[node.labelClass]"
              :font-size="props.fontSize"
              text-anchor="middle"
            >
              {{ node.name }}
            </text>
          </slot>
        </template>
      </g>

      <g v-if="props.linkLabels" class="link-labels">
        <text
          v-for="link in graph.simulatedLinks.value"
          :key="`link-label-${link.id}`"
          :font-size="props.fontSize"
          class="link-label"
          text-anchor="middle"
        >
          <textPath
            :href="`#link-${link.id}`"
            startOffset="50%"
          >
            {{ link.name }}
          </textPath>
        </text>
      </g>

      <slot
        name="overlay"
        :transform="graph.transform.value"
        :nodes="graph.simulatedNodes.value"
        :links="graph.simulatedLinks.value"
      />
    </g>
  </svg>
</template>

<style>
.force-graph {
  width: 100%;
  height: 100%;
  user-select: none;
  overflow: hidden;
}

.force-graph .node {
  cursor: grab;
}

.force-graph .node:active {
  cursor: grabbing;
}

.force-graph .node circle {
  stroke: #fff;
  stroke-width: 1.5;
  transition: r 0.2s ease;
}

.force-graph .node.selected circle {
  stroke: #f59e0b;
  stroke-width: 3;
}

.force-graph .node.pinned circle {
  stroke: #ef4444;
  stroke-width: 2;
}

.force-graph .link {
  cursor: pointer;
  transition: stroke-width 0.2s ease;
}

.force-graph .link.selected {
  stroke: #f59e0b !important;
  stroke-width: 3 !important;
}

.force-graph .node-label,
.force-graph .link-label {
  fill: #374151;
  pointer-events: none;
  font-family: sans-serif;
}
</style>
