import { test, expect, type Page } from '@playwright/test';
import * as fs from 'node:fs';

const ROUTE = '/tools/json-to-csv/';

// ── Test data builders ───────────────────────────────────────────────────────

/** Array of flat records. Roughly `count * (noteLen + 60)` chars. */
function makeRecords(count: number, noteLen = 60): string {
  const rows: string[] = [];
  for (let i = 0; i < count; i++) {
    rows.push(`{"id":${i},"name":"user${i}","note":"${'x'.repeat(noteLen)}"}`);
  }
  return '[' + rows.join(',') + ']';
}

/** A single object whose `data` field is `len` chars (used to hit worker path). */
function makeSingleObject(dataLen: number): string {
  return `{"data":"${'y'.repeat(dataLen)}"}`;
}

// ── Page helpers ─────────────────────────────────────────────────────────────

async function openTool(page: Page): Promise<void> {
  await page.goto(ROUTE);
  await expect(page.locator('#json-input-textarea')).toBeVisible();
}

async function typeInput(page: Page, text: string, status: string): Promise<void> {
  await page.locator('#json-input-textarea').fill(text);
  // The page debounces handleInput (150ms), and "Status: Ready" may already be
  // on screen from a previous input. Wait on the store itself so the value has
  // actually been processed before we click Convert. Large files live in
  // largeJsonContent; normal/oversized ones in jsonInput. Compare length +
  // head slice rather than the full string: serializing a multi-MB argument
  // across the protocol boundary is slow enough to blow the poll timeout.
  const signature = [text.length, text.slice(0, 80)] as [number, string];
  await expect
    .poll(
      () =>
        page.evaluate(([len, head]) => {
          const store = (
            window as unknown as {
              __jsonToCsvStore?: { get(): { jsonInput?: string; largeJsonContent?: string | null } };
            }
          ).__jsonToCsvStore;
          const s = store?.get();
          if (!s) return false;
          const json = s.jsonInput ?? '';
          const large = s.largeJsonContent ?? '';
          return (
            (json.length === len && json.startsWith(head)) ||
            (large.length === len && large.startsWith(head))
          );
        }, signature),
      // Generous timeout: a multi-MB fill blocks the main thread for several
      // seconds, and parallel heavy tests can starve Firefox's main thread
      // even longer, so the first evaluate can be slow to be serviced.
      { timeout: 60_000 },
    )
    .toBe(true);
  await expect(page.locator('#json-validation-status')).toHaveText(status);
}

/**
 * Click Convert and wait until the conversion fully settles (button enabled,
 * progress hidden). Does NOT assert the outcome — callers assert that next.
 */
async function convertAndSettle(page: Page, timeout = 30_000): Promise<void> {
  await page.locator('#convert-btn').click();
  await expect(page.locator('#convert-btn')).toBeEnabled({ timeout });
  await expect(page.locator('#progress-section')).toBeHidden({ timeout });
}

async function outputText(page: Page): Promise<string> {
  return page.locator('#csv-output-textarea').inputValue();
}

/**
 * The output textarea normalizes \r\n to \n (HTML textarea value semantics),
 * so compare CSV content against \n-separated expectations.
 */
async function outputCsv(page: Page): Promise<string> {
  return (await outputText(page)).replace(/\r\n/g, '\n');
}

