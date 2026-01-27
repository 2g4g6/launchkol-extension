// Color conversion utilities for the advanced color picker

export interface HSV {
  h: number  // 0-360
  s: number  // 0-100
  v: number  // 0-100
}

export interface RGB {
  r: number  // 0-255
  g: number  // 0-255
  b: number  // 0-255
}

/**
 * Convert hex string to RGB object
 * Accepts formats: #RGB, #RRGGBB, RGB, RRGGBB
 */
export function hexToRgb(hex: string): RGB | null {
  // Remove # if present
  const cleanHex = hex.replace(/^#/, '')

  // Handle 3-character shorthand
  let fullHex = cleanHex
  if (cleanHex.length === 3) {
    fullHex = cleanHex
      .split('')
      .map((c) => c + c)
      .join('')
  }

  // Validate 6-character hex
  if (!/^[0-9A-Fa-f]{6}$/.test(fullHex)) {
    return null
  }

  const num = parseInt(fullHex, 16)
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

/**
 * Convert RGB object to hex string (with #)
 */
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)))
    return clamped.toString(16).padStart(2, '0')
  }
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`
}

/**
 * Convert HSV to RGB
 * h: 0-360, s: 0-100, v: 0-100
 */
export function hsvToRgb(hsv: HSV): RGB {
  const h = hsv.h / 360
  const s = hsv.s / 100
  const v = hsv.v / 100

  let r: number, g: number, b: number

  if (s === 0) {
    r = g = b = v
  } else {
    const i = Math.floor(h * 6)
    const f = h * 6 - i
    const p = v * (1 - s)
    const q = v * (1 - f * s)
    const t = v * (1 - (1 - f) * s)

    switch (i % 6) {
      case 0:
        r = v; g = t; b = p
        break
      case 1:
        r = q; g = v; b = p
        break
      case 2:
        r = p; g = v; b = t
        break
      case 3:
        r = p; g = q; b = v
        break
      case 4:
        r = t; g = p; b = v
        break
      case 5:
        r = v; g = p; b = q
        break
      default:
        r = g = b = 0
    }
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  }
}

/**
 * Convert RGB to HSV
 */
export function rgbToHsv(rgb: RGB): HSV {
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  let h = 0
  let s = 0
  const v = max * 100

  if (delta !== 0) {
    s = (delta / max) * 100

    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) * 60
        break
      case g:
        h = ((b - r) / delta + 2) * 60
        break
      case b:
        h = ((r - g) / delta + 4) * 60
        break
    }
  }

  return { h, s, v }
}

/**
 * Convert hex string to HSV
 */
export function hexToHsv(hex: string): HSV | null {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  return rgbToHsv(rgb)
}

/**
 * Convert HSV to hex string
 */
export function hsvToHex(hsv: HSV): string {
  const rgb = hsvToRgb(hsv)
  return rgbToHex(rgb)
}

/**
 * Validate hex color string
 * Accepts: #RGB, #RRGGBB, RGB, RRGGBB
 */
export function isValidHex(value: string): boolean {
  const cleanHex = value.replace(/^#/, '')
  return /^[0-9A-Fa-f]{3}$/.test(cleanHex) || /^[0-9A-Fa-f]{6}$/.test(cleanHex)
}

/**
 * Normalize hex to 6-character uppercase format with #
 */
export function normalizeHex(hex: string): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  return rgbToHex(rgb).toUpperCase()
}
