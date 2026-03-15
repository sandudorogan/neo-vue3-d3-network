import type { SimulatedLink, SimulatedNode } from '../types.ts'

export function straightLinkPath(link: SimulatedLink): string {
  return `M${link.source.x},${link.source.y}L${link.target.x},${link.target.y}`
}

export function curvedLinkPath(link: SimulatedLink): string {
  const { source, target } = link
  return `M${source.x},${source.y}Q${source.x},${target.y} ${target.x},${target.y}`
}

export function parseSvgIcon(svgString: string): { viewBox: string, content: string } {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgString, 'image/svg+xml')
  const svg = doc.querySelector('svg')
  if (!svg) {
    return { viewBox: '0 0 24 24', content: svgString }
  }
  const viewBox = svg.getAttribute('viewBox') ?? '0 0 24 24'
  return { viewBox, content: svg.innerHTML }
}

export function inlineSvgStyles(svgEl: SVGSVGElement, allCss: boolean): SVGSVGElement {
  const clone = svgEl.cloneNode(true) as SVGSVGElement
  const elements = clone.querySelectorAll('*')
  const sheets = [...document.styleSheets]

  if (allCss) {
    const styleEl = document.createElement('style')
    let cssText = ''
    for (const sheet of sheets) {
      try {
        for (const rule of sheet.cssRules) {
          cssText += rule.cssText
        }
      }
      catch {
        // cross-origin sheets
      }
    }
    styleEl.textContent = cssText
    clone.insertBefore(styleEl, clone.firstChild)
  }
  else {
    for (const el of elements) {
      const computed = window.getComputedStyle(el)
      const inlineStyle = (el as SVGElement).style
      for (let i = 0; i < computed.length; i++) {
        const prop = computed[i]!
        inlineStyle.setProperty(prop, computed.getPropertyValue(prop))
      }
    }
  }

  return clone
}

export function svgToBlob(svgEl: SVGSVGElement): Blob {
  const serializer = new XMLSerializer()
  const svgString = serializer.serializeToString(svgEl)
  return new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
}

export async function svgToPngBlob(svgEl: SVGSVGElement, background?: string): Promise<Blob> {
  const svgBlob = svgToBlob(svgEl)
  const url = URL.createObjectURL(svgBlob)

  const img = new Image()
  img.src = url

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = reject
  })

  const canvas = document.createElement('canvas')
  canvas.width = svgEl.viewBox.baseVal.width || svgEl.clientWidth || 800
  canvas.height = svgEl.viewBox.baseVal.height || svgEl.clientHeight || 600

  const ctx = canvas.getContext('2d')!
  if (background) {
    ctx.fillStyle = background
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  URL.revokeObjectURL(url)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob)
        resolve(blob)
      else
        reject(new Error('Failed to create PNG blob'))
    }, 'image/png')
  })
}

export function nodeClasses(
  node: SimulatedNode,
  selected: boolean,
  pinned: boolean,
): string[] {
  const classes = ['node']
  if (selected)
    classes.push('selected')
  if (pinned)
    classes.push('pinned')
  if (node.cssClass) {
    if (Array.isArray(node.cssClass))
      classes.push(...node.cssClass)
    else
      classes.push(node.cssClass)
  }
  return classes
}

export function linkClasses(
  link: SimulatedLink,
  selected: boolean,
): string[] {
  const classes = ['link']
  if (selected)
    classes.push('selected')
  if (link.cssClass) {
    if (Array.isArray(link.cssClass))
      classes.push(...link.cssClass)
    else
      classes.push(link.cssClass)
  }
  return classes
}
