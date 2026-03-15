import type { Ref } from 'vue'
import type { ForceGraphOptions, SimulatedLink } from '../types.ts'
import { onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import { useForceSimulation } from './useForceSimulation.ts'
import { useGraphData } from './useGraphData.ts'
import { useNodeDrag } from './useNodeDrag.ts'
import { useScreenshot } from './useScreenshot.ts'
import { useSelection } from './useSelection.ts'
import { useZoom } from './useZoom.ts'

export function useForceGraph(options: ForceGraphOptions) {
  const containerRef = ref<SVGSVGElement | null>(null) as Ref<SVGSVGElement | null>
  const size = shallowRef({ width: 800, height: 600 })
  let resizeObserver: ResizeObserver | null = null

  const { processedNodes, processedLinks, nodeMap } = useGraphData({
    nodes: options.nodes,
    links: options.links,
    nodeFormatter: options.nodeFormatter,
    linkFormatter: options.linkFormatter,
  })

  const simulation = useForceSimulation({
    nodes: processedNodes,
    links: processedLinks,
    force: options.force,
    forces: options.forces,
    customForces: options.customForces,
    simulationFormatter: options.simulationFormatter,
    size,
  })

  const selection = useSelection()

  const zoomState = useZoom({
    containerRef,
    zoomable: options.zoomable,
  })

  const drag = useNodeDrag({
    containerRef,
    nodes: simulation.nodes,
    transform: zoomState.transform,
    draggable: options.draggable,
    restart: simulation.restart,
  })

  const { screenshot } = useScreenshot({ containerRef })

  function pinNode(id: string | number) {
    const node = nodeMap.value.get(id)
    if (node) {
      node.pinned = true
      node.fx = node.x
      node.fy = node.y
    }
  }

  function unpinNode(id: string | number) {
    const node = nodeMap.value.get(id)
    if (node) {
      node.pinned = false
      node.fx = null
      node.fy = null
    }
  }

  function zoomToFit(padding = 40) {
    const nodes = simulation.nodes.value
    if (nodes.length === 0)
      return

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    for (const node of nodes) {
      if (node.x < minX)
        minX = node.x
      if (node.y < minY)
        minY = node.y
      if (node.x > maxX)
        maxX = node.x
      if (node.y > maxY)
        maxY = node.y
    }

    zoomState.zoomToFitBounds({ minX, minY, maxX, maxY }, padding)
  }

  function observeSize() {
    const el = containerRef.value
    if (!el)
      return

    const updateSize = () => {
      const rect = el.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        size.value = { width: rect.width, height: rect.height }
      }
    }

    updateSize()
    resizeObserver = new ResizeObserver(updateSize)
    resizeObserver.observe(el)
  }

  watch(() => containerRef.value, (el) => {
    if (el) {
      observeSize()
    }
  })

  onMounted(() => {
    if (containerRef.value) {
      observeSize()
    }
  })

  onUnmounted(() => {
    resizeObserver?.disconnect()
  })

  return {
    containerRef,
    simulatedNodes: simulation.nodes,
    simulatedLinks: simulation.links,
    selectedNodes: selection.selectedNodes,
    selectedLinks: selection.selectedLinks,
    transform: zoomState.transform,
    size,

    selectNode: (id: string | number) => {
      const node = nodeMap.value.get(id)
      if (node)
        selection.selectNode(id, node)
    },
    deselectNode: selection.deselectNode,
    toggleNodeSelection: (id: string | number) => {
      const node = nodeMap.value.get(id)
      if (node)
        selection.toggleNodeSelection(id, node)
    },
    selectLink: (id: string | number) => {
      const link = simulation.links.value.find((l: SimulatedLink) => l.id === id)
      if (link)
        selection.selectLink(id, link)
    },
    deselectLink: selection.deselectLink,
    toggleLinkSelection: (id: string | number) => {
      const link = simulation.links.value.find((l: SimulatedLink) => l.id === id)
      if (link)
        selection.toggleLinkSelection(id, link)
    },
    clearSelection: selection.clearSelection,
    pinNode,
    unpinNode,
    zoomTo: zoomState.zoomTo,
    zoomToFit,
    resetZoom: zoomState.resetZoom,
    restart: simulation.restart,
    screenshot,
    consumeDrag: drag.consumeDrag,
  }
}
