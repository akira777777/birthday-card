const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

const buildAssetPath = (fileName: string) => {
  const rawPath = `${BASE_PATH}/birthday-card/${fileName}`
  return encodeURI(rawPath)
}

export const imageAssets = {
  mainBackground: buildAssetPath("main-background.jpg"),
  card: buildAssetPath("Слоwdй 2.png"),
  cardCompanion: buildAssetPath("card-companion.png"),
  gnomes: [
    buildAssetPath("Слой 2.png"),
    buildAssetPath("Слой 3.png"),
    buildAssetPath("Слой 4.png"),
  ],
  bouquets: [
    buildAssetPath("bouquet-1.png"),
    buildAssetPath("bouquet-2.png"),
  ],
  // Background scenes - currently empty as images are not available
  // Add paths here when bg-scene-*.png files are added to public/birthday-card/
  backgroundScenes: [] as string[],
  frameOverlay: buildAssetPath("frame-overlay.png"),
}
