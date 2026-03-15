import type { Force, Simulation } from 'd3-force'
import type { MaybeRef, ShallowRef } from 'vue'
import type { ForcesConfig, InputLink, SimulatedLink, SimulatedNode } from '../types.ts'
import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY } from 'd3-force'
import { onUnmounted, shallowRef, toValue, triggerRef, watch } from 'vue'

interface UseForceSimulationOptions {
  nodes: MaybeRef<SimulatedNode[]>
  links: MaybeRef<InputLink[]>
  force?: MaybeRef<number>
  forces?: MaybeRef<ForcesConfig | undefined>
  customForces?: MaybeRef<Record<string, Force<SimulatedNode, SimulatedLink>> | undefined>
  simulationFormatter?: (sim: Simulation<SimulatedNode, SimulatedLink>) => Simulation<SimulatedNode, SimulatedLink>
  size: ShallowRef<{ width: number, height: number }>
}

const DEFAULT_FORCES: ForcesConfig = {
  center: false,
  x: 0.5,
  y: 0.5,
  manyBody: true,
  link: true,
  collide: false,
}

export function useForceSimulation(options: UseForceSimulationOptions) {
  const nodesRef = shallowRef<SimulatedNode[]>([])
  const linksRef = shallowRef<SimulatedLink[]>([])
  let simulation: Simulation<SimulatedNode, SimulatedLink> | null = null
  let animationFrameId = 0

  function tick() {
    if (!simulation)
      return
    simulation.tick()
    triggerRef(nodesRef)
    triggerRef(linksRef)
    if (simulation.alpha() > simulation.alphaMin()) {
      animationFrameId = requestAnimationFrame(tick)
    }
    else {
      animationFrameId = 0
    }
  }

  function buildSimulation() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = 0
    }

    const nodes = [...toValue(options.nodes)]
    const links = [...toValue(options.links)]
    const forcesConfig = { ...DEFAULT_FORCES, ...toValue(options.forces) }
    const strength = toValue(options.force) ?? 500
    const { width, height } = options.size.value
    const cx = width / 2
    const cy = height / 2

    // d3-force expects SimulationLinkDatum which accepts source as string|number|Node
    // After simulation ticks, d3 resolves source/target to actual node objects
    const sim = forceSimulation<SimulatedNode>(nodes)
      .stop()
      .alpha(0.5)

    if (forcesConfig.center) {
      sim.force('center', forceCenter<SimulatedNode>(cx, cy))
    }
    else {
      sim.force('center', null)
    }

    if (forcesConfig.x !== false) {
      const xStrength = typeof forcesConfig.x === 'number' ? forcesConfig.x : 0.5
      sim.force('x', forceX<SimulatedNode>(cx).strength(xStrength))
    }
    else {
      sim.force('x', null)
    }

    if (forcesConfig.y !== false) {
      const yStrength = typeof forcesConfig.y === 'number' ? forcesConfig.y : 0.5
      sim.force('y', forceY<SimulatedNode>(cy).strength(yStrength))
    }
    else {
      sim.force('y', null)
    }

    if (forcesConfig.manyBody !== false) {
      sim.force('charge', forceManyBody<SimulatedNode>().strength(-strength))
    }
    else {
      sim.force('charge', null)
    }

    if (forcesConfig.link !== false) {
      sim.force('link', forceLink<SimulatedNode, InputLink>(links).id(d => d.id))
    }
    else {
      sim.force('link', null)
    }

    if (forcesConfig.collide) {
      const radius = typeof forcesConfig.collide === 'number' ? forcesConfig.collide : 5
      sim.force('collide', forceCollide<SimulatedNode>(radius))
    }
    else {
      sim.force('collide', null)
    }

    const custom = toValue(options.customForces)
    if (custom) {
      for (const [name, force] of Object.entries(custom)) {
        sim.force(name, force as Force<SimulatedNode, never>)
      }
    }

    // Cast to the expected type for the formatter
    simulation = sim as unknown as Simulation<SimulatedNode, SimulatedLink>

    if (options.simulationFormatter) {
      simulation = options.simulationFormatter(simulation)
    }

    nodesRef.value = nodes
    // After d3 processes the links, source/target become node references
    linksRef.value = links as unknown as SimulatedLink[]

    animationFrameId = requestAnimationFrame(tick)
  }

  function restart(alpha = 0.5) {
    if (simulation) {
      simulation.alpha(alpha)
      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(tick)
      }
    }
  }

  watch(
    [() => toValue(options.nodes), () => toValue(options.links), () => toValue(options.forces), () => toValue(options.force), () => toValue(options.customForces), options.size],
    buildSimulation,
    { immediate: true },
  )

  onUnmounted(() => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
    if (simulation) {
      simulation.stop()
    }
  })

  return {
    nodes: nodesRef,
    links: linksRef,
    restart,
    getSimulation: () => simulation,
  }
}