/** Write `content` to a temp file and upload it through the tool's file input. */
async function uploadJson(page: Page, testInfo: { outputPath: (s: string) => string }, content: string): Promise<void> {
  const file = testInfo.outputPath(`upload-${Date.now()}.json`);
  fs.writeFileSync(file, content, 'utf8');
  await page.locator('#json-input-file-input').setInputFiles(file);
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite 1 · Core correctness
// ─────────────────────────────────────────────────────────────────────────────

test.describe('core correctness', () => {
  test('1.1 converts sample with nested objects, flatten on, CRLF line endings', async ({ page }) => {
    await openTool(page);
    await page.locator('#input-actions [data-action="sample"]').click();
    await expect(page.locator('#json-validation-status')).toHaveText('Status: Ready');
    await convertAndSettle(page);

    await expect(page.locator('#csv-status')).toHaveText('Output: Ready');
    const csv = await outputCsv(page);
    const lines = csv.split('\n');
    expect(lines[0]).toBe(
      'id,name,username,email,address.street,address.suite,address.city',
    );
    expect(lines[1]).toBe('1,Leanne Graham,Bret,Sincere@april.biz,Kulas Light,Apt. 556,Gwenborough');
    expect(lines[2]).toBe('2,Ervin Howell,Antonette,Shanna@melissa.tv,Victor Plains,Suite 879,Wisokyburgh');
    expect(csv).not.toContain('\n\n');
  });

  test('1.2 flatten OFF stringifies nested objects and arrays as JSON', async ({ page }) => {
    await openTool(page);
    await page.locator('label.opt-check').filter({ hasText: 'Flatten nested objects' }).click();
    await typeInput(page, JSON.stringify([{ user: { name: 'John' }, tags: ['a', 'b'] }]), 'Status: Ready');
    await convertAndSettle(page);

    expect(await outputCsv(page)).toBe('user,tags\n"{""name"":""John""}","[""a"",""b""]"');
  });

  test('1.3 headers OFF emits no header row', async ({ page }) => {
    await openTool(page);
    await page.locator('label.opt-check').filter({ hasText: 'Include header row' }).click();
    await typeInput(page, JSON.stringify([{ x: 10, y: 20 }]), 'Status: Ready');
    await convertAndSettle(page);

    expect(await outputCsv(page)).toBe('10,20');
  });

  test('1.4 semicolon and tab delimiters re-escape cells', async ({ page }) => {
    await openTool(page);
    await page.locator('#delimiter-select button').filter({ hasText: 'Semicolon' }).click();
    await typeInput(page, JSON.stringify([{ a: 1, b: 'x;y' }]), 'Status: Ready');
    await convertAndSettle(page);
    expect(await outputCsv(page)).toBe('a;b\n1;"x;y"');

    await page.locator('#delimiter-select button').filter({ hasText: 'Tab' }).click();
    await page.locator('#convert-btn').click();
    await expect(page.locator('#csv-status')).toHaveText('Output: Ready');
    expect(await outputCsv(page)).toBe('a\tb\n1\tx;y');
  });

  test('1.5 RFC 4180 escaping: comma, quote, newline, CRLF cells', async ({ page }) => {
    await openTool(page);
    const input = JSON.stringify([
      { col: 'a,b', q: 'say "hi"', nl: 'line1\nline2', crlf: 'x\r\ny' },
    ]);
    await typeInput(page, input, 'Status: Ready');
    await convertAndSettle(page);

    expect(await outputCsv(page)).toBe(
      'col,q,nl,crlf\n"a,b","say ""hi""","line1\nline2","x\ny"',
    );
  });

  test('1.6 single object (non-array) wraps to one row', async ({ page }) => {
    await openTool(page);
    await typeInput(page, JSON.stringify({ id: 1, name: 'Test' }), 'Status: Ready');
    await convertAndSettle(page);
    expect(await outputCsv(page)).toBe('id,name\n1,Test');
  });

  test('1.7 empty array shows an accurate notice, no crash', async ({ page }) => {
    await openTool(page);
    await typeInput(page, '[]', 'Status: Ready');
    await convertAndSettle(page);

    await expect(page.locator('#csv-status')).toHaveText('Output: Ready');
    await expect(page.locator('#csv-notice')).toContainText('The JSON array was empty');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 2 · Data-integrity attacks
// ─────────────────────────────────────────────────────────────────────────────

test.describe('data-integrity attacks', () => {
  test('2.1 array of primitives becomes a single-column CSV', async ({ page }) => {
    await openTool(page);
    await typeInput(page, '[1,2,3]', 'Status: Ready');
    await convertAndSettle(page);

    await expect(page.locator('#csv-status')).toHaveText('Output: Ready');
    expect(await outputCsv(page)).toBe('1\n2\n3');
  });

  test('2.2 empty objects error clearly instead of lying "array was empty"', async ({ page }) => {
    await openTool(page);
    await typeInput(page, '[{}]', 'Status: Ready');
    await convertAndSettle(page);

    await expect(page.locator('#conversion-error')).toBeVisible();
    await expect(page.locator('#conversion-error-message')).toContainText(
      'Could not derive CSV columns',
    );
  });

  test('2.3 top-level primitives produce the promised single cell', async ({ page }) => {
    await openTool(page);

    await typeInput(page, '5', 'Status: Ready');
    await convertAndSettle(page);
    expect(await outputText(page)).toBe('5');

    await typeInput(page, '"hello"', 'Status: Ready');
    await convertAndSettle(page);
    expect(await outputText(page)).toBe('hello');

    await typeInput(page, 'true', 'Status: Ready');
    await convertAndSettle(page);
    expect(await outputText(page)).toBe('true');
  });

  test('2.4 flatten key collision errors instead of silently losing data', async ({ page }) => {
    await openTool(page);
    await typeInput(page, '[{"a.b":1,"a":{"b":2}}]', 'Status: Ready');
    await convertAndSettle(page);

    await expect(page.locator('#conversion-error')).toBeVisible();
    await expect(page.locator('#conversion-error-message')).toContainText('a.b');
    // And the reverse key order must not silently change the result either.
    await typeInput(page, '[{"a":{"b":2},"a.b":1}]', 'Status: Ready');
    await convertAndSettle(page);
    await expect(page.locator('#conversion-error')).toBeVisible();
  });

  test('2.5 headers containing delimiter and quotes are quoted', async ({ page }) => {
    await openTool(page);
    await typeInput(page, JSON.stringify([{ 'a,b': 'v1', 'we"ird': 'v2' }]), 'Status: Ready');
    await convertAndSettle(page);
    expect(await outputCsv(page)).toBe('"a,b","we""ird"\nv1,v2');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 3 · Size-dependent behaviour (sync vs worker)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('sync vs worker consistency', () => {
  test('3.1 small single object (sync path) converts', async ({ page }) => {
    await openTool(page);
    await typeInput(page, makeSingleObject(50_000), 'Status: Ready');
    await convertAndSettle(page);
    await expect(page.locator('#csv-status')).toHaveText('Output: Ready');
    expect(await outputText(page)).toContain('data');
  });

  test('3.2 LARGE single object (worker path) converts — not "must be an array"', async ({ page }) => {
    test.setTimeout(180_000);
    await openTool(page);
    const big = makeSingleObject(430_000);
    await typeInput(page, big, 'Status: Ready');
    await convertAndSettle(page, 60_000);
    // Worker path must accept a bare object exactly like the sync path does.
    await expect(page.locator('#conversion-error')).toBeHidden();
    await expect(page.locator('#csv-status')).toContainText('Output:');
    expect(await outputText(page)).toContain('y'.repeat(100));
  });

  test('3.3 large array of objects (worker path, input >500K) converts', async ({ page }) => {
    test.setTimeout(180_000);
    await openTool(page);
    await typeInput(page, makeRecords(6000, 60), 'Status: Large file ready');
    await convertAndSettle(page, 60_000);
    await expect(page.locator('#csv-status')).toHaveText('Output: Ready');
    expect(await outputText(page)).toContain('user5999');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 4 · Error handling
// ─────────────────────────────────────────────────────────────────────────────

test.describe('error handling', () => {
  test('4.1 invalid JSON surfaces a syntax error on Convert', async ({ page }) => {
    await openTool(page);
    await typeInput(page, '{bad json}', 'Status: Ready');
    await convertAndSettle(page);
    await expect(page.locator('#conversion-error-message')).toContainText('Invalid JSON');
  });

  test('4.2 null input surfaces a clear error on Convert', async ({ page }) => {
    await openTool(page);
    await typeInput(page, 'null', 'Status: Ready');
    await convertAndSettle(page);
    await expect(page.locator('#conversion-error-message')).toContainText('null');
  });

  test('4.3 Convert with empty input shows the nudger', async ({ page }) => {
    await openTool(page);
    await convertAndSettle(page);
    await expect(page.locator('#conversion-error-message')).toContainText(
      'Nothing to convert yet',
    );
  });

  test('4.4 fixing invalid input clears the error and converts', async ({ page }) => {
    await openTool(page);
    await typeInput(page, '{bad json}', 'Status: Ready');
    await convertAndSettle(page);
    await expect(page.locator('#conversion-error')).toBeVisible();

    await typeInput(page, JSON.stringify([{ ok: true }]), 'Status: Ready');
    await expect(page.locator('#conversion-error')).toBeHidden();
    await convertAndSettle(page);
    await expect(page.locator('#csv-status')).toHaveText('Output: Ready');
    expect(await outputCsv(page)).toBe('ok\ntrue');
  });

  test('4.5 oversized input (15M+) is rejected with a size error', async ({ page }) => {
    test.setTimeout(180_000);
    await openTool(page);
    const tooBig = makeRecords(170_000, 60);
    expect(tooBig.length).toBeGreaterThan(15_000_000);
    await uploadJson(page, test.info(), tooBig);
    await expect(page.locator('#json-validation-status')).toHaveText('Status: Invalid');
    await expect(page.locator('#conversion-error-message')).toContainText('Input too large');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 5 · Large-file mode (>500K)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('large-file mode', () => {
  test('5.1 large typed input shows truncated preview and converts full file', async ({ page }) => {
    test.setTimeout(180_000);
    await openTool(page);
    const big = makeRecords(6000, 60);
    expect(big.length).toBeGreaterThan(500_000);
    await typeInput(page, big, 'Status: Large file ready');

    await page.locator('#convert-btn').click();
    await expect(page.locator('#csv-status')).toHaveText('Output: Ready', { timeout: 60_000 });

    // Blurred textarea now shows the truncated preview, not the raw paste.
    const shown = await page.locator('#json-input-textarea').inputValue();
    expect(shown).toContain('[Truncated:');
    expect(shown.length).toBeLessThan(big.length);
  });

  test('5.2 large PASTE event enters large-file mode (not typing)', async ({ page }) => {
    test.setTimeout(180_000);
    await openTool(page);
    const big = makeRecords(6000, 60);
    // Firefox ignores the clipboardData passed to `new ClipboardEvent(...)`, so
    // define it on the instance afterwards. This drives the page's real paste
    // handler (e.clipboardData.getData("text")) in both browsers.
    await page
      .locator('#json-input-textarea')
      .evaluate(
        (el, text) => {
          const ev = new ClipboardEvent('paste', { bubbles: true, cancelable: true });
          Object.defineProperty(ev, 'clipboardData', {
            value: { getData: () => text },
            configurable: true,
          });
          el.dispatchEvent(ev);
        },
        big,
      );
    await expect(page.locator('#json-validation-status')).toHaveText('Status: Large file ready');
    await convertAndSettle(page, 60_000);
    await expect(page.locator('#csv-status')).toHaveText('Output: Ready', { timeout: 60_000 });
  });

  test('5.3 large file UPLOAD enters large-file mode and converts', async ({ page }) => {
    test.setTimeout(180_000);
    await openTool(page);
    const big = makeRecords(6000, 60);
    await uploadJson(page, test.info(), big);
    await expect(page.locator('#json-validation-status')).toHaveText('Status: Large file ready');
    await convertAndSettle(page, 60_000);
    await expect(page.locator('#csv-status')).toHaveText('Output: Ready', { timeout: 60_000 });
  });

  test('5.4 large OUTPUT shows a preview with download note', async ({ page }) => {
    test.setTimeout(180_000);
    await openTool(page);
    const big = makeRecords(12_000, 80);
    await typeInput(page, big, 'Status: Large file ready');
    await page.locator('#convert-btn').click();

    await expect(page.locator('#csv-status')).toContainText('Output: Preview —', { timeout: 90_000 });
    await expect(page.locator('#csv-status')).toContainText('Download for full file');
    await expect(page.locator('#csv-char-count')).toContainText('chars preview');

    const shown = await outputText(page);
    expect(shown.length).toBeLessThan(500_000);
    expect(shown).toContain('id,name,note');
  });

  test('5.5 preview Download returns the FULL file with the right filename', async ({ page }) => {
    test.setTimeout(180_000);
    await openTool(page);
    const big = makeRecords(12_000, 80);
    await typeInput(page, big, 'Status: Large file ready');
    await page.locator('#convert-btn').click();
    await expect(page.locator('#csv-status')).toContainText('Output: Preview —', { timeout: 90_000 });

    const downloadPromise = page.waitForEvent('download');
    await page.locator('#output-actions [data-action="download"]').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('json-to-csv-data.csv');
    const full = fs.readFileSync(await download.path(), 'utf8');
    expect(full.length).toBeGreaterThan(500_000);
    expect(full).toContain('user11999');
  });

  test('5.6 preview Copy behavior documented (full content is copied)', async ({ page }) => {
    test.setTimeout(180_000);
    await openTool(page);
    const big = makeRecords(12_000, 80);
    await typeInput(page, big, 'Status: Large file ready');
    await page.locator('#convert-btn').click();
    await expect(page.locator('#csv-status')).toContainText('Output: Preview —', { timeout: 90_000 });

    // grantPermissions must come BEFORE the click: without it headless Chromium
    // rejects navigator.clipboard.writeText with NotAllowedError and the button
    // never flips to "Copied!". Firefox supports neither permission here (the
    // async clipboard still works in a user-gesture click handler), so skip.
    if (test.info().project.name === 'chromium') {
      await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    }
    await page.locator('#output-actions [data-action="copy"]').click();
    await expect(page.locator('#output-actions [data-action="copy"]')).toHaveText('Copied!');

    if (test.info().project.name === 'chromium') {
      const clip = await page.evaluate(() => navigator.clipboard.readText());
      expect(clip.length).toBeGreaterThan(500_000);
      expect(clip).toContain('user11999');
    }
  });

  test('5.7 changing an option after a preview marks the result stale', async ({ page }) => {
    test.setTimeout(180_000);
    await openTool(page);
    const big = makeRecords(12_000, 80);
    await typeInput(page, big, 'Status: Large file ready');
    await page.locator('#convert-btn').click();
    await expect(page.locator('#csv-status')).toContainText('Output: Preview —', { timeout: 90_000 });

    await page.locator('label.opt-check').filter({ hasText: 'Flatten nested objects' }).click();
    await expect(page.locator('#csv-notice')).toContainText('Options changed — convert again.');

    await page.locator('#convert-btn').click();
    await expect(page.locator('#csv-status')).toContainText('Output: Preview —', { timeout: 90_000 });
    await expect(page.locator('#csv-notice')).toBeHidden();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 6 · Worker & cancellation
// ─────────────────────────────────────────────────────────────────────────────

test.describe('worker & cancellation', () => {
  const big3mb = () => makeRecords(24_000, 60);

  test('6.1 cancel stops a running worker conversion cleanly', async ({ page }) => {
    test.setTimeout(180_000);
    await openTool(page);
    // ~4.2MB: big enough that the worker is still churning when Cancel lands,
    // but under the 5M window.confirm threshold.
    const big = makeRecords(45_000, 60);
    await typeInput(page, big, 'Status: Large file ready');

    await page.locator('#convert-btn').click();
    await expect(page.locator('#cancel-btn')).toBeVisible({ timeout: 10_000 });

    // force: the Cancel button's layout position shifts as the flex row
    // reflows, so a hit-test click can miss and land on Convert.
    await page.locator('#cancel-btn').click({ force: true });

    await expect(page.locator('#progress-section')).toBeHidden({ timeout: 15_000 });
    await expect(page.locator('#convert-btn')).toBeEnabled();
    await expect(page.locator('#cancel-btn')).toBeHidden();
    await expect(page.locator('#conversion-error')).toBeHidden();
    await expect(page.locator('#csv-status')).toHaveText('Output: Empty');
  });

  test('6.2 rapid double-click Convert never wedges the UI', async ({ page }) => {
    test.setTimeout(180_000);
    await openTool(page);
    await typeInput(page, big3mb(), 'Status: Large file ready');

    await page.locator('#convert-btn').click();
    await page.locator('#convert-btn').click({ force: true }).catch(() => {});

    await expect(page.locator('#convert-btn')).toBeEnabled({ timeout: 60_000 });
    await expect(page.locator('#progress-section')).toBeHidden({ timeout: 60_000 });
    await expect(page.locator('#conversion-error')).toBeHidden();
    await expect(page.locator('#csv-status')).toContainText('Output:', { timeout: 60_000 });
    const csv = await outputText(page);
    expect(csv.length).toBeGreaterThan(0);
  });

  test('6.3 typing new input mid-conversion discards the stale result', async ({ page }) => {
    test.setTimeout(180_000);
    await openTool(page);
    await typeInput(page, big3mb(), 'Status: Large file ready');

    await page.locator('#convert-btn').click();
    await typeInput(page, JSON.stringify([{ fresh: 1 }]), 'Status: Ready');

    await expect(page.locator('#convert-btn')).toBeEnabled({ timeout: 60_000 });
    await expect(page.locator('#progress-section')).toBeHidden({ timeout: 60_000 });
    // The old conversion must NOT clobber the new (empty) output.
    await expect(page.locator('#csv-status')).toHaveText('Output: Empty');

    await page.locator('#convert-btn').click();
    await expect(page.locator('#csv-status')).toHaveText('Output: Ready');
    expect(await outputCsv(page)).toBe('fresh\n1');
  });

  test('6.4 Ctrl/Cmd+Enter converts; ignored while converting', async ({ page }) => {
    test.setTimeout(180_000);
    await openTool(page);
    await typeInput(page, JSON.stringify([{ hotkey: 'yes' }]), 'Status: Ready');
    await page.locator('#json-input-textarea').press('Control+Enter');
    await expect(page.locator('#csv-status')).toHaveText('Output: Ready');
    expect(await outputCsv(page)).toBe('hotkey\nyes');

    await typeInput(page, big3mb(), 'Status: Large file ready');
    await page.locator('#json-input-textarea').press('Control+Enter');
    await page.locator('#json-input-textarea').press('Control+Enter');
    await expect(page.locator('#convert-btn')).toBeEnabled({ timeout: 60_000 });
    await expect(page.locator('#progress-section')).toBeHidden({ timeout: 60_000 });
    await expect(page.locator('#conversion-error')).toBeHidden();
  });

  test('6.5 progress UI is live during a worker conversion', async ({ page }) => {
    test.setTimeout(180_000);
    await openTool(page);
    await typeInput(page, big3mb(), 'Status: Large file ready');
    await page.locator('#convert-btn').click();

    await expect(page.locator('#progress-section')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('#progress-bar')).toHaveAttribute('aria-valuenow');

    await expect(page.locator('#convert-btn')).toBeEnabled({ timeout: 60_000 });
    await expect(page.locator('#progress-section')).toBeHidden();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 7 · >5M confirm dialog
// ─────────────────────────────────────────────────────────────────────────────

test.describe('large-file confirm dialog', () => {
  test('7.1 >5M upload prompts and accepts, then converts', async ({ page }) => {
    test.setTimeout(180_000);
    await openTool(page);
    const huge = makeRecords(56_000, 60);
    expect(huge.length).toBeGreaterThan(5_000_000);
    await uploadJson(page, test.info(), huge);
    await expect(page.locator('#json-validation-status')).toHaveText('Status: Large file ready');

    let dialogMessage = '';
    page.once('dialog', (d) => {
      dialogMessage = d.message();
      void d.accept();
    });
    await page.locator('#convert-btn').click();

    await expect(page.locator('#csv-status')).toContainText('Output:', { timeout: 120_000 });
    expect(dialogMessage).toContain('large');
    expect(dialogMessage).toContain('proceed');
  });

  test('7.2 >5M upload prompt dismissed aborts cleanly', async ({ page }) => {
    test.setTimeout(180_000);
    await openTool(page);
    const huge = makeRecords(56_000, 60);
    await uploadJson(page, test.info(), huge);
    await expect(page.locator('#json-validation-status')).toHaveText('Status: Large file ready');

    let dialogHandled = false;
    page.once('dialog', (d) => {
      dialogHandled = true;
      void d.dismiss();
    });
    await page.locator('#convert-btn').click();

    await expect(page.locator('#convert-btn')).toBeEnabled({ timeout: 15_000 });
    expect(dialogHandled).toBe(true);
    await expect(page.locator('#progress-section')).toBeHidden();
    await expect(page.locator('#csv-status')).toHaveText('Output: Empty');
    await expect(page.locator('#cancel-btn')).toBeHidden();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 8 · UI / state lifecycle
// ─────────────────────────────────────────────────────────────────────────────

test.describe('UI & state lifecycle', () => {
  test('8.1 Load Sample loads only, never auto-runs', async ({ page }) => {
    await openTool(page);
    await page.locator('#input-actions [data-action="sample"]').click();
    await expect(page.locator('#json-validation-status')).toHaveText('Status: Ready');
    await expect(page.locator('#csv-status')).toHaveText('Output: Empty');
    expect(await page.locator('#json-input-textarea').inputValue()).toContain('Leanne Graham');

    await convertAndSettle(page);
    await expect(page.locator('#csv-status')).toHaveText('Output: Ready');
    expect(await outputText(page)).toContain('Leanne Graham');
  });

  test('8.2 Clear resets everything but preserves options', async ({ page }) => {
    await openTool(page);
    await page.locator('#delimiter-select button').filter({ hasText: 'Semicolon' }).click();
    await page.locator('label.opt-check').filter({ hasText: 'Flatten nested objects' }).click();
    await page.locator('label.opt-check').filter({ hasText: 'Include header row' }).click();
    await typeInput(page, JSON.stringify([{ a: 1 }]), 'Status: Ready');
    await convertAndSettle(page);
    await expect(page.locator('#csv-status')).toHaveText('Output: Ready');

    await page.locator('#input-actions [data-action="clear"]').click();

    await expect(page.locator('#json-input-textarea')).toHaveValue('');
    await expect(page.locator('#json-validation-status')).toHaveText('Status: Empty');
    await expect(page.locator('#csv-status')).toHaveText('Output: Empty');
    await expect(page.locator('#conversion-error')).toBeHidden();

    // Options preserved.
    await expect(
      page.locator('#delimiter-select button').filter({ hasText: 'Semicolon' }),
    ).toHaveClass(/is-active/);
    await expect(page.locator('#flatten-checkbox')).not.toBeChecked();
    await expect(page.locator('#headers-checkbox')).not.toBeChecked();
  });

  test('8.3 Copy flips to Copied! and clipboard holds the CSV', async ({ page }) => {
    await openTool(page);
    await typeInput(page, JSON.stringify([{ id: 7, name: 'Ada' }]), 'Status: Ready');
    await convertAndSettle(page);

    if (test.info().project.name === 'chromium') {
      await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    }
    await page.locator('#output-actions [data-action="copy"]').click();
    await expect(page.locator('#output-actions [data-action="copy"]')).toHaveText('Copied!');

    if (test.info().project.name === 'chromium') {
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('id,name\r\n7,Ada');
    }
  });

  test('8.4 Download returns the exact file', async ({ page }) => {
    await openTool(page);
    await typeInput(page, JSON.stringify([{ id: 7, name: 'Ada' }]), 'Status: Ready');
    await convertAndSettle(page);

    const downloadPromise = page.waitForEvent('download');
    await page.locator('#output-actions [data-action="download"]').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('json-to-csv-data.csv');
    expect(fs.readFileSync(await download.path(), 'utf8')).toBe('id,name\r\n7,Ada');
  });

  test('8.5 successful conversion announces completion', async ({ page }) => {
    await openTool(page);
    await typeInput(page, JSON.stringify([{ a: 1 }]), 'Status: Ready');
    await convertAndSettle(page);
    await expect(page.locator('#status-announce')).toContainText('Conversion complete');
  });
});