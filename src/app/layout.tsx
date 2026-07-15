import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { AppProviders } from "@/components/app/app-providers"

import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "JMD ClientFlow",
    template: "%s | JMD ClientFlow",
  },
  description:
    "CRM ligero para gestionar clientes, oportunidades, tareas y seguimientos.",
  applicationName: "JMD ClientFlow",
  authors: [{ name: "José Miguel Díaz" }],
  keywords: ["CRM", "freelancers", "clientes", "pipeline", "Next.js"],
  openGraph: {
    title: "JMD ClientFlow",
    description:
      "Un CRM claro y visual para freelancers y pequeños profesionales.",
    type: "website",
    locale: "es_ES",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#26352f",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
