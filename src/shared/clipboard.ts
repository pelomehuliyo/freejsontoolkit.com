/**
 * Clipboard — Browser clipboard utilities
 *
 * Provides a clean wrapper around the Clipboard API with fallback handling.
 */

/**
 * Copy text to the system clipboard.
 *
 * @param text — The string to copy
 * @returns true if copy succeeded, false otherwise
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    if (!text) return false;

    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}

