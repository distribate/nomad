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

export function expose<T extends (...args: any[]) => any>(fn: T, name = fn.name): T {
  if (name) {
    (window as any)[name] = fn;
  }
  return fn;
}

export const isPrimitive = (val: unknown): val is string | number | boolean =>
  typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean';
export const isError = (val: unknown): val is Error =>
  val instanceof Error;
