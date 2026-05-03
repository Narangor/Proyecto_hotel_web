import { test, expect } from "@playwright/test";

test.describe("Public home (huésped)", () => {
  test("Spanish locale shows hero and main landmarks", async ({ page }) => {
    await page.goto("/es");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Una experiencia excepcional comienza aquí",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Navegación principal" }),
    ).toBeVisible();
    await expect(page.locator("#main-content")).toBeVisible();
  });

  test("English locale shows translated hero", async ({ page }) => {
    await page.goto("/en");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "An exceptional experience begins here",
      }),
    ).toBeVisible();
  });

  test("can open reservar flow from navigation", async ({ page }) => {
    await page.goto("/es");
    await page.getByRole("link", { name: "Reservar ahora" }).first().click();
    await expect(page).toHaveURL(/\/es\/reservar/);
    await expect(
      page.getByRole("heading", {
        name: "Habitaciones Disponibles",
      }),
    ).toBeVisible();
  });
});
