import type { MaybeRef, Ref, ShallowRef } from 'vue'
import type { SimulatedNode, ZoomTransform } from '../types.ts'
import { onUnmounted, toValue, watch } from 'vue'

interface UseNodeDragOptions {
  containerRef: Ref<SVGSVGElement | null>
  nodes: ShallowRef<SimulatedNode[]>
  transform: Ref<ZoomTransform>
  draggable?: MaybeRef<boolean>
  restart: (alpha?: number) => void
  onDragStart?: (node: SimulatedNode, event: MouseEvent | TouchEvent) => void
  onDragEnd?: (node: SimulatedNode, event: MouseEvent | TouchEvent) => void
}

export function useNodeDrag(options: UseNodeDragOptions) {
  let draggedNode: SimulatedNode | null = null
  let dragOffset = { x: 0, y: 0 }

  function findNodeFromEvent(event: Event): SimulatedNode | null {
    let target = event.target as Element | null
    while (target && target !== options.containerRef.value) {
      const nodeId = target.getAttribute('data-node-id')
      if (nodeId !== null) {
        const id = Number.isNaN(Number(nodeId)) ? nodeId : Number(nodeId)
        return options.nodes.value.find(n => n.id === id) ?? null
      }
      target = target.parentElement
    }
    return null
  }

  function screenToGraph(screenX: number, screenY: number): { x: number, y: number } {
    const el = options.containerRef.value
    if (!el)
      return { x: screenX, y: screenY }

    const rect = el.getBoundingClientRect()
    const svgX = screenX - rect.left
    const svgY = screenY - rect.top
    const t = toValue(options.transform)
    return {
      x: (svgX - t.x) / t.k,
      y: (svgY - t.y) / t.k,
    }
  }

  function getEventCoords(event: MouseEvent | TouchEvent): { clientX: number, clientY: number } {
    if ('touches' in event) {
      const touch = event.touches[0] ?? event.changedTouches[0]
      return touch ? { clientX: touch.clientX, clientY: touch.clientY } : { clientX: 0, clientY: 0 }
    }
    return { clientX: event.clientX, clientY: event.clientY }
  }

  function onPointerDown(event: MouseEvent | TouchEvent) {
    if (toValue(options.draggable) === false)
      return

    if ('touches' in event && event.touches.length > 1)
      return

    const node = findNodeFromEvent(event)
    if (!node)
      return

    event.stopPropagation()

    const { clientX, clientY } = getEventCoords(event)
    const graphPos = screenToGraph(clientX, clientY)
    dragOffset = { x: graphPos.x - node.x, y: graphPos.y - node.y }
    draggedNode = node
    node.fx = node.x
    node.fy = node.y

    options.onDragStart?.(node, event)
  }

  function onPointerMove(event: MouseEvent | TouchEvent) {
    if (!draggedNode)
      return

    const { clientX, clientY } = getEventCoords(event)
    const graphPos = screenToGraph(clientX, clientY)
    draggedNode.fx = graphPos.x - dragOffset.x
    draggedNode.fy = graphPos.y - dragOffset.y
    options.restart(0.3)
  }

  function onPointerUp(event: MouseEvent | TouchEvent) {
    if (!draggedNode)
      return

    if (!draggedNode.pinned) {
      draggedNode.fx = null
      draggedNode.fy = null
    }

    options.onDragEnd?.(draggedNode, event)
    draggedNode = null
  }

  function attach(el: SVGSVGElement) {
    el.addEventListener('mousedown', onPointerDown)
    el.addEventListener('touchstart', onPointerDown, { passive: false })
    window.addEventListener('mousemove', onPointerMove)
    window.addEventListener('touchmove', onPointerMove, { passive: false })
    window.addEventListener('mouseup', onPointerUp)
    window.addEventListener('touchend', onPointerUp)
  }

  function detach(el: SVGSVGElement) {
    el.removeEventListener('mousedown', onPointerDown)
    el.removeEventListener('touchstart', onPointerDown)
    window.removeEventListener('mousemove', onPointerMove)
    window.removeEventListener('touchmove', onPointerMove)
    window.removeEventListener('mouseup', onPointerUp)
    window.removeEventListener('touchend', onPointerUp)
  }

  let currentEl: SVGSVGElement | null = null

  watch(() => options.containerRef.value, (el, oldEl) => {
    if (oldEl)
      detach(oldEl)
    if (el) {
      attach(el)
      currentEl = el
    }
  })

  onUnmounted(() => {
    if (currentEl)
      detach(currentEl)
  })
}
