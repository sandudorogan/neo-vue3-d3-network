import type { Ref } from 'vue'
import type { ScreenshotOptions } from '../types.ts'
import { inlineSvgStyles, svgToBlob, svgToPngBlob } from '../utils/svg.ts'

interface UseScreenshotOptions {
  containerRef: Ref<SVGSVGElement | null>
}

export function useScreenshot(options: UseScreenshotOptions) {
  async function screenshot(screenshotOptions: ScreenshotOptions = {}): Promise<Blob> {
    const el = options.containerRef.value
    if (!el) {
      throw new Error('No SVG container available for screenshot')
    }

    const format = screenshotOptions.format ?? 'png'
    const allCss = screenshotOptions.inlineAllCss ?? false
    const clone = inlineSvgStyles(el, allCss)

    if (format === 'svg') {
      return svgToBlob(clone)
    }

    return svgToPngBlob(clone, screenshotOptions.background)
  }

  return { screenshot }
}
