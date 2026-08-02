import type { AtomMut } from "@reatom/framework";

export type DevFlag = AtomMut<boolean>
export type ConfigValOpts<T extends 'val' | 'atom'> = { as?: T }
