import type { GraphLink, GraphNode } from '@/types.ts'

export function generateNodes(count: number): GraphNode[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `Node ${i}`,
  }))
}

export function generateLinks(nodeCount: number, linkCount: number): GraphLink[] {
  const links: GraphLink[] = []
  for (let i = 0; i < linkCount; i++) {
    links.push({
      source: Math.floor(Math.random() * nodeCount),
      target: Math.floor(Math.random() * nodeCount),
    })
  }
  return links
}

export const sampleNodes: GraphNode[] = [
  { id: 0, name: 'Alice' },
  { id: 1, name: 'Bob' },
  { id: 2, name: 'Carol' },
  { id: 3, name: 'Dave' },
  { id: 4, name: 'Eve' },
  { id: 5, name: 'Frank' },
  { id: 6, name: 'Grace' },
  { id: 7, name: 'Heidi' },
]

export const sampleLinks: GraphLink[] = [
  { source: 0, target: 1 },
  { source: 0, target: 2 },
  { source: 1, target: 3 },
  { source: 2, target: 3 },
  { source: 3, target: 4 },
  { source: 4, target: 5 },
  { source: 5, target: 6 },
  { source: 6, target: 7 },
  { source: 7, target: 0 },
  { source: 1, target: 5 },
  { source: 2, target: 6 },
]

export const styledNodes: GraphNode[] = [
  { id: 0, name: 'Primary', color: '#6366f1', size: 10 },
  { id: 1, name: 'Success', color: '#22c55e', size: 8 },
  { id: 2, name: 'Warning', color: '#f59e0b', size: 12 },
  { id: 3, name: 'Danger', color: '#ef4444', size: 6 },
  { id: 4, name: 'Info', color: '#06b6d4', size: 9 },
  { id: 5, name: 'Default', size: 7 },
]

export const styledLinks: GraphLink[] = [
  { source: 0, target: 1, color: '#22c55e', width: 2 },
  { source: 0, target: 2, color: '#f59e0b', width: 3 },
  { source: 1, target: 3, color: '#ef4444' },
  { source: 2, target: 4 },
  { source: 3, target: 5 },
  { source: 4, target: 5, color: '#06b6d4', width: 2 },
  { source: 0, target: 4 },
]
