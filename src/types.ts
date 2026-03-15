import type { Force, Simulation, SimulationNodeDatum } from 'd3-force'
import type { MaybeRef } from 'vue'

export interface GraphNode {
  id: string | number
  name?: string
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
  pinned?: boolean
  color?: string
  cssClass?: string | string[]
  labelClass?: string
  size?: number
  svgIcon?: string
  iconWidth?: number
  iconHeight?: number
  svgAttrs?: Record<string, string>
}

export interface GraphLink {
  id?: string | number
  source: string | number
  target: string | number
  name?: string
  color?: string
  width?: number
  cssClass?: string | string[]
  svgAttrs?: Record<string, string>
}

export interface SimulatedNode extends SimulationNodeDatum {
  id: string | number
  name: string
  x: number
  y: number
  vx: number
  vy: number
  index: number
  fx?: number | null
  fy?: number | null
  pinned?: boolean
  color?: string
  cssClass?: string | string[]
  labelClass?: string
  size?: number
  svgIcon?: string
  iconWidth?: number
  iconHeight?: number
  svgAttrs?: Record<string, string>
}

export interface InputLink {
  id: string | number
  source: string | number
  target: string | number
  name?: string
  color?: string
  width?: number
  cssClass?: string | string[]
  svgAttrs?: Record<string, string>
  index: number
}

export interface SimulatedLink {
  id: string | number
  source: SimulatedNode
  target: SimulatedNode
  name?: string
  color?: string
  width?: number
  cssClass?: string | string[]
  svgAttrs?: Record<string, string>
  index: number
}

export interface ForcesConfig {
  center?: boolean
  x?: number | boolean
  y?: number | boolean
  manyBody?: boolean
  link?: boolean
  collide?: number | boolean
}

export interface ScreenshotOptions {
  filename?: string
  background?: string
  format?: 'png' | 'svg'
  inlineAllCss?: boolean
}

export interface ZoomTransform {
  x: number
  y: number
  k: number
}

export interface ForceGraphOptions {
  nodes: MaybeRef<GraphNode[]>
  links: MaybeRef<GraphLink[]>
  nodeSize?: MaybeRef<number>
  linkWidth?: MaybeRef<number>
  force?: MaybeRef<number>
  forces?: MaybeRef<ForcesConfig | undefined>
  customForces?: MaybeRef<Record<string, Force<SimulatedNode, SimulatedLink>> | undefined>
  nodeLabels?: MaybeRef<boolean>
  linkLabels?: MaybeRef<boolean>
  fontSize?: MaybeRef<number>
  curvedLinks?: MaybeRef<boolean>
  draggable?: MaybeRef<boolean>
  zoomable?: MaybeRef<boolean>
  selectable?: MaybeRef<boolean>
  nodeFormatter?: (node: GraphNode) => GraphNode
  linkFormatter?: (link: GraphLink) => GraphLink
  simulationFormatter?: (sim: Simulation<SimulatedNode, SimulatedLink>) => Simulation<SimulatedNode, SimulatedLink>
}
