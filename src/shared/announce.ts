/**
 * Announce — Screen reader announcement utility
 *
 * Updates an aria-live region to push dynamic announcements
 * to assistive technology.
 */

let announceRegion: HTMLElement | null = null;

/**
 * Initialise the announce system with a target aria-live element.
 * Call once during page setup.
 *
 * @param elementId — ID of the aria-live element
 */
export function initAnnounce(elementId: string = "status-announce"): void {
  announceRegion = document.getElementById(elementId);
}

/**
 * Announce a message to screen readers.
 *
 * @param msg — The message to announce
 */
export function announce(msg: string): void {
  if (announceRegion) {
    announceRegion.textContent = msg;
  }
}
