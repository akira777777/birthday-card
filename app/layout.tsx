import type { Metadata, Viewport } from "next"
import { imageAssets } from "./assets/images"
import "./styles/globals.css"

export const metadata: Metadata = {
  title: "День Рождения - Интерактивная Открытка",
  description: "Интерактивная открытка с днем рождения",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#0f0c29" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="preload" as="image" href={imageAssets.card} />
        {imageAssets.gnomes.map((src) => (
          <link key={src} rel="preload" as="image" href={src} />
        ))}
      </head>
      <body>{children}</body>
    </html>
  )
}
