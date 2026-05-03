import { test, expect } from "@playwright/test";

test.describe("IA assistant (mock chat)", () => {
  test("opens chat panel, shows skeleton while loading, then assistant reply", async ({
    page,
  }) => {
    await page.goto("/es");
    await page
      .getByRole("button", { name: "Abrir chat de atención al cliente" })
      .click();

    const dialog = page.getByRole("dialog", {
      name: "Chat de asistencia del Hotel Santa María",
    });
    await expect(dialog).toBeVisible();

    await dialog.getByRole("textbox", { name: "Escribe tu pregunta..." }).fill(
      "¿Horario de check-in?",
    );
    await dialog.getByRole("button", { name: "Enviar mensaje" }).click();

    await expect(dialog.locator(".animate-pulse").first()).toBeVisible({
      timeout: 3_000,
    });

    await expect(dialog.getByText(/3:00 PM/)).toBeVisible({ timeout: 20_000 });
  });
});
