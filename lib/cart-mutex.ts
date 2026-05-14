/**
 * Async mutex for cart operations.
 * Prevents concurrent cart mutations (e.g., rapid double-clicks)
 * from spawning parallel API calls that cause race conditions.
 *
 * Usage:
 *   const mutex = createCartMutex();
 *   await mutex.runExclusive(async () => { ... });
 */

type QueuedTask = {
  execute: () => Promise<void>;
  resolve: () => void;
  reject: (reason: unknown) => void;
};

export function createCartMutex() {
  let locked = false;
  const queue: QueuedTask[] = [];

  async function processQueue() {
    if (locked || queue.length === 0) return;

    locked = true;
    const task = queue.shift()!;

    try {
      await task.execute();
      task.resolve();
    } catch (error) {
      task.reject(error);
    } finally {
      locked = false;
      // Process next task in queue
      processQueue();
    }
  }

  return {
    /** True if a cart action is currently in-flight */
    get isLocked() {
      return locked;
    },

    /** Number of tasks waiting in queue */
    get queueLength() {
      return queue.length;
    },

    /**
     * Run a function exclusively — if the mutex is locked,
     * the call is queued and will execute after the current one finishes.
     */
    runExclusive<T>(fn: () => Promise<T>): Promise<T> {
      return new Promise<T>((resolve, reject) => {
        queue.push({
          execute: fn as () => Promise<void>,
          resolve: resolve as () => void,
          reject,
        });
        processQueue();
      });
    },

    /**
     * Try to run a function exclusively — if the mutex is already locked,
     * immediately returns null instead of queuing. Use for fire-and-forget
     * actions where duplicate calls should be silently dropped.
     */
    tryRunExclusive<T>(fn: () => Promise<T>): Promise<T | null> {
      if (locked) return Promise.resolve(null);
      return this.runExclusive(fn);
    },
  };
}

/** Singleton mutex for cart operations */
export const cartMutex = createCartMutex();
