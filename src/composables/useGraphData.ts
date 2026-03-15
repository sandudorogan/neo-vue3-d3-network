import type { MaybeRef } from 'vue'
import type { GraphLink, GraphNode, InputLink, SimulatedNode } from '../types.ts'
import { computed, toValue } from 'vue'

interface UseGraphDataOptions {
  nodes: MaybeRef<GraphNode[]>
  links: MaybeRef<GraphLink[]>
  nodeFormatter?: (node: GraphNode) => GraphNode
  linkFormatter?: (link: GraphLink) => GraphLink
}

export function useGraphData(options: UseGraphDataOptions) {
  const processedNodes = computed<SimulatedNode[]>(() => {
    const raw = toValue(options.nodes)
    return raw.map((node, index) => {
      const formatted = options.nodeFormatter ? options.nodeFormatter(node) : node
      return {
        ...formatted,
        id: formatted.id ?? index,
        name: formatted.name ?? `node ${formatted.id ?? index}`,
        x: formatted.x ?? 0,
        y: formatted.y ?? 0,
        vx: 0,
        vy: 0,
        index,
      }
    })
  })

  const processedLinks = computed<InputLink[]>(() => {
    const raw = toValue(options.links)
    return raw.map((link, index) => {
      const formatted = options.linkFormatter ? options.linkFormatter(link) : link
      return {
        ...formatted,
        id: formatted.id ?? `link-${index}`,
        index,
      }
    })
  })

  const nodeMap = computed(() => {
    const map = new Map<string | number, SimulatedNode>()
    for (const node of processedNodes.value) {
      map.set(node.id, node)
    }
    return map
  })

  return {
    processedNodes,
    processedLinks,
    nodeMap,
  }
}
