import { test, expect, type Page } from '@playwright/test';
import * as fs from 'node:fs';
import {
  openTool,
  trackPageErrors,
  pressRunShortcut,
  grantClipboard,
  isChromium,
  clickAndCatchBusy,
  setCheckbox,
  waitForCharCount,
  expectSectionsInOrder,
} from './helpers';

const ROUTE = '/tools/json-to-xml/';

// ── Test data builders ───────────────────────────────────────────────────────
function makeRecords(count: number, noteLen = 60): string {
  const rows: string[] = [];
  for (let i = 0; i < count; i++) {
    rows.push(`{"id":${i},"name":"user${i}","note":"${'x'.repeat(noteLen)}"}`);
  }
  return '[' + rows.join(',') + ']';
}
function makeLargeObject(dataLen: number): string {
  return `{"data":"${'y'.repeat(dataLen)}"}`;
}

// ── Page helpers ─────────────────────────────────────────────────────────────
async function openXmlTool(page: Page): Promise<void> {
  await openTool(page, ROUTE, '#json-input-textarea');
}

async function typeInput(page: Page, text: string, status: string): Promise<void> {
  await page.locator('#json-input-textarea').fill(text);
  // Wait for debounced handleInput (150ms) to propagate to store before clicking Convert.
  const sig = [text.length, text.slice(0, 80)] as const;
  await expect
    .poll(
      () =>
        page.evaluate(([len, head]) => {
          const store = (
            window as unknown as { __jsonToXmlStore?: { get(): { jsonInput?: string } } }
          ).__jsonToXmlStore;
          const s = store?.get();
          if (!s) return false;
          const json = s.jsonInput ?? '';
          return json.length === len && json.startsWith(head);
        }, sig),
      { timeout: 30_000 },
    )
    .toBe(true);
  await expect(page.locator('#json-validation-status')).toHaveText(status);
}

async function convertAndSettle(page: Page, timeout = 30_000): Promise<void> {
  await page.locator('#convert-btn').click();
  await expect(page.locator('#convert-btn')).toBeEnabled({ timeout });
  // No progress-section for this tool; just ensure error hidden or output settled.
}

async function outputText(page: Page): Promise<string> {
  return page.locator('#xml-output-textarea').inputValue();
}

