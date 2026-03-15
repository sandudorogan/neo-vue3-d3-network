import type { Selection } from 'd3-selection'
import type { D3ZoomEvent, ZoomBehavior } from 'd3-zoom'
import type { MaybeRef, Ref } from 'vue'
import type { ZoomTransform } from '../types.ts'
import { select } from 'd3-selection'
import { zoom, zoomIdentity, zoomTransform } from 'd3-zoom'
import { onUnmounted, ref, toValue, watch } from 'vue'

type SvgSelection = Selection<SVGSVGElement, undefined, null, undefined>

interface UseZoomOptions {
  containerRef: Ref<SVGSVGElement | null>
  zoomable?: MaybeRef<boolean>
}

function selectSvg(el: SVGSVGElement): SvgSelection {
  return select<SVGSVGElement, undefined>(el)
}

export function useZoom(options: UseZoomOptions) {
  const transform = ref<ZoomTransform>({ x: 0, y: 0, k: 1 })
  let zoomBehavior: ZoomBehavior<SVGSVGElement, undefined> | null = null

  function handleZoom(event: D3ZoomEvent<SVGSVGElement, undefined>) {
    const t = event.transform
    transform.value = { x: t.x, y: t.y, k: t.k }
  }

  function setupZoom() {
    const el = options.containerRef.value
    if (!el)
      return

    zoomBehavior = zoom<SVGSVGElement, undefined>()
      .scaleExtent([0.1, 10])
      .on('zoom', handleZoom)

    if (toValue(options.zoomable) !== false) {
      selectSvg(el).call(zoomBehavior)
    }
  }

  function teardownZoom() {
    const el = options.containerRef.value
    if (el) {
      selectSvg(el).on('.zoom', null)
    }
    zoomBehavior = null
  }

  watch(() => options.containerRef.value, (el) => {
    if (el) {
      setupZoom()
    }
    else {
      teardownZoom()
    }
  })

  watch(() => toValue(options.zoomable), (enabled) => {
    const el = options.containerRef.value
    if (!el || !zoomBehavior)
      return

    if (enabled !== false) {
      selectSvg(el).call(zoomBehavior)
    }
    else {
      selectSvg(el).on('.zoom', null)
    }
  })

  function zoomTo(scale: number) {
    const el = options.containerRef.value
    if (!el || !zoomBehavior)
      return
    const current = zoomTransform(el)
    const newTransform = zoomIdentity
      .translate(current.x, current.y)
      .scale(scale)
    selectSvg(el).call(zoomBehavior.transform, newTransform)
  }

  function resetZoom() {
    const el = options.containerRef.value
    if (!el || !zoomBehavior)
      return
    selectSvg(el).call(zoomBehavior.transform, zoomIdentity)
  }

  function zoomToFitBounds(bounds: { minX: number, minY: number, maxX: number, maxY: number }, padding = 40) {
    const el = options.containerRef.value
    if (!el || !zoomBehavior)
      return

    const width = el.clientWidth || el.viewBox.baseVal.width
    const height = el.clientHeight || el.viewBox.baseVal.height
    if (!width || !height)
      return

    const bWidth = bounds.maxX - bounds.minX
    const bHeight = bounds.maxY - bounds.minY
    if (bWidth === 0 && bHeight === 0)
      return

    const scale = Math.min(
      (width - padding * 2) / (bWidth || 1),
      (height - padding * 2) / (bHeight || 1),
      10,
    )
    const tx = (width - bWidth * scale) / 2 - bounds.minX * scale
    const ty = (height - bHeight * scale) / 2 - bounds.minY * scale

    const newTransform = zoomIdentity.translate(tx, ty).scale(scale)
    selectSvg(el).call(zoomBehavior.transform, newTransform)
  }

  onUnmounted(teardownZoom)

  return {
    transform,
    zoomTo,
    resetZoom,
    zoomToFitBounds,
    getZoomBehavior: () => zoomBehavior,
  }
}
