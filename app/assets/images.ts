const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

const buildAssetPath = (fileName: string) => {
  const rawPath = `${BASE_PATH}/birthday-card/${fileName}`
  return encodeURI(rawPath)
}

export const imageAssets = {
  card: buildAssetPath("Слоwdй 2.png"),
  gnomes: [
    buildAssetPath("Слой 2.png"),
    buildAssetPath("Слой 3.png"),
    buildAssetPath("Слой 4.png"),
  ],
}
