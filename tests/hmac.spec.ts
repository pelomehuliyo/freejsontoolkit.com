import { test, expect, type Page } from '@playwright/test';
import * as fs from 'node:fs';
import { createHmac } from 'node:crypto';
import {
  openTool,
  trackPageErrors,
  pressRunShortcut,
  grantClipboard,
  isChromium,
  expectSectionsInOrder,
  clickAndCatchBusy,
} from './helpers';

const ROUTE = '/tools/hmac/';
const MSG = '#hmac-msg-textarea';
const KEY = '#hmac-key-textarea';
const MSG_STATUS = '#hmac-msg-status';
const KEY_STATUS = '#hmac-key-status';
const OUTPUT = '#hmac-output-textarea';
const OUTPUT_STATUS = '#hmac-output-status';
const ERROR = '#hmac-error-message';
const BTN = '#hmac-run';
const ANNOUNCE = '#hmac-announce';

function expected(alg: 'sha256' | 'sha512', key: string, msg: string): string {
  return createHmac(alg, Buffer.from(key, 'utf8'))
    .update(Buffer.from(msg, 'utf8'))
    .digest('hex');
}

async function fillMsg(page: Page, text: string): Promise<void> {
  await page.locator(MSG).fill(text);
  const len = text.length.toLocaleString() + ' chars';
  await expect(page.locator('#hmac-msg-count')).toHaveText(len);
  await expect(page.locator(MSG_STATUS)).toHaveText('Status: Ready');
}

async function fillKey(page: Page, text: string): Promise<void> {
  await page.locator(KEY).fill(text);
  const len = text.length.toLocaleString() + ' chars';
  await expect(page.locator('#hmac-key-count')).toHaveText(len);
  await expect(page.locator(KEY_STATUS)).toHaveText('Status: Ready');
}

