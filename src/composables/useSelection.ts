import type { SimulatedLink, SimulatedNode } from '../types.ts'
import { shallowRef, triggerRef } from 'vue'

export function useSelection() {
  const selectedNodes = shallowRef(new Map<string | number, SimulatedNode>())
  const selectedLinks = shallowRef(new Map<string | number, SimulatedLink>())

  function selectNode(id: string | number, node: SimulatedNode) {
    selectedNodes.value.set(id, node)
    triggerRef(selectedNodes)
  }

  function deselectNode(id: string | number) {
    selectedNodes.value.delete(id)
    triggerRef(selectedNodes)
  }

  function toggleNodeSelection(id: string | number, node: SimulatedNode) {
    if (selectedNodes.value.has(id)) {
      deselectNode(id)
    }
    else {
      selectNode(id, node)
    }
  }

  function selectLink(id: string | number, link: SimulatedLink) {
    selectedLinks.value.set(id, link)
    triggerRef(selectedLinks)
  }

  function deselectLink(id: string | number) {
    selectedLinks.value.delete(id)
    triggerRef(selectedLinks)
  }

  function toggleLinkSelection(id: string | number, link: SimulatedLink) {
    if (selectedLinks.value.has(id)) {
      deselectLink(id)
    }
    else {
      selectLink(id, link)
    }
  }

  function clearSelection() {
    selectedNodes.value.clear()
    selectedLinks.value.clear()
    triggerRef(selectedNodes)
    triggerRef(selectedLinks)
  }

  return {
    selectedNodes,
    selectedLinks,
    selectNode,
    deselectNode,
    toggleNodeSelection,
    selectLink,
    deselectLink,
    toggleLinkSelection,
    clearSelection,
  }
}
