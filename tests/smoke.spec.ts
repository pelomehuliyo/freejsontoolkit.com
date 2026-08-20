import { test, expect } from '@playwright/test';

const EDITOR_TOOLS = [
  '/tools/json-formatter/',
  '/tools/json-minifier/',
  '/tools/json-validator/',
  '/tools/json-to-csv/',
  '/tools/hmac/',
  '/tools/base64/',
  '/tools/csv-to-json/',
  '/tools/jwt-decoder/',
  '/tools/regex-tester/',
  '/tools/timestamp-converter/',
];

const TOOL_PAGES = [...EDITOR_TOOLS, '/tools/uuid/'];

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Format, validate, convert');
  await expect(page.locator('header.header')).toBeVisible();
});

for (const route of TOOL_PAGES) {
  test(`tool page loads: ${route}`, async ({ page }) => {
    await page.goto(route);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('.faq-section')).toBeVisible();
  });
}

test('editor tools render an input textarea', async ({ page }) => {
  for (const route of EDITOR_TOOLS) {
    await page.goto(route);
    await expect(page.locator('textarea').first()).toBeVisible();
  }
});

test('UUID generator renders config and generate controls', async ({ page }) => {
  await page.goto('/tools/uuid/');
  await expect(page.locator('#uu-count')).toBeVisible();
  await expect(page.locator('#uu-generate')).toBeVisible();
});

test('JSON Formatter formats valid JSON', async ({ page }) => {
  const input = { a: 1, b: [2, 3], c: { d: 'e' } };
  const raw = JSON.stringify(input);

  await page.goto('/tools/json-formatter/');

  const inputTextarea = page.locator('#json-input-textarea');
  await inputTextarea.fill(raw);

  await expect(page.locator('#json-validation-status')).toHaveText('Status: Ready');

  await page.locator('#format-btn').click();

  await expect(page.locator('#format-output-status')).toHaveText('Output: JSON');

  const output = await page.locator('#formatted-output-textarea').inputValue();
  expect(JSON.parse(output)).toEqual(input);
});