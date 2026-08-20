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
  waitForCharCount,
  setCheckbox,
} from './helpers';

const ROUTE = '/tools/json-minifier/';
const INPUT = '#json-input-textarea';
const INPUT_STATUS = '#json-validation-status';
const OUTPUT = '#minified-output-textarea';
const OUTPUT_STATUS = '#minified-output-status';
const ERROR = '#minify-error-message';
const BTN = '#minify-btn';
const ANNOUNCE = '#minify-status-announce';

async function typeJson(page: Page, text: string, countTimeout?: number): Promise<void> {
  await page.locator(INPUT).fill(text);
  await waitForCharCount(page, '#json-char-count', text.length, countTimeout);
  // The page debounces input handling (150ms); once it has run, any prior
  // result is cleared to Output: Empty. Waiting on that proves the new value
  // is in the store before we act, so the char count alone (identical for
  // same-length inputs) cannot short-circuit the wait.
  await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Empty');
}

async function minifyAndSettle(page: Page, timeout = 15_000): Promise<void> {
  await page.locator(BTN).click();
  await expect(page.locator(BTN)).toBeEnabled({ timeout });
  await expect(page.locator(OUTPUT_STATUS)).not.toHaveText('Output: Empty', { timeout });
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite 1 · Load
// ─────────────────────────────────────────────────────────────────────────────

test.describe('load', () => {
  test('1.1 page renders with header contract and all six sections in order', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator(BTN)).toHaveText('Minify');
    await expect(page.locator(INPUT_STATUS)).toHaveText('Status: Empty');
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Empty');
    await expect(page.locator('#mf-stats')).toBeHidden();
    await expectSectionsInOrder(page);
  });

  test('1.2 no console errors on load', async ({ page }) => {
    const errs = trackPageErrors(page);
    await openTool(page, ROUTE, INPUT);
    await errs.assertNone();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 2 · Load Sample
// ─────────────────────────────────────────────────────────────────────────────

test.describe('load sample', () => {
  test('2.1 sample loads, never auto-runs, and announces', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    await page.locator('#input-actions [data-action="sample"]').click();
    await expect(await page.locator(INPUT).inputValue()).toContain('"toolkit"');
    await expect(page.locator(INPUT_STATUS)).toHaveText('Status: Ready');
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Empty');
    await expect(page.locator(OUTPUT)).toHaveValue('');
    await expect(page.locator('#mf-stats')).toBeHidden();
    await expect(page.locator(ANNOUNCE)).toHaveText('Sample JSON loaded');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 3 · Primary action
// ─────────────────────────────────────────────────────────────────────────────

test.describe('primary action', () => {
  test('3.1 minify strips whitespace and reports exact compression stats', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    const input = '{ "a": [1, 2], "b": "  x  " }';
    await typeJson(page, input);
    await clickAndCatchBusy(page, BTN, 'Minifying…');
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: JSON');
    await expect(page.locator(OUTPUT)).toHaveValue('{"a":[1,2],"b":"  x  "}');
    // original 29, minified 23, saved 6, reduction round(6/29*100)=21
    await expect(page.locator('#mf-before')).toHaveText('29');
    await expect(page.locator('#mf-after')).toHaveText('23');
    await expect(page.locator('#mf-saved')).toHaveText('6');
    await expect(page.locator('#mf-pct')).toHaveText('21% smaller');
    await expect(page.locator('#mf-bar')).toHaveAttribute('style', /width:\s*21%/);
    await expect(page.locator(ANNOUNCE)).toHaveText('Minified: 21% smaller');
  });

  test('3.2 minified output reparses to the same value', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    const input = '{\n  "nested": { "deep": [1, 2, 3], "ok": true },\n  "s": "line1\\nline2"\n}';
    await typeJson(page, input);
    await minifyAndSettle(page);
    const out = await page.locator(OUTPUT).inputValue();
    expect(JSON.parse(out)).toEqual(JSON.parse(input));
    expect(out).not.toContain('\n  ');
  });

  test('3.3 sort-keys orders object keys recursively', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    await setCheckbox(page, '#sort-keys-checkbox', true);
    await typeJson(page, '{"z":1,"a":{"y":2,"x":[3,4]}}');
    await minifyAndSettle(page);
    await expect(page.locator(OUTPUT)).toHaveValue('{"a":{"x":[3,4],"y":2},"z":1}');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 4 · Invalid input (no fake output)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('invalid input', () => {
  test('4.1 invalid JSON errors with coordinates and empty output', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    await typeJson(page, '{bad json}');
    await expect(page.locator(INPUT_STATUS)).toHaveText('Status: Invalid');
    await page.locator(BTN).click();
    await expect(page.locator(BTN)).toBeEnabled();
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Empty');
    await expect(page.locator(OUTPUT)).toHaveValue('');
    await expect(page.locator(ERROR)).toContainText('Unexpected character');
    await expect(page.locator(ERROR)).toContainText('line 1, column 2');
    await expect(page.locator('#mf-stats')).toBeHidden();
  });

  test('4.2 empty and whitespace-only input nudge on Minify', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    await page.locator(BTN).click();
    await expect(page.locator(ERROR)).toContainText('Nothing to minify yet');
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Empty');

    await typeJson(page, '   \n ');
    await page.locator(BTN).click();
    await expect(page.locator(ERROR)).toContainText('Nothing to minify yet');
  });

  test('4.3 fixing an error clears the banner and minifies cleanly', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    await typeJson(page, '{"oops":');
    await page.locator(BTN).click();
    await expect(page.locator('#minify-error')).toBeVisible();
    await typeJson(page, '{"fixed":true}');
    await expect(page.locator('#minify-error')).toBeHidden();
    await minifyAndSettle(page);
    await expect(page.locator(OUTPUT)).toHaveValue('{"fixed":true}');
  });

  test('4.4 XSS payload stays inert and never executes', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    let dialogs = 0;
    page.on('dialog', () => {
      dialogs++;
    });
    const payload = '{"x":"<img src=x onerror=alert(1)><script>window.__pwned=1</script>"}';
    await typeJson(page, payload);
    await minifyAndSettle(page);
    expect(dialogs).toBe(0);
    expect(await page.evaluate(() => (window as unknown as { __pwned?: number }).__pwned)).toBeUndefined();
    expect(await page.locator(OUTPUT).inputValue()).toContain(payload);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 5 · Breaker: JSON.parse leniency and boundary values
// ─────────────────────────────────────────────────────────────────────────────

test.describe('breaker: lenient parse and boundaries', () => {
  // KNOWN QUIRK, revised by the Breaker pass: JSON.parse does NOT tolerate
  // trailing commas (JSON grammar is stricter than array literals), so
  // "[1,2,]" is rejected with a coordinate error, not normalized.
  test('5.1 trailing commas are rejected with a coordinate error', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    await typeJson(page, '[1,2,]');
    await page.locator(BTN).click();
    await expect(page.locator(ERROR)).toContainText('Trailing comma');
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Empty');
    await expect(page.locator(OUTPUT)).toHaveValue('');
  });

  // KNOWN QUIRK: JSON.stringify(Infinity) -> "null", so 1e400 minifies to null.
  // Surfaced by the Breaker pass as a data-integrity note, not hidden.
  test('5.2 1e400 minifies to "null" (documented quirk)', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    await typeJson(page, '1e400');
    await minifyAndSettle(page);
    await expect(page.locator(OUTPUT)).toHaveValue('null');
  });

  // KNOWN QUIRK: duplicate keys collapse to the last value.
  test('5.3 duplicate keys collapse to the last value (documented quirk)', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    await typeJson(page, '{"a":1,"a":2}');
    await minifyAndSettle(page);
    await expect(page.locator(OUTPUT)).toHaveValue('{"a":2}');
  });

  test('5.4 unicode and emoji survive minification byte-for-byte', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    await typeJson(page, '{"emoji":"😀","mb":"日本語","esc":"\\u00e9"}');
    await minifyAndSettle(page);
    await expect(page.locator(OUTPUT)).toHaveValue('{"emoji":"😀","mb":"日本語","esc":"é"}');
  });

  test('5.5 very large valid input minifies via the worker with exact stats', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    const input = '[' + Array.from({ length: 20_000 }, (_, i) => `{"i":${i},"pad":"${'y'.repeat(20)}"}`).join(',') + ']';
    expect(input.length).toBeGreaterThan(300_000);
    await typeJson(page, input, 20_000);
    await minifyAndSettle(page, 30_000);
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: JSON');
    expect(await page.locator(OUTPUT).inputValue()).toBe(JSON.stringify(JSON.parse(input)));
    // mf-before renders toLocaleString() with the BROWSER locale (en-IN style
    // lakhs grouping), so compare digits only.
    await expect
      .poll(async () => {
        const t = await page.locator('#mf-before').textContent();
        return Number((t ?? '').replace(/[^\d]/g, ''));
      })
      .toBe(input.length);
  });

  test('5.6 deeply nested JSON minifies (JSON.parse has no depth cap)', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    const deep = '['.repeat(5000) + '0' + ']'.repeat(5000);
    await typeJson(page, deep);
    await minifyAndSettle(page, 30_000);
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: JSON');
    expect(await page.locator(OUTPUT).inputValue()).toBe('['.repeat(5000) + '0' + ']'.repeat(5000));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 6 · Clear / options
// ─────────────────────────────────────────────────────────────────────────────

test.describe('clear and options', () => {
  test('6.1 clear resets input, output, stats, error; preserves sort-keys', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    await setCheckbox(page, '#sort-keys-checkbox', true);
    await typeJson(page, '{"b":1,"a":2}');
    await minifyAndSettle(page);
    await expect(page.locator(OUTPUT)).toHaveValue('{"a":2,"b":1}');

    await page.locator('#input-actions [data-action="clear"]').click();
    await expect(page.locator(INPUT)).toHaveValue('');
    await expect(page.locator(INPUT_STATUS)).toHaveText('Status: Empty');
    await expect(page.locator(OUTPUT)).toHaveValue('');
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Empty');
    await expect(page.locator('#minify-error')).toBeHidden();
    await expect(page.locator('#mf-stats')).toBeHidden();
    await expect(page.locator('#sort-keys-checkbox')).toBeChecked();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 7 · Keyboard
// ─────────────────────────────────────────────────────────────────────────────

test.describe('keyboard', () => {
  test('7.1 Ctrl/Cmd+Enter minifies', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    await typeJson(page, '{"hotkey":1}');
    await pressRunShortcut(page, INPUT);
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: JSON');
    await expect(page.locator(OUTPUT)).toHaveValue('{"hotkey":1}');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 8 · Copy / Download
// ─────────────────────────────────────────────────────────────────────────────

test.describe('copy and download', () => {
  test('8.1 copy flips to Copied! and clipboard holds the minified JSON', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    await typeJson(page, '{"id":7,"name":"Ada"}');
    await minifyAndSettle(page);
    await grantClipboard(page);
    await page.locator('#output-actions [data-action="copy"]').click();
    await expect(page.locator('#output-actions [data-action="copy"]')).toHaveText('Copied!');
    if (isChromium(page)) {
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('{"id":7,"name":"Ada"}');
    }
  });

  test('8.2 download returns the minified JSON file', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    await typeJson(page, '{"id":7,"name":"Ada"}');
    await minifyAndSettle(page);
    const downloadPromise = page.waitForEvent('download');
    await page.locator('#output-actions [data-action="download"]').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('json-minifier-minified.json');
    expect(fs.readFileSync(await download.path(), 'utf8')).toBe('{"id":7,"name":"Ada"}');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 9 · File upload path
// ─────────────────────────────────────────────────────────────────────────────

test.describe('file upload', () => {
  test('9.1 upload valid file loads and minifies (file-drop auto-runs)', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    const file = test.info().outputPath(`m-valid-${Date.now()}.json`);
    fs.writeFileSync(file, '{\n  "fromFile": true,\n  "n": [1, 2, 3]\n}', 'utf8');
    await page.locator('#json-input-file-input').setInputFiles(file);
    await expect(page.locator(INPUT)).toHaveValue('{\n  "fromFile": true,\n  "n": [1, 2, 3]\n}');
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: JSON', { timeout: 10_000 });
    await expect(page.locator(OUTPUT)).toHaveValue('{"fromFile":true,"n":[1,2,3]}');
  });

  test('9.2 upload invalid file surfaces an error, no fake output', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    const file = test.info().outputPath(`m-invalid-${Date.now()}.json`);
    fs.writeFileSync(file, '{"broken":', 'utf8');
    await page.locator('#json-input-file-input').setInputFiles(file);
    await expect(page.locator(INPUT_STATUS)).toHaveText('Status: Invalid');
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Empty');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 10 · Race / adversarial (Breaker)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('breaker: races', () => {
  test('10.1 rapid double-click Minify never wedges the UI', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    await typeJson(page, '{"a":1}');
    await page.locator(BTN).click();
    await page.locator(BTN).click({ force: true }).catch(() => {});
    await expect(page.locator(BTN)).toBeEnabled({ timeout: 10_000 });
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: JSON');
    await expect(page.locator('#minify-error')).toBeHidden();
  });

  test('10.2 typing new input mid-run discards the stale worker result', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    const big = '[' + Array.from({ length: 30_000 }, (_, i) => `{"i":${i}}`).join(',') + ']';
    await typeJson(page, big);
    await page.locator(BTN).click();
    await typeJson(page, '{"fresh":1}');
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Empty', { timeout: 30_000 });
    await expect(page.locator(BTN)).toBeEnabled({ timeout: 30_000 });
    await page.locator(BTN).click();
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: JSON');
    await expect(page.locator(OUTPUT)).toHaveValue('{"fresh":1}');
  });
});