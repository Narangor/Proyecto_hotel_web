import { test, expect } from "@playwright/test";

test.describe("Staff login and admin modules", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    await context.addInitScript(() => {
      localStorage.removeItem("hotel_staff_auth");
    });
  });

  test("login with any credentials redirects to clientes", async ({ page }) => {
    await page.goto("/es/login");
    await page.locator("#login-email").fill("e2e@test.com");
    await page.locator("#login-password").fill("password123");
    await page.getByRole("button", { name: /ingresar/i }).click();
    await expect(page).toHaveURL(/\/es\/clientes/);
    await expect(
      page.getByRole("heading", { name: /gestión de clientes/i }),
    ).toBeVisible();
  });

  test("admin nav reaches paquetes and tours modules", async ({ page }) => {
    await page.goto("/es/login");
    await page.locator("#login-email").fill("staff@hotel.com");
    await page.locator("#login-password").fill("secret");
    await page.getByRole("button", { name: /ingresar/i }).click();
    await page.waitForURL(/\/es\/clientes/);

    await page
      .getByRole("navigation", { name: "Navegación de administración" })
      .getByRole("link", { name: "Paquetes" })
      .click();
    await expect(page).toHaveURL(/\/es\/paquetes/);
    await expect(
      page.getByRole("heading", { name: /paquetes promocionales/i }),
    ).toBeVisible();

    await page
      .getByRole("navigation", { name: "Navegación de administración" })
      .getByRole("link", { name: "Tours" })
      .click();
    await expect(page).toHaveURL(/\/es\/tours/);
    await expect(
      page.getByRole("heading", { name: /agendamiento de tours/i }),
    ).toBeVisible();
  });

  test("logout returns to login", async ({ page }) => {
    await page.goto("/es/login");
    await page.locator("#login-email").fill("a@b.co");
    await page.locator("#login-password").fill("x");
    await page.getByRole("button", { name: /ingresar/i }).click();
    await page.waitForURL(/\/es\/clientes/);

    await page.getByRole("button", { name: /cerrar sesión/i }).click();
    await expect(page).toHaveURL(/\/es\/login/);
  });
});
