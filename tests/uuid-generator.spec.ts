import { test, expect, type Page } from '@playwright/test';
import * as fs from 'node:fs';
import {
  openTool,
  trackPageErrors,
  pressRunShortcut,
  grantClipboard,
  isChromium,
  expectSectionsInOrder,
  clickAndCatchBusy,
  setCheckbox,
} from './helpers';

const ROUTE = '/tools/uuid/';
const BTN = '#uu-generate';
const ERROR = '#uu-error-message';
const LIST = '#uu-list';

const V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const V5_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const V7_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

async function setVersion(page: Page, version: string): Promise<void> {
  await page.locator(`[data-uu-version="${version}"]`).click();
}

async function setCount(page: Page, n: string): Promise<void> {
  await page.locator('#uu-count').fill(n);
  // Any store change re-syncs the clamped count field (the subscribe writes the
  // DOM value only when the input isn't focused). Re-clicking the active version
  // button triggers a store update without changing any option.
  await page.locator('[data-uu-version][aria-pressed="true"]').click();
}

async function generateAndWait(page: Page, rows: number, timeout = 20_000): Promise<void> {
  await clickAndCatchBusy(page, BTN, 'Generating…');
  await expect(page.locator(`${LIST} .uu-row`)).toHaveCount(rows, { timeout });
}

