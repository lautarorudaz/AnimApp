import { test, expect } from '@playwright/test';

// UI tests deliberately replace the AI transport; they never spend real quota.
test('assistant opens without requests, handles input and errors, and works on mobile', async ({ page }) => {
  await page.route(/\/src\/features\/ai\/service\.js(?:\?.*)?$/, (route) => route.fulfill({
    contentType: 'application/javascript',
    body: `import { friendlyAiError } from '/src/features/ai/assistant.js';
      export async function askGymAssistant(question, history) {
        window.__assistantRequests = [...(window.__assistantRequests || []), { question, history }];
        await new Promise(resolve => setTimeout(resolve, 150));
        if (question === 'Probar verificación') throw new Error(friendlyAiError({ code: '403' }, true));
        return 'Moreno abre los sábados de 09:00 a 18:00 hs. Podés consultar a recepción por WhatsApp.';
      }`
  }));
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir asistente virtual', exact: true }).click();
  const panel = page.getByRole('dialog', { name: 'Asistente virtual de AnimApp' });
  const input = panel.getByRole('textbox', { name: 'Tu consulta' });
  await expect(input).toBeFocused();
  expect(await page.evaluate(() => window.__assistantRequests?.length || 0)).toBe(0);
  await expect(panel.getByRole('button', { name: 'Enviar consulta' })).toBeDisabled();
  await input.fill('¿Cuándo abre Moreno los sábados?');
  await input.press('Enter');
  await expect(panel.getByText('Preparando respuesta…')).toBeVisible();
  await expect(panel.getByRole('button', { name: 'Enviar consulta' })).toBeDisabled();
  await expect(panel.getByText('Moreno abre los sábados de 09:00 a 18:00 hs.', { exact: false })).toBeVisible();
  expect(await page.evaluate(() => window.__assistantRequests.length)).toBe(1);
  await expect(panel.getByRole('link', { name: 'Moreno ↗', exact: true })).toHaveAttribute('href', 'https://wa.link/nlykq7');
  await page.screenshot({ path: 'test-results/assistant-desktop.png' });
  await panel.getByRole('button', { name: 'Nueva conversación' }).click();
  await expect(panel.locator('.gym-assistant-message')).toHaveCount(1);
  await input.fill('Probar verificación');
  await panel.getByRole('button', { name: 'Enviar consulta' }).click();
  await expect(panel.getByRole('alert')).toContainText('token de depuración');
  await expect(input).toHaveValue('Probar verificación');
  await expect(panel.locator('.gym-assistant-message')).toHaveCount(1);
  await page.setViewportSize({ width: 390, height: 844 });
  await panel.getByRole('button', { name: 'Nueva conversación' }).click();
  await expect(input).toHaveAttribute('maxlength', '600');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const bounds = await panel.boundingBox();
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
  expect(bounds.y).toBeGreaterThanOrEqual(0);
  await page.screenshot({ path: 'test-results/assistant-mobile.png' });
  await input.press('Escape');
  await expect(panel).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Abrir asistente virtual', exact: true })).toBeFocused();
});