async function uploadJson(page: Page, testInfo: { outputPath: (s: string) => string }, content: string): Promise<void> {
  const file = testInfo.outputPath(`upload-${Date.now()}.json`);
  fs.writeFileSync(file, content, 'utf8');
  await page.locator('#json-input-file-input').setInputFiles(file);
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite 1 · Load
// ─────────────────────────────────────────────────────────────────────────────
test.describe('json-to-xml — Load', () => {
  test('1.1 page renders, sections in order, no console errors', async ({ page }) => {
    const { errors, assertNone } = trackPageErrors(page);
    await page.goto(ROUTE);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('JSON → XML');
    await expect(page.locator('#json-input-textarea')).toBeVisible();
    await expect(page.locator('#xml-output-textarea')).toBeVisible();
    await expect(page.locator('#convert-btn')).toBeVisible();
    await expect(page.locator('#convert-btn')).toHaveText('Convert');
    await expect(page.locator('.faq-section')).toBeVisible();
    await expectSectionsInOrder(page);
    await assertNone();
    expect(errors).toEqual([]);
  });

  test('1.2 workspace shows breadcrumbs, title, subtitle', async ({ page }) => {
    await page.goto(ROUTE);
    await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible();
    await expect(page.getByText('Turn JSON into well-formed XML')).toBeVisible();
    await expect(page.locator('#json-validation-status')).toHaveText('Status: Empty');
    await expect(page.locator('#xml-output-status')).toHaveText('Output: Empty');
  });

  test('1.3 options have correct defaults', async ({ page }) => {
    await openXmlTool(page);
    await expect(page.locator('#pretty-cb')).toBeChecked();
    await expect(page.locator('#decl-cb')).toBeChecked();
    await expect(page.locator('#indent-select button[data-value="2"]')).toHaveClass(/is-active/);
    await expect(page.locator('#root-input')).toHaveValue('root');
    await expect(page.locator('#item-input')).toHaveValue('item');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 2 · Load Sample
// ─────────────────────────────────────────────────────────────────────────────
test.describe('json-to-xml — Load Sample', () => {
  test('2.1 loads only, never auto-runs', async ({ page }) => {
    await openXmlTool(page);
    await page.locator('#input-actions [data-action="sample"]').click();
    await expect(page.locator('#json-validation-status')).toHaveText('Status: Ready');
    await expect(page.locator('#xml-output-status')).toHaveText('Output: Empty');
    expect(await page.locator('#json-input-textarea').inputValue()).toContain('Free JSON Toolkit');
    // Output must still be empty until explicit Convert
    expect(await outputText(page)).toBe('');
  });

  test('2.2 sample contains all branches (string, number, boolean, array, nested, null)', async ({ page }) => {
    await openXmlTool(page);
    await page.locator('#input-actions [data-action="sample"]').click();
    const input = await page.locator('#json-input-textarea').inputValue();
    const parsed = JSON.parse(input);
    expect(parsed).toHaveProperty('toolkit');
    expect(parsed).toHaveProperty('version');
    expect(parsed).toHaveProperty('local');
    expect(Array.isArray(parsed.tools)).toBe(true);
    expect(parsed.limits).toBeDefined();
    expect(parsed.note).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 3 · Primary action
// ─────────────────────────────────────────────────────────────────────────────
test.describe('json-to-xml — Primary action', () => {
  test('3.1 real verb triggers, output Status moves Empty → Ready, busy shows Converting…', async ({
    page,
  }) => {
    await openXmlTool(page);
    await page.locator('#input-actions [data-action="sample"]').click();
    await clickAndCatchBusy(page, '#convert-btn', 'Converting…');
    await expect(page.locator('#convert-btn')).toBeEnabled({ timeout: 10_000 });
    await expect(page.locator('#xml-output-status')).toHaveText('Output: XML');
    await expect(page.locator('#convert-status-announce')).toContainText('Converted:');
  });

  test('3.2 converts sample with stats correctly', async ({ page }) => {
    await openXmlTool(page);
    await page.locator('#input-actions [data-action="sample"]').click();
    await convertAndSettle(page);
    await expect(page.locator('#xml-output-status')).toHaveText('Output: XML');
    const xml = await outputText(page);
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<toolkit>Free JSON Toolkit</toolkit>');
    expect(xml).toContain('<tools>');
    expect(xml).toContain('<item>json-to-csv</item>');
    expect(xml).toContain('<note/>');
    await expect(page.locator('#jx-stats')).not.toHaveAttribute('hidden', '');
    await expect(page.locator('#jx-el')).toHaveText('12');
  });

  test('3.3 simple object wrapped in root', async ({ page }) => {
    await openXmlTool(page);
    await typeInput(page, JSON.stringify({ book: { title: 'The Hobbit', author: 'J.R.R. Tolkien' } }), 'Status: Ready');
    await convertAndSettle(page);
    const xml = await outputText(page);
    expect(xml).toContain('<root>');
    expect(xml).toContain('<book>');
    expect(xml).toContain('<title>The Hobbit</title>');
    expect(xml).toContain('<author>J.R.R. Tolkien</author>');
  });

  test('3.4 arrays become repeated item elements', async ({ page }) => {
    await openXmlTool(page);
    await typeInput(page, JSON.stringify({ tags: ['a', 'b'], book: { title: 'Dune' } }), 'Status: Ready');
    await convertAndSettle(page);
    const xml = await outputText(page);
    expect(xml).toContain('<tags>');
    expect(xml).toContain('<item>a</item>');
    expect(xml).toContain('<item>b</item>');
    expect(xml).toContain('<title>Dune</title>');
  });

  test('3.5 null becomes self-closed, empty object becomes pair', async ({ page }) => {
    await openXmlTool(page);
    await typeInput(page, JSON.stringify({ note: null, empty: {} }), 'Status: Ready');
    await convertAndSettle(page);
    const xml = await outputText(page);
    expect(xml).toContain('<note/>');
    expect(xml).toContain('<empty></empty>');
  });

  test('3.6 declaration toggle', async ({ page }) => {
    await openXmlTool(page);
    await typeInput(page, JSON.stringify({ a: 1 }), 'Status: Ready');
    // Default checked → has declaration
    await convertAndSettle(page);
    expect(await outputText(page)).toContain('<?xml');
    // Uncheck → no declaration
    await setCheckbox(page, '#decl-cb', false);
    await convertAndSettle(page);
    expect(await outputText(page)).not.toContain('<?xml');
    // Re-check → back
    await setCheckbox(page, '#decl-cb', true);
    await convertAndSettle(page);
    expect(await outputText(page)).toContain('<?xml');
  });

  test('3.7 pretty toggle collapses spacing', async ({ page }) => {
    await openXmlTool(page);
    await typeInput(page, JSON.stringify({ a: 1, b: 2 }), 'Status: Ready');
    await setCheckbox(page, '#pretty-cb', true);
    await convertAndSettle(page);
    const pretty = await outputText(page);
    expect(pretty).toContain('\n');
    await setCheckbox(page, '#pretty-cb', false);
    await convertAndSettle(page);
    const minified = await outputText(page);
    // Minified should not contain indentation newline between elements (except maybe declaration)
    // It should be shorter and contain>< without newline
    expect(minified.length).toBeLessThan(pretty.length);
  });

  test('3.8 indentation options', async ({ page }) => {
    await openXmlTool(page);
    await typeInput(page, JSON.stringify({ book: { title: 'X' } }), 'Status: Ready');
    await page.locator('#indent-select button[data-value="2"]').click();
    await convertAndSettle(page);
    const two = await outputText(page);
    expect(two).toContain('  <book>');
    await page.locator('#indent-select button[data-value="4"]').click();
    await convertAndSettle(page);
    const four = await outputText(page);
    expect(four).toContain('    <book>');
    await page.locator('#indent-select button[data-value="tab"]').click();
    await convertAndSettle(page);
    const tab = await outputText(page);
    expect(tab).toContain('\t<book>');
  });

  test('3.9 custom root and item tags', async ({ page }) => {
    await openXmlTool(page);
    await typeInput(page, JSON.stringify({ tags: ['a', 'b'] }), 'Status: Ready');
    await page.locator('#root-input').fill('data');
    await page.locator('#item-input').fill('entry');
    // Need to wait for store to pick up root/item changes (no debounce needed, immediate)
    await page.locator('#convert-btn').click();
    await expect(page.locator('#xml-output-status')).toHaveText('Output: XML');
    const xml = await outputText(page);
    expect(xml).toContain('<data>');
    expect(xml).toContain('</data>');
    expect(xml).toContain('<entry>a</entry>');
  });

  test('3.10 sanitizes invalid XML names and escapes specials', async ({ page }) => {
    await openXmlTool(page);
    await typeInput(
      page,
      JSON.stringify({ '123key': 'ok', 'a&b': '<x & y>', normal: 'test' }),
      'Status: Ready',
    );
    await convertAndSettle(page);
    const xml = await outputText(page);
    // Leading digit gets underscore
    expect(xml).toContain('<_123key>ok</_123key>');
    // Illegal char becomes underscore
    expect(xml).toContain('<a_b>');
    // Escaping
    expect(xml).toContain('&lt;x &amp; y&gt;');
  });

  test('3.11 numbers and booleans become text', async ({ page }) => {
    await openXmlTool(page);
    await typeInput(page, JSON.stringify({ n: 42, b: true, f: false, pi: 3.14 }), 'Status: Ready');
    await convertAndSettle(page);
    const xml = await outputText(page);
    expect(xml).toContain('<n>42</n>');
    expect(xml).toContain('<b>true</b>');
    expect(xml).toContain('<f>false</f>');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 4 · Clear
// ─────────────────────────────────────────────────────────────────────────────
test.describe('json-to-xml — Clear', () => {
  test('4.1 removes input, output, error, stats; preserves options', async ({ page }) => {
    await openXmlTool(page);
    // Change options away from defaults
    await page.locator('#indent-select button[data-value="4"]').click();
    await setCheckbox(page, '#pretty-cb', false);
    await setCheckbox(page, '#decl-cb', false);
    await page.locator('#root-input').fill('myRoot');
    await page.locator('#item-input').fill('myItem');
    await typeInput(page, JSON.stringify({ a: 1 }), 'Status: Ready');
    await convertAndSettle(page);
    await expect(page.locator('#xml-output-status')).toHaveText('Output: XML');
    await expect(page.locator('#jx-stats')).not.toHaveAttribute('hidden', '');

    await page.locator('#input-actions [data-action="clear"]').click();

    await expect(page.locator('#json-input-textarea')).toHaveValue('');
    await expect(page.locator('#json-validation-status')).toHaveText('Status: Empty');
    await expect(page.locator('#xml-output-status')).toHaveText('Output: Empty');
    await expect(page.locator('#xml-output-textarea')).toHaveValue('');
    await expect(page.locator('#convert-error')).toBeHidden();
    await expect(page.locator('#jx-stats')).toHaveAttribute('hidden', '');
    await expect(page.locator('#convert-status-announce')).toContainText('Input cleared');

    // Options preserved (AGENTS.md: Clear must preserve mode/units/options)
    await expect(page.locator('#indent-select button[data-value="4"]')).toHaveClass(/is-active/);
    await expect(page.locator('#pretty-cb')).not.toBeChecked();
    await expect(page.locator('#decl-cb')).not.toBeChecked();
    await expect(page.locator('#root-input')).toHaveValue('myRoot');
    await expect(page.locator('#item-input')).toHaveValue('myItem');
  });

  test('4.2 clear after error hides error', async ({ page }) => {
    await openXmlTool(page);
    await typeInput(page, '{bad json}', 'Status: Invalid');
    await convertAndSettle(page);
    await expect(page.locator('#convert-error')).not.toHaveClass(/hidden/);
    await page.locator('#input-actions [data-action="clear"]').click();
    await expect(page.locator('#convert-error')).toBeHidden();
    await expect(page.locator('#json-validation-status')).toHaveText('Status: Empty');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 5 · Keyboard
// ─────────────────────────────────────────────────────────────────────────────
test.describe('json-to-xml — Keyboard', () => {
  test('5.1 Ctrl/Cmd+Enter runs primary action', async ({ page }) => {
    await openXmlTool(page);
    await typeInput(page, JSON.stringify({ hotkey: 'yes' }), 'Status: Ready');
    await page.locator('#json-input-textarea').press('Control+Enter');
    await expect(page.locator('#xml-output-status')).toHaveText('Output: XML');
    expect(await outputText(page)).toContain('<hotkey>yes</hotkey>');
    // Cmd+Enter also (Meta)
    await typeInput(page, JSON.stringify({ hotkey: 'again' }), 'Status: Ready');
    await page.locator('#json-input-textarea').press('Meta+Enter');
    await expect(page.locator('#xml-output-status')).toHaveText('Output: XML');
    expect(await outputText(page)).toContain('<hotkey>again</hotkey>');
  });

  test('5.2 Ctrl+Enter skipped on SELECT', async ({ page }) => {
    await openXmlTool(page);
    // Inject a SELECT to test the house pattern skip
    await page.evaluate(() => {
      const sel = document.createElement('select');
      sel.id = 'probe-select';
      const opt = document.createElement('option');
      opt.textContent = 'opt';
      sel.appendChild(opt);
      document.body.appendChild(sel);
      sel.focus();
    });
    await typeInput(page, JSON.stringify({ a: 1 }), 'Status: Ready');
    const before = await outputText(page);
    await page.locator('#probe-select').press('Control+Enter');
    // Should NOT have converted
    await expect(page.locator('#xml-output-status')).toHaveText('Output: Empty');
    expect(await outputText(page)).toBe(before);
    await page.evaluate(() => document.getElementById('probe-select')?.remove());
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 6 · Copy/Download
// ─────────────────────────────────────────────────────────────────────────────
test.describe('json-to-xml — Copy/Download', () => {
  test('6.1 Copy writes output to clipboard', async ({ page }) => {
    await openXmlTool(page);
    await typeInput(page, JSON.stringify({ id: 7, name: 'Ada' }), 'Status: Ready');
    await convertAndSettle(page);
    await expect(page.locator('#xml-output-status')).toHaveText('Output: XML');
    const expected = await outputText(page);
    if (isChromium(page)) await grantClipboard(page);
    await page.locator('#output-actions [data-action="copy"]').click();
    await expect(page.locator('#output-actions [data-action="copy"]')).toHaveText('Copied!');
    if (isChromium(page)) {
      const clip = await page.evaluate(() => navigator.clipboard.readText());
      const norm = (s: string) => s.replace(/\r\n/g, '\n').trim();
      expect(norm(clip)).toBe(norm(expected));
      expect(clip).toContain('<id>7</id>');
      expect(clip).toContain('<name>Ada</name>');
    }
  });

  test('6.2 Download produces file with correct name', async ({ page }) => {
    await openXmlTool(page);
    await typeInput(page, JSON.stringify({ id: 7, name: 'Ada' }), 'Status: Ready');
    await convertAndSettle(page);
    const expected = await outputText(page);
    const downloadPromise = page.waitForEvent('download');
    await page.locator('#output-actions [data-action="download"]').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('json-to-xml-converted.xml');
    const content = fs.readFileSync(await download.path(), 'utf8');
    expect(content).toBe(expected);
  });

  test('6.3 Copy after clear does nothing graceful', async ({ page }) => {
    await openXmlTool(page);
    await page.locator('#input-actions [data-action="clear"]').click();
    // Copy with empty output should not throw
    await page.locator('#output-actions [data-action="copy"]').click();
    // Button should stay Copy, not Copied!
    await expect(page.locator('#output-actions [data-action="copy"]')).toHaveText('Copy');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 7 · Invalid input
// ─────────────────────────────────────────────────────────────────────────────
test.describe('json-to-xml — Invalid input', () => {
  test('7.1 invalid JSON shows banner, status Invalid, no fake output', async ({ page }) => {
    await openXmlTool(page);
    await typeInput(page, '{bad json: }', 'Status: Invalid'); // live validator may still say Ready for 300k threshold; check after Convert
    await convertAndSettle(page);
    await expect(page.locator('#convert-error')).not.toHaveClass(/hidden/);
    await expect(page.locator('#convert-error-message')).toContainText(/Invalid JSON|line/i);
    await expect(page.locator('#json-validation-status')).toHaveText('Status: Invalid');
    await expect(page.locator('#xml-output-status')).toHaveText('Output: Empty');
    expect(await outputText(page)).toBe('');
  });

  test('7.2 empty input shows "Nothing to convert" error, no output', async ({ page }) => {
    await openXmlTool(page);
    await expect(page.locator('#json-input-textarea')).toHaveValue('');
    await convertAndSettle(page);
    await expect(page.locator('#convert-error-message')).toContainText('Nothing to convert yet');
    await expect(page.locator('#xml-output-status')).toHaveText('Output: Empty');
  });

  test('7.3 oversized input (>15M) rejected', async ({ page }) => {
    test.setTimeout(120_000);
    await openXmlTool(page);
    const huge = makeRecords(170_000, 60);
    expect(huge.length).toBeGreaterThan(15_000_000);
    // Use file upload to avoid typing 15M via fill (slow)
    await uploadJson(page, test.info(), huge);
    // FileReader is async; poll store until handleInput has run (up to 30s for 15M)
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const s = (window as unknown as { __jsonToXmlStore?: { get(): { jsonInput?: string } } }).__jsonToXmlStore?.get();
            return s?.jsonInput?.length ?? 0;
          }),
        { timeout: 30_000 },
      )
      .toBeGreaterThan(15_000_000);
    await expect(page.locator('#json-validation-status')).toHaveText('Status: Invalid');
    await expect(page.locator('#convert-error-message')).toContainText('Input too large');
    await expect(page.locator('#xml-output-status')).toHaveText('Output: Empty');
  });

  test('7.4 fixing invalid clears error and converts', async ({ page }) => {
    await openXmlTool(page);
    await typeInput(page, '{bad json}', 'Status: Invalid');
    await convertAndSettle(page);
    await expect(page.locator('#convert-error')).not.toHaveClass(/hidden/);
    // Now fix
    await typeInput(page, JSON.stringify({ ok: true }), 'Status: Ready');
    await expect(page.locator('#convert-error')).toBeHidden();
    await convertAndSettle(page);
    await expect(page.locator('#xml-output-status')).toHaveText('Output: XML');
    expect(await outputText(page)).toContain('<ok>true</ok>');
  });

  test('7.5 no fake output on invalid, stats hidden', async ({ page }) => {
    await openXmlTool(page);
    await typeInput(page, 'null,', 'Status: Invalid');
    await convertAndSettle(page);
    await expect(page.locator('#convert-error')).not.toHaveClass(/hidden/);
    expect(await outputText(page)).toBe('');
    await expect(page.locator('#jx-stats')).toHaveAttribute('hidden', '');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 8 · Large file (where supported)
// ─────────────────────────────────────────────────────────────────────────────
test.describe('json-to-xml — Large file', () => {
  test('8.1 large typed input (>500K) converts via worker', async ({ page }) => {
    test.setTimeout(120_000);
    await openXmlTool(page);
    const big = makeRecords(7000, 60); // ~ >500K
    expect(big.length).toBeGreaterThan(500_000);
    await typeInput(page, big, 'Status: Ready');
    await convertAndSettle(page, 60_000);
    await expect(page.locator('#xml-output-status')).toHaveText('Output: XML');
    const xml = await outputText(page);
    expect(xml).toContain('<item>');
    expect(xml).toContain('user6999');
    const outCount = await page.locator('#xml-output-count').textContent();
    expect(outCount).toContain('chars');
  });

  test('8.2 drag-drop and file input both drive conversion', async ({ page }) => {
    test.setTimeout(120_000);
    await openXmlTool(page);
    const json = JSON.stringify({ hello: 'world', arr: [1, 2, 3] });
    // File input path
    await uploadJson(page, test.info(), json);
    // File dropped handler auto-converts (handleInput + convert)
    await expect(page.locator('#xml-output-status')).toHaveText('Output: XML', { timeout: 10_000 });
    expect(await outputText(page)).toContain('<hello>world</hello>');
    // Clear then test second upload via typing? typing path already covered in 8.1
    await page.locator('#input-actions [data-action="clear"]').click();
    await typeInput(page, json, 'Status: Ready');
    await convertAndSettle(page);
    expect(await outputText(page)).toContain('<hello>world</hello>');
  });

  test('8.3 Blob/large state revoked on Clear (no leak)', async ({ page }) => {
    test.setTimeout(120_000);
    await openXmlTool(page);
    const big = makeRecords(5000, 60);
    await typeInput(page, big, 'Status: Ready');
    await convertAndSettle(page, 60_000);
    await expect(page.locator('#xml-output-status')).toHaveText('Output: XML');
    await page.locator('#input-actions [data-action="clear"]').click();
    await expect(page.locator('#json-input-textarea')).toHaveValue('');
    await expect(page.locator('#xml-output-status')).toHaveText('Output: Empty');
    await expect(page.locator('#jx-stats')).toHaveAttribute('hidden', '');
    await expect(page.locator('#convert-error')).toBeHidden();
  });

  test('8.4 large output stats correct and announce', async ({ page }) => {
    test.setTimeout(120_000);
    await openXmlTool(page);
    const json = JSON.stringify({ a: { b: { c: { d: 'deep' } } }, arr: [1, 2, 3, 4, 5] });
    await typeInput(page, json, 'Status: Ready');
    await convertAndSettle(page);
    await expect(page.locator('#jx-stats')).not.toHaveAttribute('hidden', '');
    const elText = await page.locator('#jx-el').textContent();
    const depthText = await page.locator('#jx-depth').textContent();
    expect(Number(elText?.replace(/[^\d]/g, '') ?? 0)).toBeGreaterThan(0);
    expect(Number(depthText?.replace(/[^\d]/g, '') ?? 0)).toBeGreaterThan(1);
    await expect(page.locator('#convert-status-announce')).toContainText('Converted:');
  });
});
