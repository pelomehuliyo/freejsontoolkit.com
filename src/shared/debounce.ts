/**
 * Debounce — Utility to limit rapid function calls
 *
 * Returns a debounced version of the function that delays invocation
 * until after `ms` milliseconds have elapsed since the last call.
 */

/**
 * Creates a debounced function that delays invoking `fn` until
 * after `ms` milliseconds have elapsed since the last invocation.
 *
 * @param fn  — The function to debounce
 * @param ms  — Delay in milliseconds
 * @returns   A debounced version of the function
 */
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  ms: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, ms);
  };
}
