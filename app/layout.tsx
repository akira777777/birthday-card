import type { Metadata } from "next"
import { imageAssets } from "./assets/images"
import "./styles/globals.css"

export const metadata: Metadata = {
  title: "День Рождения - Интерактивная Открытка",
  description: "Интерактивная открытка с днем рождения",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <head>
        <link rel="preload" as="image" href={imageAssets.card} />
        {imageAssets.gnomes.map((src) => (
          <link key={src} rel="preload" as="image" href={src} />
        ))}
      </head>
      <body>{children}</body>
    </html>
  )
}
