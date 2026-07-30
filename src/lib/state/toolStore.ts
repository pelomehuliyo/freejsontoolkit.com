/**
 * Tool State Store
 *
 * Lightweight observable store for tool UI state.
 * Framework-independent, zero dependencies, ~50 lines.
 *
 * API:
 *   const store = new Store<T>(initialValue)
 *   store.get()             → current value
 *   store.set(next)         → update value (skips subscribers if unchanged)
 *   store.update(fn)        → set(fn(current))
 *   store.subscribe(fn)     → register listener, fires immediately, returns unsubscribe
 *
 * @example
 *   const count = new Store(0);
 *   const unsub = count.subscribe(val => console.log(val));
 *   count.set(1);           // logs 1
 *   count.set(1);           // no-op (unchanged)
 *   count.update(n => n+1); // logs 2
 *   unsub();
 */

type Subscriber<T> = (value: T) => void;
type EqualityFn<T> = (a: T, b: T) => boolean;

/**
 * Simple reactive store.
 * Skips subscriber notifications when the new value is equal to the current value.
 */
export class Store<T> {
  private value: T;
  private subscribers: Set<Subscriber<T>> = new Set();
  private equals: EqualityFn<T>;

  constructor(initial: T, equals?: EqualityFn<T>) {
    this.value = initial;
    this.equals = equals ?? defaultEquals;
  }

  /** Returns the current value. */
  get(): T {
    return this.value;
  }

  /** Sets a new value. Notifies subscribers only if the value changed. */
  set(next: T): void {
    if (this.equals(this.value, next)) return;
    this.value = next;
    this.subscribers.forEach((fn) => fn(this.value));
  }

  /** Applies a transformation function to the current value. */
  update(fn: (prev: T) => T): void {
    this.set(fn(this.value));
  }

  /**
   * Registers a subscriber. The subscriber is called immediately with the
   * current value, then again on every change.
   *
   * Returns an unsubscribe function.
   */
  subscribe(fn: Subscriber<T>): () => void {
    this.subscribers.add(fn);
    fn(this.value);
    return () => {
      this.subscribers.delete(fn);
    };
  }

  /**
   * Clears all subscribers and releases references.
   * Call when the store is no longer needed (e.g. page navigation).
   */
  destroy(): void {
    this.subscribers.clear();
  }
}

/**
 * Default equality check: strict reference equality for objects,
 * value equality for primitives.
 */
function defaultEquals<T>(a: T, b: T): boolean {
  return a === b;
}

/**
 * Shallow equality check for plain objects.
 * Useful when the store value is a plain object and you want to avoid
 * unnecessary updates when only reference changes.
 */
export function shallowEqual<T extends Record<string, unknown>>(a: T, b: T): boolean {
  if (a === b) return true;
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}
