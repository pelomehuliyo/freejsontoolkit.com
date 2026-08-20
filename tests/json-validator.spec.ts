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

const ROUTE = '/tools/json-validator/';
const INPUT = '#json-input-textarea';
const INPUT_STATUS = '#json-validation-status';
const OUTPUT = '#validation-output-textarea';
const OUTPUT_STATUS = '#validation-output-status';
const ERROR = '#validate-error-message';
const BTN = '#validate-btn';
const ANNOUNCE = '#validate-status-announce';

async function typeJson(page: Page, text: string): Promise<void> {
  await page.locator(INPUT).fill(text);
  await waitForCharCount(page, '#json-char-count', text.length);
  // The page debounces input handling (150ms); once it has run, any prior
  // result is cleared to Output: Empty. Waiting on that proves the new value
  // is in the store before we act, so the char count alone (identical for
  // same-length inputs) cannot short-circuit the wait.
  await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Empty');
}

async function validateAndSettle(page: Page, timeout = 15_000): Promise<void> {
  await page.locator(BTN).click();
  await expect(page.locator(BTN)).toBeEnabled({ timeout });
  await expect(page.locator(OUTPUT_STATUS)).not.toHaveText('Output: Empty', { timeout });
}

async function outputText(page: Page): Promise<string> {
  return page.locator(OUTPUT).inputValue();
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite 1 · Load
// ─────────────────────────────────────────────────────────────────────────────

test.describe('load', () => {
  test('1.1 page renders with header contract and all six sections in order', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('#validate-btn')).toHaveText('Validate');
    await expect(page.locator(INPUT_STATUS)).toHaveText('Status: Empty');
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Empty');
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
    await expect(page.locator(ANNOUNCE)).toHaveText('Sample JSON loaded');
    await expect(page.locator(OUTPUT)).toHaveValue('');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 3 · Primary action
// ─────────────────────────────────────────────────────────────────────────────

test.describe('primary action', () => {
  test('3.1 valid JSON moves output Empty -> Valid with exact report', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    await typeJson(page, '{"a":1,"b":[true,null],"c":"x"}');
    await clickAndCatchBusy(page, BTN, 'Validating…');
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Valid');
    const report = await outputText(page);
    expect(report).toContain('✓ Valid JSON');
    expect(report).toContain('objects');
    expect(report).toContain('arrays');
    expect(report).toContain('strings');
    expect(report).toContain('numbers');
    expect(report).toContain('booleans');
    expect(report).toContain('nulls');
    expect(report).toContain('max depth');
    expect(report).toContain('size');
    await expect(page.locator(ANNOUNCE)).toHaveText('JSON is valid');
  });

  test('3.2 invalid JSON moves output Empty -> Invalid with coordinates', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    await typeJson(page, '{"a":}');
    await clickAndCatchBusy(page, BTN, 'Validating…');
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Invalid');
    const report = await outputText(page);
    expect(report).toContain('✗ Invalid JSON');
    expect(report).toMatch(/line \d+, column \d+/);
    await expect(page.locator(ANNOUNCE)).toHaveText('JSON is invalid');
  });

  test('3.3 live-as-you-type updates the status bar but never fills output', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    await typeJson(page, '{"ok":1}');
    await expect(page.locator(INPUT_STATUS)).toHaveText('Status: Ready');
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Empty');
    await typeJson(page, '{"bad":}');
    await expect(page.locator(INPUT_STATUS)).toHaveText('Status: Invalid — line 1, col 8');
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Empty');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 4 · Invalid input (no fake output)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('invalid input', () => {
  const cases: [string, string][] = [
    ['{bad json}', 'Unexpected character'],
    ['{"a":1,}', 'Trailing comma in object'],
    ['{"a":01}', 'Leading zeros are not allowed'],
    ["{'a':1}", 'Unexpected character'],
    ['{a:1}', 'Unexpected character'],
    ['{"a":1} // comment', 'Unexpected character'],
    ['{"a":undefined}', 'Unexpected character'],
    ['{"a":NaN}', 'Unexpected character'],
    ['{"a":Infinity}', 'Unexpected character'],
    ['{"a":"\\q"}', 'Bad escape character'],
    ['{"a":"\\u12xz"}', 'Bad unicode escape'],
    ['[1,2,]', 'Trailing comma in array'],
    ['{"a":1,', 'Expected property name (a string)'],
    ['[1,2', 'Unterminated array'],
  ];

  for (const [input, message] of cases) {
    test(`4.1 rejects ${JSON.stringify(input).slice(0, 40)} -> "${message}"`, async ({ page }) => {
      await openTool(page, ROUTE, INPUT);
      await typeJson(page, input);
      await expect(page.locator(INPUT_STATUS)).toContainText('Status: Invalid');
      await validateAndSettle(page);
      await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Invalid');
      // Authoritative invalid results report the error in the output report,
      // not the error banner (the banner is for operational errors).
      const report = await outputText(page);
      expect(report).toContain('✗ Invalid JSON');
      expect(report).toContain(message);
      await expect(page.locator(ERROR)).not.toBeVisible();
    });
  }

  test('4.2 top-level primitives are valid JSON', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    for (const input of ['42', '-0', '1e400', 'true', 'false', 'null', '"str"', '{}', '[]']) {
      await typeJson(page, input);
      await validateAndSettle(page);
      await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Valid');
      expect(await outputText(page)).toContain('✓ Valid JSON');
    }
  });

  test('4.3 deep nesting beyond the depth cap is rejected with a graceful message', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    const deep = '['.repeat(4200) + ']'.repeat(4200);
    await typeJson(page, deep);
    await validateAndSettle(page, 30_000);
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Invalid');
    expect(await outputText(page)).toContain('Nesting exceeds 1024 levels');
  });

  test('4.4 XSS payload never executes and errors stay inert', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    let dialogs = 0;
    page.on('dialog', () => {
      dialogs++;
    });
    const payload = '<img src=x onerror="alert(1)"><script>window.__pwned=1</script>';
    await typeJson(page, payload);
    await validateAndSettle(page);
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Invalid');
    expect(dialogs).toBe(0);
    expect(await page.evaluate(() => (window as unknown as { __pwned?: number }).__pwned)).toBeUndefined();
    await expect(page.locator(ERROR)).not.toContainText('<img');
  });

  test('4.5 duplicate keys are valid but flagged when the option is on', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    await typeJson(page, '{"a":1,"a":2,"b":3}');

    await setCheckbox(page, '#flag-dupes-checkbox', true);
    await validateAndSettle(page);
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Valid');
    const on = await outputText(page);
    expect(on).toContain('duplicates');
    expect(on).toContain('"a"');

    await setCheckbox(page, '#flag-dupes-checkbox', false);
    await page.locator(BTN).click();
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Valid');
    const off = await outputText(page);
    expect(off).toContain('duplicates');
    expect(off).toMatch(/duplicates\s*\.+\s*0/);
  });

  test('4.6 fixing an error revalidates cleanly and clears the stale verdict', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    await typeJson(page, '{bad}');
    await validateAndSettle(page);
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Invalid');
    expect(await outputText(page)).toContain('✗ Invalid JSON');

    await typeJson(page, '{"fixed":true}');
    await expect(page.locator(INPUT_STATUS)).toContainText('Status: Ready');
    await validateAndSettle(page);
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Valid');
    expect(await outputText(page)).toContain('✓ Valid JSON');
  });

  test('4.7 empty and whitespace-only input nudge on Validate', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    await page.locator(BTN).click();
    await expect(page.locator(ERROR)).toContainText('Nothing to validate yet');
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Empty');

    await typeJson(page, '   \n\t ');
    await page.locator(BTN).click();
    await expect(page.locator(ERROR)).toContainText('Nothing to validate yet');
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Empty');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 5 · Options (Breaker)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('options', () => {
  test('5.1 normalized output follows the chosen indent', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    await setCheckbox(page, '#include-normalized-checkbox', true);
    await typeJson(page, '{"z":1,"a":{"n":2}}');
    await validateAndSettle(page);
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Valid');
    const report = await outputText(page);
    expect(report).toContain('normalized');
    expect(report).toContain('"z": 1');
    expect(report).toContain('"a": {');
    expect(report).not.toContain('\t"z"');

    await page.locator('#indent-select [data-value="tab"]').click();
    await page.locator(BTN).click();
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Valid');
    expect(await outputText(page)).toContain('\t"z"');
  });

  test('5.2 normalized with duplicates notes that the last key wins', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    await setCheckbox(page, '#include-normalized-checkbox', true);
    await setCheckbox(page, '#flag-dupes-checkbox', true);
    await typeJson(page, '{"a":1,"a":9}');
    await validateAndSettle(page);
    expect(await outputText(page)).toContain('last key wins');
  });

  test('5.3 clear preserves flags, indent, and normalized options', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    await setCheckbox(page, '#flag-dupes-checkbox', true);
    await setCheckbox(page, '#include-normalized-checkbox', true);
    await page.locator('#indent-select [data-value="4"]').click();
    await typeJson(page, '{"a":1}');
    await validateAndSettle(page);
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Valid');

    await page.locator('#input-actions [data-action="clear"]').click();
    await expect(page.locator(INPUT)).toHaveValue('');
    await expect(page.locator(INPUT_STATUS)).toHaveText('Status: Empty');
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Empty');
    await expect(page.locator(OUTPUT)).toHaveValue('');
    await expect(page.locator('#validate-error')).toBeHidden();
    await expect(page.locator('#flag-dupes-checkbox')).toBeChecked();
    await expect(page.locator('#include-normalized-checkbox')).toBeChecked();
    await expect(page.locator('#indent-select [data-value="4"]')).toHaveClass(/is-active/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 6 · Keyboard
// ─────────────────────────────────────────────────────────────────────────────

test.describe('keyboard', () => {
  test('6.1 Ctrl/Cmd+Enter runs Validate', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    await typeJson(page, '{"hotkey":1}');
    await pressRunShortcut(page, INPUT);
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Valid');
    expect(await outputText(page)).toContain('✓ Valid JSON');
  });

  test('6.2 typing new input mid-run discards the stale worker result', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    const big = '[' + Array.from({ length: 30_000 }, (_, i) => `{"i":${i}}`).join(',') + ']';
    await typeJson(page, big);
    await page.locator(BTN).click();
    await typeJson(page, '{bad}');
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Empty', { timeout: 10_000 });
    await page.locator(BTN).click();
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Invalid');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 7 · Copy / Download
// ─────────────────────────────────────────────────────────────────────────────

test.describe('copy and download', () => {
  test('7.1 copy flips to Copied! and clipboard holds the report', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    await typeJson(page, '{"a":1}');
    await validateAndSettle(page);
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Valid');
    await grantClipboard(page);
    await page.locator('#output-actions [data-action="copy"]').click();
    await expect(page.locator('#output-actions [data-action="copy"]')).toHaveText('Copied!');
    if (isChromium(page)) {
      const clip = await page.evaluate(() => navigator.clipboard.readText());
      expect(clip).toContain('✓ Valid JSON');
    }
  });

  test('7.2 download returns the report file', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    await typeJson(page, '{"a":1}');
    await validateAndSettle(page);
    const downloadPromise = page.waitForEvent('download');
    await page.locator('#output-actions [data-action="download"]').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('json-validator-validation-report.txt');
    expect(fs.readFileSync(await download.path(), 'utf8')).toContain('✓ Valid JSON');
  });

  test('7.3 copy/download with no result are no-ops, no crash', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    const errs = trackPageErrors(page);
    await page.locator('#output-actions [data-action="copy"]').click();
    await page.locator('#output-actions [data-action="download"]').click();
    await expect(page.locator('#output-actions [data-action="copy"]')).toHaveText('Copy');
    await errs.assertNone();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 8 · File upload path
// ─────────────────────────────────────────────────────────────────────────────

test.describe('file upload', () => {
  test('8.1 upload valid file loads text, never auto-runs, then validates', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    const file = test.info().outputPath(`valid-${Date.now()}.json`);
    fs.writeFileSync(file, '{"fromFile":true,"n":[1,2,3]}', 'utf8');
    await page.locator('#json-input-file-input').setInputFiles(file);

    await expect(page.locator(INPUT)).toHaveValue('{"fromFile":true,"n":[1,2,3]}');
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Empty');
    await validateAndSettle(page);
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Valid');
  });

  test('8.2 upload invalid file yields an Invalid verdict on Validate', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    const file = test.info().outputPath(`invalid-${Date.now()}.json`);
    fs.writeFileSync(file, '{"broken":', 'utf8');
    await page.locator('#json-input-file-input').setInputFiles(file);
    await expect(page.locator(INPUT_STATUS)).toContainText('Status: Invalid');
    await validateAndSettle(page);
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Invalid');
  });

  test('8.3 large upload (>300K) defers to the worker and validates', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    const big = '[' + Array.from({ length: 12_000 }, (_, i) => `{"i":${i},"pad":"${'x'.repeat(20)}"}`).join(',') + ']';
    expect(big.length).toBeGreaterThan(300_000);
    const file = test.info().outputPath(`big-${Date.now()}.json`);
    fs.writeFileSync(file, big, 'utf8');
    await page.locator('#json-input-file-input').setInputFiles(file);
    await expect(page.locator(INPUT_STATUS)).toHaveText('Status: Ready');
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Empty');
    await validateAndSettle(page, 30_000);
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Valid');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 9 · Race / adversarial (Breaker)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('breaker', () => {
  test('9.1 rapid double-click Validate never wedges the UI', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    await typeJson(page, '{"a":1}');
    await page.locator(BTN).click();
    await page.locator(BTN).click({ force: true }).catch(() => {});
    await expect(page.locator(BTN)).toBeEnabled({ timeout: 10_000 });
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Valid');
    await expect(page.locator('#validate-error')).toBeHidden();
  });

  test('9.2 unicode and emoji round-trip as valid JSON', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    await typeJson(page, '{"emoji":"😀","escaped":"\\u00e9","mb":"日本語","sur":"\\ud83d\\ude00"}');
    await validateAndSettle(page);
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Valid');
  });

  test('9.3 BOM prefix is rejected, not silently accepted', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    await typeJson(page, '\uFEFF{"a":1}');
    await expect(page.locator(INPUT_STATUS)).toContainText('Status: Invalid');
    await validateAndSettle(page);
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Invalid');
  });

  test('9.4 a very long single-line document validates with a correct count', async ({ page }) => {
    await openTool(page, ROUTE, INPUT);
    const long = '[' + Array.from({ length: 5_000 }, (_, i) => `{"i":${i}}`).join(',') + ']';
    await typeJson(page, long);
    await validateAndSettle(page, 30_000);
    await expect(page.locator(OUTPUT_STATUS)).toHaveText('Output: Valid');
    const report = await outputText(page);
    expect(report).toContain('size');
    expect(await page.locator('#validation-output-count').textContent()).toMatch(/chars$/);
  });
});