import type { Metadata, Viewport } from "next"

export const metadata: Metadata = {
  title: "С Днем Рождения, Татьяна!",
  description: "Интерактивная открытка с анимациями и сюрпризами.",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function BirthdayCardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
