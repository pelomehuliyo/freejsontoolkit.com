import { expect, type Page } from '@playwright/test';

/**
 * Shared spec helpers. The stable-DOM contract from AGENTS.md lives here so
 * per-tool specs reuse it instead of re-implementing the same waits.
 */

/** Navigate to a tool route and wait until its input is ready for interaction. */
export async function openTool(page: Page, route: string, readySelector: string): Promise<void> {
  await page.goto(route);
  await expect(page.locator(readySelector)).toBeVisible();
}

/**
 * Attach a collector for uncaught page errors and console.error calls.
 * Assert `errors` is empty at the end of a test to catch crashes, failed
 * workers, and stray console noise on every path.
 */
export function trackPageErrors(page: Page): { errors: string[]; assertNone: () => Promise<void> } {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
  });
  return {
    errors,
    assertNone: async () => {
      expect(errors, errors.join('\n')).toEqual([]);
    },
  };
}

/** Shortcut for the tool's primary-action keyboard handler. */
export async function pressRunShortcut(page: Page, on: string): Promise<void> {
  await page.locator(on).press('Control+Enter');
}

/**
 * Grant clipboard permissions (Chromium only). Firefox doesn't support
 * clipboard permissions and reads are skipped for it elsewhere in the specs.
 */
export async function grantClipboard(page: Page): Promise<void> {
  if (page.context().browser()?.browserType().name() === 'chromium') {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  }
}

export function isChromium(page: Page): boolean {
  return page.context().browser()?.browserType().name() === 'chromium';
}

/**
 * Click a button and prove its label swapped to the busy "verb…" state. Uses a
 * MutationObserver set up before the click so the transient busy label can't be
 * missed by polling (a worker-backed run can flip busy->idle in a few ms).
 */
export async function clickAndCatchBusy(
  page: Page,
  buttonSelector: string,
  busyLabel: string,
): Promise<void> {
  const sawBusy = page.evaluate(
    ([sel, busy]) =>
      new Promise<boolean>((resolve) => {
        const btn = document.querySelector(sel) as HTMLElement | null;
        if (!btn) return resolve(false);
        if (btn.textContent === busy) {
          resolve(true);
          return;
        }
        const obs = new MutationObserver(() => {
          if (btn.textContent === busy) {
            obs.disconnect();
            resolve(true);
          }
        });
        obs.observe(btn, { childList: true, characterData: true, subtree: true });
        setTimeout(() => {
          obs.disconnect();
          resolve(false);
        }, 5000);
      }),
    [buttonSelector, busyLabel] as const,
  );
  await page.locator(buttonSelector).click();
  expect(await sawBusy).toBe(true);
}

/**
 * Toggle a custom-styled checkbox (input positioned off-viewport inside a
 * `label.opt-check`) to a desired state by clicking the visible label, which
 * is how a real user interacts. No-op when the state already matches.
 */
export async function setCheckbox(page: Page, selector: string, checked: boolean): Promise<void> {
  const input = page.locator(selector);
  const label = page.locator(`label.opt-check:has(${selector})`);
  if ((await input.isChecked()) !== checked) {
    await label.click();
    await expect.poll(() => input.isChecked()).toBe(checked);
  }
}

/**
 * Wait until a char-count element reflects `length` chars. The page renders
 * `.toLocaleString()` with the BROWSER locale (e.g. 3,48,891 in en-IN), which
 * differs from Node's locale, so compare digits only.
 */
export async function waitForCharCount(
  page: Page,
  selector: string,
  length: number,
  timeout = 15_000,
): Promise<void> {
  await expect
    .poll(
      async () => {
        const t = await page.locator(selector).textContent();
        return Number((t ?? '').replace(/[^\d]/g, ''));
      },
      { timeout },
    )
    .toBe(length);
}

/**
 * Assert the required page sections render in the contract order:
 * how-it-works, ToolDocs, CompareLinks, RelatedTools, ToolNudge, FAQ.
 * Hidden elements (the nudge is hidden until triggered) report top:0 from
 * getBoundingClientRect, so they are detected via offsetParent and skipped
 * rather than injected into the order comparison.
 */
export async function expectSectionsInOrder(page: Page): Promise<void> {
  const order = await page.evaluate(() => {
    const selectors = [
      '.tool-content-section',
      '#tool-docs-root',
      '.cl-section',
      '.rel-section',
      '#nudge-root',
      '.faq-section',
    ];
    const seen: (string | number)[] = [];
    for (const sel of selectors) {
      const el = document.querySelector(sel) as HTMLElement | null;
      if (!el || el.offsetParent === null || el.getClientRects().length === 0) {
        seen.push(-1);
      } else {
        seen.push(Math.round(el.getBoundingClientRect().top + window.scrollY));
      }
    }
    return seen;
  });
  const visible = order.filter((v) => v !== -1);
  for (let i = 1; i < visible.length; i++) {
    expect(visible[i]).toBeGreaterThanOrEqual(visible[i - 1] as number);
  }
}