async function generateAndSettle(page: Page): Promise<void> {
  await clickAndCatchBusy(page, BTN, 'Generating…');
  await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: HMAC');
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite 1 · Load
// ─────────────────────────────────────────────────────────────────────────────

test.describe('load', () => {
  test('1.1 page renders with header contract and empty state', async ({ page }) => {
    await openTool(page, ROUTE, MSG);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator(BTN)).toHaveText('Generate');
    await expect(page.locator(MSG_STATUS)).toHaveText('Status: Empty');
    await expect(page.locator(KEY_STATUS)).toHaveText('Status: Empty');
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Empty');
    await expect(page.locator('#hmac-alg-val')).toHaveText('HMAC-SHA-256');
    await expectSectionsInOrder(page);
  });

  test('1.2 no console errors on load', async ({ page }) => {
    const errs = trackPageErrors(page);
    await openTool(page, ROUTE, MSG);
    await errs.assertNone();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 2 · Load Sample
// ─────────────────────────────────────────────────────────────────────────────

test.describe('load sample', () => {
  test('2.1 sample loads message and key, never auto-runs', async ({ page }) => {
    await openTool(page, ROUTE, MSG);
    await page.locator('#msg-actions [data-action="sample"]').click();
    await expect(page.locator(MSG)).toHaveValue('Free JSON Toolkit — Privacy First.');
    await expect(page.locator(KEY)).toHaveValue('s3cret-k3y-2026');
    await expect(page.locator(MSG_STATUS)).toHaveText('Status: Ready');
    await expect(page.locator(KEY_STATUS)).toHaveText('Status: Ready');
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Empty');
    await expect(page.locator(ANNOUNCE)).toHaveText('Sample loaded');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 3 · Primary action + vector correctness
// ─────────────────────────────────────────────────────────────────────────────

test.describe('primary action', () => {
  test('3.1 RFC-vector message produces the exact known HMAC-SHA-256', async ({ page }) => {
    await openTool(page, ROUTE, MSG);
    await fillMsg(page, 'The quick brown fox jumps over the lazy dog');
    await fillKey(page, 'key');
    await generateAndSettle(page);
    const want = expected('sha256', 'key', 'The quick brown fox jumps over the lazy dog');
    await expect(page.locator(OUTPUT)).toHaveValue(want);
    await expect(page.locator('#hmac-output-count')).toHaveText(`${want.length} chars`);
  });

  test('3.2 base64 encoding matches the hex bytes', async ({ page }) => {
    await openTool(page, ROUTE, MSG);
    await fillMsg(page, 'The quick brown fox jumps over the lazy dog');
    await fillKey(page, 'key');
    await generateAndSettle(page);
    const hex = expected('sha256', 'key', 'The quick brown fox jumps over the lazy dog');
    await page.locator('[data-hmac-enc="base64"]').click();
    await expect(page.locator(OUTPUT)).toHaveValue(Buffer.from(hex, 'hex').toString('base64'));
  });

  test('3.3 SHA-512 yields a different, verifiable digest', async ({ page }) => {
    await openTool(page, ROUTE, MSG);
    await fillMsg(page, 'The quick brown fox jumps over the lazy dog');
    await fillKey(page, 'key');
    await generateAndSettle(page);
    const sha256 = await page.locator(OUTPUT).inputValue();

    await page.locator('[data-hmac-alg="SHA-512"]').click();
    await expect(page.locator('#hmac-alg-val')).toHaveText('HMAC-SHA-512');
    await generateAndSettle(page);
    const sha512 = await page.locator(OUTPUT).inputValue();
    const want = expected('sha512', 'key', 'The quick brown fox jumps over the lazy dog');
    expect(sha512).toBe(want);
    expect(sha512).not.toBe(sha256);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 4 · Edge and invalid input
// ─────────────────────────────────────────────────────────────────────────────

test.describe('edge and invalid input', () => {
  test('4.1 empty message errors via the banner; the empty-field status stays Empty', async ({ page }) => {
    await openTool(page, ROUTE, MSG);
    await fillKey(page, 'key');
    await page.locator(BTN).click();
    await expect(page.locator(ERROR)).toContainText('Message is empty');
    await expect(page.locator(MSG_STATUS)).toHaveText('Status: Empty');
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Empty');
  });

  test('4.2 empty key errors via the banner; the empty-field status stays Empty', async ({ page }) => {
    await openTool(page, ROUTE, MSG);
    await fillMsg(page, 'hello');
    await page.locator(BTN).click();
    await expect(page.locator(ERROR)).toContainText('Secret key is empty');
    await expect(page.locator(KEY_STATUS)).toHaveText('Status: Empty');
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Empty');
  });

  test('4.3 empty message AND key is a silent no-op, not an error', async ({ page }) => {
    await openTool(page, ROUTE, MSG);
    const errs = trackPageErrors(page);
    await page.locator(BTN).click();
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Empty');
    await expect(page.locator('#hmac-error')).toBeHidden();
    await errs.assertNone();
  });

  test('4.4 unicode and newlines hash over the exact UTF-8 bytes', async ({ page }) => {
    await openTool(page, ROUTE, MSG);
    const msg = 'café 😀\nline2\ttab';
    await fillMsg(page, msg);
    await fillKey(page, 's3crét');
    await generateAndSettle(page);
    await expect(page.locator(OUTPUT)).toHaveValue(expected('sha256', 's3crét', msg));
  });

  test('4.5 XSS payload is hashed as data, never executed', async ({ page }) => {
    await openTool(page, ROUTE, MSG);
    let dialogs = 0;
    page.on('dialog', () => {
      dialogs++;
    });
    await fillMsg(page, '<img src=x onerror="alert(1)"><script>window.__pwned=1</script>');
    await fillKey(page, 'key');
    await generateAndSettle(page);
    expect(dialogs).toBe(0);
    expect(await page.evaluate(() => (window as unknown as { __pwned?: number }).__pwned)).toBeUndefined();
    expect(await page.locator(OUTPUT).inputValue()).not.toContain('<img');
  });

  test('4.6 fixing a missing key clears the error and generates', async ({ page }) => {
    await openTool(page, ROUTE, MSG);
    await fillMsg(page, 'hello');
    await page.locator(BTN).click();
    await expect(page.locator('#hmac-error')).toBeVisible();
    await fillKey(page, 'key');
    await expect(page.locator('#hmac-error')).toBeHidden();
    await generateAndSettle(page);
    await expect(page.locator(OUTPUT)).toHaveValue(expected('sha256', 'key', 'hello'));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 5 · Clear preserves options
// ─────────────────────────────────────────────────────────────────────────────

test.describe('clear', () => {
  test('5.1 clear resets message, key, output, error; preserves algorithm and encoding', async ({ page }) => {
    await openTool(page, ROUTE, MSG);
    await page.locator('[data-hmac-alg="SHA-512"]').click();
    await page.locator('[data-hmac-enc="base64"]').click();
    await fillMsg(page, 'hello');
    await fillKey(page, 'key');
    await generateAndSettle(page);
    await expect(page.locator(OUTPUT)).toHaveValue(
      Buffer.from(expected('sha512', 'key', 'hello'), 'hex').toString('base64'),
    );

    await page.locator('#msg-actions [data-action="clear"]').click();
    await expect(page.locator(MSG)).toHaveValue('');
    await expect(page.locator(KEY)).toHaveValue('');
    await expect(page.locator(MSG_STATUS)).toHaveText('Status: Empty');
    await expect(page.locator(KEY_STATUS)).toHaveText('Status: Empty');
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Empty');
    await expect(page.locator('#hmac-error')).toBeHidden();

    // Options preserved.
    await expect(page.locator('[data-hmac-alg="SHA-512"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-hmac-enc="base64"]')).toHaveAttribute('aria-pressed', 'true');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 6 · Keyboard
// ─────────────────────────────────────────────────────────────────────────────

test.describe('keyboard', () => {
  test('6.1 Ctrl/Cmd+Enter generates', async ({ page }) => {
    await openTool(page, ROUTE, MSG);
    await fillMsg(page, 'hello');
    await fillKey(page, 'key');
    await pressRunShortcut(page, MSG);
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: HMAC');
    await expect(page.locator(OUTPUT)).toHaveValue(expected('sha256', 'key', 'hello'));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 7 · Copy / Download
// ─────────────────────────────────────────────────────────────────────────────

test.describe('copy and download', () => {
  test('7.1 copy flips to Copied! and clipboard holds the MAC', async ({ page }) => {
    await openTool(page, ROUTE, MSG);
    await fillMsg(page, 'hello');
    await fillKey(page, 'key');
    await generateAndSettle(page);
    const want = expected('sha256', 'key', 'hello');
    await grantClipboard(page);
    await page.locator('#output-actions [data-action="copy"]').click();
    await expect(page.locator('#output-actions [data-action="copy"]')).toHaveText('Copied!');
    if (isChromium(page)) {
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(want);
    }
  });

  test('7.2 download names the file after the current encoding', async ({ page }) => {
    await openTool(page, ROUTE, MSG);
    await fillMsg(page, 'hello');
    await fillKey(page, 'key');
    await generateAndSettle(page);
    const wantHex = expected('sha256', 'key', 'hello');

    let downloadPromise = page.waitForEvent('download');
    await page.locator('#output-actions [data-action="download"]').click();
    let download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('hmac.hex');
    expect(fs.readFileSync(await download.path(), 'utf8')).toBe(wantHex);

    await page.locator('[data-hmac-enc="base64"]').click();
    const wantB64 = Buffer.from(wantHex, 'hex').toString('base64');
    downloadPromise = page.waitForEvent('download');
    await page.locator('#output-actions [data-action="download"]').click();
    download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('hmac.b64');
    expect(fs.readFileSync(await download.path(), 'utf8')).toBe(wantB64);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 8 · Race / adversarial (Breaker)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('breaker', () => {
  test('8.1 rapid double-click Generate never wedges the UI', async ({ page }) => {
    await openTool(page, ROUTE, MSG);
    await fillMsg(page, 'hello');
    await fillKey(page, 'key');
    await page.locator(BTN).click();
    await page.locator(BTN).click({ force: true }).catch(() => {});
    await expect(page.locator(BTN)).toBeEnabled({ timeout: 10_000 });
    await expect(page.locator('#hmac-error')).toBeHidden();
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: HMAC');
    await expect(page.locator(OUTPUT)).toHaveValue(expected('sha256', 'key', 'hello'));
  });

  test('8.2 algorithm switch after a result leaves no stale output', async ({ page }) => {
    await openTool(page, ROUTE, MSG);
    await fillMsg(page, 'hello');
    await fillKey(page, 'key');
    await generateAndSettle(page);
    const sha256 = await page.locator(OUTPUT).inputValue();

    // Switching algorithm without regenerating keeps the last digest (documented
    // behavior: output reflects the last run). Regenerating must produce the
    // correct SHA-512 value, never a stale SHA-256 one.
    await page.locator('[data-hmac-alg="SHA-512"]').click();
    await generateAndSettle(page);
    const sha512 = await page.locator(OUTPUT).inputValue();
    expect(sha512).toBe(expected('sha512', 'key', 'hello'));
    expect(sha512).not.toBe(sha256);
  });
});