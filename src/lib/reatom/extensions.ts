import type { Atom } from "@reatom/framework"

export function withLog<T extends Atom<any>>() {
  return (atom: T): T => {
    if (import.meta.env.DEV) {
      atom.onChange((_, s) => {
        console.log(`${atom.__reatom.name || 'unnamed'}:`, s)
      })
    }

    return atom
  }
}
