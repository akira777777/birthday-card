import type { Metadata } from "next"
import "./globals.css"

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
      <body>{children}</body>
    </html>
  )
}
