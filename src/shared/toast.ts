/**
 * Toast — Lightweight toast notification utility
 *
 * Displays brief messages that auto-dismiss.
 * Falls back to console if no toast container exists.
 */

let toastContainer: HTMLElement | null = null;

/**
 * Initialise the toast system with a container element.
 * Call once during page setup.
 *
 * @param containerId — ID of the toast container element
 */
export function initToast(containerId: string = "toast-container"): void {
  toastContainer = document.getElementById(containerId);
}

/**
 * Show a brief toast message.
 *
 * @param message — The message text
 * @param duration — Auto-dismiss timeout in ms (default: 3000)
 */
export function showToast(message: string, duration: number = 3000): void {
  if (!toastContainer) {
    // Fallback: just log
    console.info(`[Toast] ${message}`);
    return;
  }

  const toast = document.createElement("div");
  toast.className = "toast-message fade-in";
  toast.textContent = message;
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");

  toastContainer.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.add("toast-exit");
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 200);
    }
  }, duration);
}
