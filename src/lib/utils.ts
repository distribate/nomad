import { atom, type Atom } from "@reatom/framework";

export function compareAtom<T>(
  source: Atom<T>,
  predicate: (value: T) => boolean,
) {
  return atom((ctx) => predicate(ctx.spy(source)))
}

export const createNoopProxy = (): any => {
  const dummyFn = () => proxy;

  const proxy: any = new Proxy(dummyFn, {
    get(_target, prop) {
      if (prop === 'then') return undefined;
      if (prop === Symbol.toPrimitive) return () => '';
      if (prop === 'toString' || prop === 'valueOf') return () => 'noop';
      return proxy;
    },
    apply() {
      return proxy;
    },
  });

  return proxy;
};

/**
 * Exposes a function to `window` **ONLY in DEV environment**.
 *
 * ⚠️ **Note:** Calls to this function are stripped out in production builds by a macro.
 */
export function expose<T extends (...args: any[]) => any>(fn: T, name = fn.name): T {
  if (name) {
    (window as any)[name] = fn;
  }
  return fn;
}

/**
 * Exposes a function to `window` in **ALL environments** (including PROD).
 *
 * 💡 Use this only for public runtime APIs or analytics helpers that must persist in production.
 */
export function exposePublic<T extends (...args: any[]) => any>(fn: T, name = fn.name): T {
  if (!name || name === 'fn') {
    console.warn(
      `[exposePublic] Function name is missing or minified! ` +
      `Pass an explicit name string as the second argument (e.g., exposePublic(myFn, 'myFn')).`
    );
  }
  if (name) {
    (window as any)[name] = fn;
  }
  return fn;
}

export const isPrimitive = (val: unknown): val is string | number | boolean =>
  typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean';
export const isError = (val: unknown): val is Error =>
  val instanceof Error;