async function ids(page: Page): Promise<string[]> {
  return page.locator(`${LIST} .uu-id`).allTextContents();
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite 1 · Load
// ─────────────────────────────────────────────────────────────────────────────

test.describe('load', () => {
  test('1.1 page renders with header contract, controls, and idle state', async ({ page }) => {
    await openTool(page, ROUTE, '#uu-count');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator(BTN)).toHaveText('Generate');
    await expect(page.locator('#uu-idle')).toBeVisible();
    await expect(page.locator('#uu-copyall')).toBeDisabled();
    await expect(page.locator('#uu-download')).toBeDisabled();
    await expect(page.locator('#uu-cap')).toContainText('max');
    await expectSectionsInOrder(page);
  });

  test('1.2 no console errors on load', async ({ page }) => {
    const errs = trackPageErrors(page);
    await openTool(page, ROUTE, '#uu-count');
    await errs.assertNone();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 2 · Load Sample
// ─────────────────────────────────────────────────────────────────────────────

test.describe('load sample', () => {
  test('2.1 sample loads config, never auto-runs, and announces', async ({ page }) => {
    await openTool(page, ROUTE, '#uu-count');
    await page.locator('#uu-input-actions [data-action="sample"]').click();
    await expect(page.locator('#uu-count')).toHaveValue('5');
    await expect(page.locator('[data-uu-version="v4"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#uu-name')).toHaveValue('example.com');
    await expect(page.locator('#uu-idle')).toBeVisible();
    await expect(page.locator(`${LIST} .uu-row`)).toHaveCount(0);
    await expect(page.locator('#uu-copyall')).toBeDisabled();
    await expect(page.locator('#uu-announce')).toHaveText('Sample config loaded');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 3 · Primary action + version correctness
// ─────────────────────────────────────────────────────────────────────────────

test.describe('primary action', () => {
  test('3.1 v4 count 5 generates five well-formed random UUIDs', async ({ page }) => {
    await openTool(page, ROUTE, '#uu-count');
    await setCount(page, '5');
    await generateAndWait(page, 5);
    const list = await ids(page);
    for (const id of list) expect(id).toMatch(V4_RE);
  });

  test('3.2 two v4 batches differ', async ({ page }) => {
    await openTool(page, ROUTE, '#uu-count');
    await setCount(page, '1');
    await generateAndWait(page, 1);
    const first = (await ids(page))[0];
    await generateAndWait(page, 1);
    const second = (await ids(page))[0];
    expect(first).not.toBe(second);
  });

  test('3.3 v7 count 100 renders sorted (monotonic) and reports sortable', async ({ page }) => {
    await openTool(page, ROUTE, '#uu-count');
    await setVersion(page, 'v7');
    await setCount(page, '100');
    await generateAndWait(page, 100);
    const list = await ids(page);
    for (const id of list) expect(id).toMatch(V7_RE);
    const sorted = [...list].sort();
    expect(list).toEqual(sorted);
    await expect(page.locator('#uu-order-text')).toHaveText('monotonic · sortable');
  });

  test('3.4 v5 is deterministic for the same namespace + name', async ({ page }) => {
    await openTool(page, ROUTE, '#uu-count');
    await setVersion(page, 'v5');
    await setCount(page, '1');
    await page.locator('#uu-name').fill('example.com');
    await generateAndWait(page, 1);
    const a = (await ids(page))[0];
    expect(a).toMatch(V5_RE);
    await generateAndWait(page, 1);
    const b = (await ids(page))[0];
    expect(a).toBe(b);
    await expect(page.locator('#uu-order-text')).toHaveText('deterministic');
  });

  test('3.5 v5 differs when the name changes', async ({ page }) => {
    await openTool(page, ROUTE, '#uu-count');
    await setVersion(page, 'v5');
    await setCount(page, '1');
    await page.locator('#uu-name').fill('one.example');
    await generateAndWait(page, 1);
    const a = (await ids(page))[0];
    await page.locator('#uu-name').fill('two.example');
    await generateAndWait(page, 1);
    const b = (await ids(page))[0];
    expect(a).not.toBe(b);
  });

  test('3.6 format variants: braces, urn, compact', async ({ page }) => {
    await openTool(page, ROUTE, '#uu-count');
    await setCount(page, '1');

    await page.locator('[data-uu-format="braces"]').click();
    await generateAndWait(page, 1);
    expect((await ids(page))[0]).toMatch(/^\{[0-9a-f-]{36}\}$/);

    await page.locator('[data-uu-format="urn"]').click();
    await generateAndWait(page, 1);
    expect((await ids(page))[0]).toMatch(/^urn:uuid:[0-9a-f-]{36}$/);

    await page.locator('[data-uu-format="compact"]').click();
    await generateAndWait(page, 1);
    expect((await ids(page))[0]).toMatch(/^[0-9a-f]{32}$/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 4 · Count bounds (Breaker)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('count bounds', () => {
  test('4.1 zero and negative counts clamp to 1', async ({ page }) => {
    await openTool(page, ROUTE, '#uu-count');
    await setCount(page, '0');
    await expect(page.locator('#uu-count')).toHaveValue('1');
    await setCount(page, '-5');
    await expect(page.locator('#uu-count')).toHaveValue('1');
    await generateAndWait(page, 1);
  });

  test('4.2 count above the v4 cap clamps to 5000', async ({ page }) => {
    await openTool(page, ROUTE, '#uu-count');
    await setCount(page, '999999');
    await expect(page.locator('#uu-count')).toHaveValue('5000');
    await expect(page.locator('#uu-cap')).toContainText('5,000');
  });

  test('4.3 v5 count above its 256 cap clamps to 256', async ({ page }) => {
    await openTool(page, ROUTE, '#uu-count');
    await setVersion(page, 'v5');
    await page.locator('#uu-name').fill('example.com');
    await setCount(page, '1000');
    await expect(page.locator('#uu-count')).toHaveValue('256');
    await expect(page.locator('#uu-cap')).toContainText('256');
    await generateAndWait(page, 256, 30_000);
    const list = await ids(page);
    expect(new Set(list).size).toBe(256);
    for (const id of list) expect(id).toMatch(V5_RE);
  });

  test('4.4 v5 with an empty name errors clearly', async ({ page }) => {
    await openTool(page, ROUTE, '#uu-count');
    await setVersion(page, 'v5');
    await setCount(page, '1');
    await page.locator('#uu-name').fill('');
    await page.locator(BTN).click();
    await expect(page.locator(ERROR)).toContainText('Version 5 needs a name');
    await expect(page.locator('#uu-idle')).toBeVisible();
  });

  test('4.5 v5 with an invalid custom namespace errors clearly', async ({ page }) => {
    await openTool(page, ROUTE, '#uu-count');
    await setVersion(page, 'v5');
    await setCount(page, '1');
    await page.locator('#uu-ns').selectOption('custom');
    await page.locator('#uu-ns-custom').fill('not-a-uuid');
    await page.locator('#uu-name').fill('example.com');
    await page.locator(BTN).click();
    await expect(page.locator(ERROR)).toContainText('Namespace is not a valid UUID');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 5 · Options (case, format)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('options', () => {
test('5.1 uppercase toggle renders UPPER ids and updates the case label', async ({ page }) => {
    await openTool(page, ROUTE, '#uu-count');
    await setCheckbox(page, '#uu-upper', true);
    await expect(page.locator('#uu-case-label')).toHaveText('UPPER');
    await setCount(page, '2');
    await generateAndWait(page, 2);
    const list = await ids(page);
    for (const id of list) {
      expect(id).toBe(id.toUpperCase());
      expect(id).toMatch(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/);
    }
  });

test('5.2 uppercase + braces + urn shapes', async ({ page }) => {
    await openTool(page, ROUTE, '#uu-count');
    await setCheckbox(page, '#uu-upper', true);
    await setCount(page, '1');
    await page.locator('[data-uu-format="braces"]').click();
    await generateAndWait(page, 1);
    expect((await ids(page))[0]).toMatch(/^\{[0-9A-F-]{36}\}$/);
    await page.locator('[data-uu-format="urn"]').click();
    await generateAndWait(page, 1);
    expect((await ids(page))[0]).toMatch(/^urn:uuid:[0-9A-F-]{36}$/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 6 · Clear
// ─────────────────────────────────────────────────────────────────────────────

test.describe('clear', () => {
  test('6.1 clear resets the list but preserves version, count, format, case', async ({ page }) => {
    await openTool(page, ROUTE, '#uu-count');
await setVersion(page, 'v7');
    await setCount(page, '10');
    await setCheckbox(page, '#uu-upper', true);
    await page.locator('[data-uu-format="braces"]').click();
    await generateAndWait(page, 10);

    await page.locator('#uu-input-actions [data-action="clear"]').click();
    await expect(page.locator('#uu-idle')).toBeVisible();
    await expect(page.locator(`${LIST} .uu-row`)).toHaveCount(0);
    await expect(page.locator('#uu-copyall')).toBeDisabled();
    await expect(page.locator('#uu-download')).toBeDisabled();
    await expect(page.locator('#uu-error')).toBeHidden();

    // Options preserved.
    await expect(page.locator('[data-uu-version="v7"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#uu-count')).toHaveValue('10');
    await expect(page.locator('[data-uu-format="braces"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#uu-upper')).toBeChecked();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 7 · Keyboard
// ─────────────────────────────────────────────────────────────────────────────

test.describe('keyboard', () => {
  test('7.1 Ctrl/Cmd+Enter generates', async ({ page }) => {
    await openTool(page, ROUTE, '#uu-count');
    await setCount(page, '3');
    await pressRunShortcut(page, '#uu-count');
    await expect(page.locator(`${LIST} .uu-row`)).toHaveCount(3);
  });

  test('7.2 Ctrl/Cmd+Enter is skipped on a focused SELECT', async ({ page }) => {
    await openTool(page, ROUTE, '#uu-count');
    await setVersion(page, 'v5');
    await page.locator('#uu-name').fill('example.com');
    await setCount(page, '1');

    await page.locator('#uu-ns').focus();
    await pressRunShortcut(page, '#uu-ns');
    await expect(page.locator('#uu-idle')).toBeVisible();
    await expect(page.locator(`${LIST} .uu-row`)).toHaveCount(0);

    await page.locator('#uu-name').focus();
    await pressRunShortcut(page, '#uu-name');
    await expect(page.locator(`${LIST} .uu-row`)).toHaveCount(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 8 · Copy / Download
// ─────────────────────────────────────────────────────────────────────────────

test.describe('copy and download', () => {
  test('8.1 copy-all is disabled until a result exists', async ({ page }) => {
    await openTool(page, ROUTE, '#uu-count');
    await expect(page.locator('#uu-copyall')).toBeDisabled();
    await expect(page.locator('#uu-download')).toBeDisabled();
    await setCount(page, '2');
    await generateAndWait(page, 2);
    await expect(page.locator('#uu-copyall')).toBeEnabled();
    await expect(page.locator('#uu-download')).toBeEnabled();
  });

  test('8.2 copy-all flips to copied! and clipboard holds one per line', async ({ page }) => {
    await openTool(page, ROUTE, '#uu-count');
    await setCount(page, '2');
    await generateAndWait(page, 2);
    const list = await ids(page);
    await grantClipboard(page);
    await page.locator('#uu-copyall').click();
    await expect(page.locator('#uu-copyall')).toHaveText('copied!');
    if (isChromium(page)) {
      const clip = await page.evaluate(() => navigator.clipboard.readText());
      expect(clip.replace(/\r\n/g, "\n").split("\n")).toEqual(list);
    }
  });

  test('8.3 per-row copy flips to checkmark', async ({ page }) => {
    await openTool(page, ROUTE, '#uu-count');
    await setCount(page, '2');
    await generateAndWait(page, 2);
    await grantClipboard(page);
    const rowCopy = page.locator(`${LIST} .uu-rowcopy`).first();
    await rowCopy.click();
    await expect(rowCopy).toHaveText('✓');
  });

  test('8.4 download returns uuid-uuids.txt with every id', async ({ page }) => {
    await openTool(page, ROUTE, '#uu-count');
    await setCount(page, '3');
    await generateAndWait(page, 3);
    const list = await ids(page);
    const downloadPromise = page.waitForEvent('download');
    await page.locator('#uu-download').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('uuid-uuids.txt');
    expect(fs.readFileSync(await download.path(), 'utf8').trim().split('\n')).toEqual(list);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 9 · Race / adversarial (Breaker)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('breaker', () => {
  test('9.1 rapid double-click Generate never wedges the UI', async ({ page }) => {
    await openTool(page, ROUTE, '#uu-count');
    await setCount(page, '10');
    await page.locator(BTN).click();
    await page.locator(BTN).click({ force: true }).catch(() => {});
    await expect(page.locator(BTN)).toBeEnabled({ timeout: 15_000 });
    await expect(page.locator('#uu-error')).toBeHidden();
    await expect(page.locator(`${LIST} .uu-row`)).toHaveCount(10);
  });

  test('9.2 session total accumulates across batches', async ({ page }) => {
    await openTool(page, ROUTE, '#uu-count');
    await setCount(page, '2');
    await generateAndWait(page, 2);
    await expect(page.locator('#uu-total')).toHaveText('2');
    await generateAndWait(page, 2);
    await expect(page.locator('#uu-total')).toHaveText('4');
  });

  test('9.3 a 1000-batch v4 renders only the cap but keeps full count', async ({ page }) => {
    await openTool(page, ROUTE, '#uu-count');
    await setCount(page, '1000');
    await generateAndWait(page, 300, 30_000);
    await expect(page.locator('#uu-tail')).toContainText('showing 300 of 1,000');
  });
});

