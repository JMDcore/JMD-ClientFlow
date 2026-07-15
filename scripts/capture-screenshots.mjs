import { mkdir } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const outputDir = path.join(root, "public", "screenshots")
const baseUrl = process.env.CLIENTFLOW_URL ?? "http://localhost:3000"

const views = [
  ["/", "dashboard.png"],
  ["/clients", "clients.png"],
  ["/opportunities", "opportunities.png"],
  ["/pipeline", "pipeline.png"],
  ["/tasks", "tasks.png"],
]

const response = await fetch(baseUrl).catch(() => null)

if (!response?.ok) {
  throw new Error(
    `ClientFlow no está disponible en ${baseUrl}. Inicia la aplicación con npm run dev.`,
  )
}

await mkdir(outputDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
})

try {
  for (const [route, filename] of views) {
    await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" })
    await page.waitForTimeout(700)
    await page.screenshot({
      path: path.join(outputDir, filename),
      fullPage: false,
    })
    console.log(`Captured ${filename}`)
  }
} finally {
  await browser.close()
}
