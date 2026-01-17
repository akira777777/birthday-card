export interface GnomePosition {
  id: number
  x: number
  y: number
  floatDelay: number
  floatDuration: number
  tilt: number
}

export interface ViewportSize {
  width: number
  height: number
}

const GNOME_WIDTH_DESKTOP = 160
// Increased mobile size for better touch targets (was 120)
const GNOME_WIDTH_MOBILE = 140
const GNOME_ASPECT_RATIO = 1.35
const POSITION_ATTEMPTS = 18

const UI_PADDING = {
  mobile: {
    // Adjusted padding to account for larger gnomes and safe areas
    top: 100,
    bottom: 100,
    side: 40,
  },
  desktop: {
    top: 160,
    bottom: 160,
    side: 90,
  },
}

const getRandomInRange = (min: number, max: number) => min + Math.random() * (max - min)

export const getGnomeDimensions = (isMobile: boolean) => {
  const width = isMobile ? GNOME_WIDTH_MOBILE : GNOME_WIDTH_DESKTOP
  return {
    width,
    height: Math.round(width * GNOME_ASPECT_RATIO),
  }
}

const getAvailableBounds = (
  viewport: ViewportSize,
  gnomeWidth: number,
  gnomeHeight: number,
  isMobile: boolean
) => {
  const padding = isMobile ? UI_PADDING.mobile : UI_PADDING.desktop
  const minX = padding.side
  const maxX = Math.max(minX, viewport.width - padding.side - gnomeWidth)
  const minY = padding.top
  const maxY = Math.max(minY, viewport.height - padding.bottom - gnomeHeight)

  return { minX, maxX, minY, maxY }
}

const isTooClose = (candidate: { x: number; y: number }, others: GnomePosition[], minDistance: number) => {
  return others.some((gnome) => {
    const dx = gnome.x - candidate.x
    const dy = gnome.y - candidate.y
    return Math.hypot(dx, dy) < minDistance
  })
}

const buildGnomePosition = (
  id: number,
  viewport: ViewportSize,
  gnomeWidth: number,
  gnomeHeight: number,
  existing: GnomePosition[],
  isMobile: boolean
) => {
  const { minX, maxX, minY, maxY } = getAvailableBounds(viewport, gnomeWidth, gnomeHeight, isMobile)
  const minDistance = gnomeWidth * 0.8

  let candidate = {
    x: getRandomInRange(minX, maxX),
    y: getRandomInRange(minY, maxY),
  }

  for (let attempt = 0; attempt < POSITION_ATTEMPTS; attempt += 1) {
    if (!isTooClose(candidate, existing, minDistance)) {
      break
    }
    candidate = {
      x: getRandomInRange(minX, maxX),
      y: getRandomInRange(minY, maxY),
    }
  }

  return {
    id,
    x: candidate.x,
    y: candidate.y,
    floatDelay: getRandomInRange(0, 1.2),
    floatDuration: getRandomInRange(4.6, 6.8),
    tilt: getRandomInRange(-6, 6),
  }
}

export const createGnomePositions = (count: number, viewport: ViewportSize, isMobile: boolean) => {
  const { width, height } = getGnomeDimensions(isMobile)
  const positions: GnomePosition[] = []

  for (let index = 0; index < count; index += 1) {
    positions.push(buildGnomePosition(index, viewport, width, height, positions, isMobile))
  }

  return positions
}

export const moveGnome = (
  gnomes: GnomePosition[],
  gnomeId: number,
  viewport: ViewportSize,
  isMobile: boolean
) => {
  const { width, height } = getGnomeDimensions(isMobile)
  return gnomes.map((gnome) => {
    if (gnome.id !== gnomeId) return gnome
    return buildGnomePosition(gnomeId, viewport, width, height, gnomes, isMobile)
  })
}
