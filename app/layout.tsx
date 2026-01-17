import type { Metadata, Viewport } from "next"
import "./globals.css"

// Get base path for assets
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

export const metadata: Metadata = {
  title: "С Днём Рождения, Татьяна! 🎂",
  description: "Интерактивная поздравительная открытка с днём рождения",
  keywords: ["день рождения", "поздравление", "открытка", "Татьяна"],
  authors: [{ name: "Birthday Card App" }],
  openGraph: {
    title: "С Днём Рождения, Татьяна!",
    description: "Интерактивная поздравительная открытка",
    type: "website",
    images: [`${basePath}/birthday-card/Слоwdй 2.png`],
  },
  twitter: {
    card: "summary_large_image",
    title: "С Днём Рождения, Татьяна!",
    description: "Интерактивная поздравительная открытка",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#6366f1" },
    { media: "(prefers-color-scheme: dark)", color: "#312e81" },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className="overflow-hidden">
      <head>
        {/* Preload critical PNG assets for faster loading */}
        <link
          rel="preload"
          href={`${basePath}/birthday-card/Слой 2.png`}
          as="image"
          type="image/png"
        />
        <link
          rel="preload"
          href={`${basePath}/birthday-card/Слой 3.png`}
          as="image"
          type="image/png"
        />
        <link
          rel="preload"
          href={`${basePath}/birthday-card/Слой 4.png`}
          as="image"
          type="image/png"
        />
        <link
          rel="preload"
          href={`${basePath}/birthday-card/Слоwdй 2.png`}
          as="image"
          type="image/png"
        />
        {/* Prevent flash of white on dark background */}
        <style dangerouslySetInnerHTML={{
          __html: `
            html, body {
              background: linear-gradient(135deg, #581c87, #312e81, #1e3a8a, #581c87);
              overflow: hidden;
            }
          `
        }} />
      </head>
      <body className="overflow-hidden">
        {children}
      </body>
    </html>
  )
}
