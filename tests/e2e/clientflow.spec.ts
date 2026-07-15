import { expect, test } from "@playwright/test"

test("shows the action-focused dashboard", async ({ page }) => {
  await page.goto("/")

  await expect(
    page.getByRole("heading", { name: "Buenos días, José" }),
  ).toBeVisible()
  await expect(
    page.getByText("Oportunidades abiertas", { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Tareas prioritarias" }),
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Seguimientos" }),
  ).toBeVisible()
})

test("creates a client and opens its detail", async ({ page }) => {
  await page.goto("/clients")
  await page.getByRole("button", { name: "Nuevo cliente" }).click()

  await page.getByLabel("Nombre").fill("Nuria Acosta")
  await page.getByLabel("Empresa").fill("Estudio Nube")
  await page.getByLabel("Email").fill("nuria@estudionube.test")
  await page.getByLabel("Teléfono").fill("+34 600 111 222")
  await page.getByLabel("Sector").fill("Diseño")
  await page.getByRole("button", { name: "Crear cliente" }).click()

  await expect(
    page.getByText("10 contactos centralizados", { exact: false }),
  ).toBeVisible()
  await page
    .getByRole("button", {
      name: /Nuria Acosta Estudio Nube/,
    })
    .click()
  await expect(
    page.getByRole("heading", { name: "Nuria Acosta" }),
  ).toBeVisible()
  await expect(
    page.getByText("Pipeline abierto", { exact: true }),
  ).toBeVisible()
})

test("renders the five open pipeline stages", async ({ page }) => {
  await page.goto("/pipeline")

  for (const stage of [
    "Nuevo lead",
    "Contactado",
    "Reunión agendada",
    "Propuesta enviada",
    "Negociación",
  ]) {
    await expect(page.getByRole("heading", { name: stage })).toBeVisible()
  }
  await expect(
    page.getByText("Portfolio con reserva de sesiones", { exact: true }),
  ).toBeVisible()
})

test("keeps the mobile shell inside the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/clients")

  const bodyOverflow = await page
    .locator("body")
    .evaluate((element) => getComputedStyle(element).overflowX)
  expect(bodyOverflow).toBe("hidden")
  await expect(
    page.getByRole("navigation").getByRole("link", { name: "Clientes" }),
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Nuevo cliente" }),
  ).toBeVisible()
})
