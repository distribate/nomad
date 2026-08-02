import {
  action, atom, entries, reatomMap, withAssign, withInit,
  type AtomMut, type AtomState, type Ctx, type Unsubscribe
} from "@reatom/framework";
import { withLocalStorage } from "@reatom/persist-web-storage";

export const defineValWithLS = (defaultVal: boolean, name: string) => atom(defaultVal, name);

export type DevFlag = AtomMut<boolean>

const initialConfig = new Map([
  ["withAppActionsLog", defineValWithLS(true, "withAppActionsLog")],
  ["withRefAtomLog", defineValWithLS(false, "withRefAtomLog")],
  ["withGsap", defineValWithLS(true, "withGsap")],
  ["withAppRouterLog", defineValWithLS(true, "withAppRouterLog")]
])

// todo: add the value formatter
const initFromPersist = action((ctx): Map<string, AtomMut<any>> => {
  const persistRec = ctx.get($devFlags)
  const persistEntries = entries(persistRec)
  const persistMap = new Map(persistEntries)

  const finalMap = new Map<string, DevFlag>()
  const nextPersistRec: Record<string, any> = { ...persistRec }

  for (const [key, defaultAtom] of initialConfig) {
    if (persistMap.has(key)) {
      const savedValue = persistMap.get(key)
      finalMap.set(key, defineValWithLS(savedValue, key))
    } else {
      finalMap.set(key, defaultAtom)
      nextPersistRec[key] = ctx.get(defaultAtom)
    }
  }

  for (const [key, savedValue] of persistMap) {
    if (!finalMap.has(key)) {
      finalMap.set(key, defineValWithLS(savedValue, key))
    }
  }

  for (const [flagName, flagAtom] of finalMap) {
    $devSubs.sub(ctx, flagName, flagAtom)
  }

  $devFlags(ctx, nextPersistRec)
  return finalMap
})

const $devFlags = atom<Record<string, any>>({}, "devFlags").pipe(withLocalStorage("devFlags"))
const $devFlagsMap = reatomMap<string, DevFlag>(new Map(), "devFlagsMap").pipe(withInit((ctx) => initFromPersist(ctx)))
const $devSubs = reatomMap<DevFlag, Unsubscribe>(new Map(), "devSubs").pipe(
  withAssign(() => ({
    sub: action((ctx, flagName: string, flagAtom: DevFlag) => {
      if (!$devSubs.has(ctx, flagAtom)) {
        const unsub = ctx.subscribe(flagAtom, (state) => {
          console.log(flagAtom.__reatom.name, state)
          $devFlags(ctx, (prev) => ({ ...prev, [flagName]: state }))
        })

        $devSubs.set(ctx, flagAtom, unsub)
      }
    }),
    unsub: action((ctx, actual: AtomState<typeof $devFlagsMap>) => {
      for (const [flagAtom, unsub] of ctx.get($devSubs)) {
        if (!Array.from(actual.values()).includes(flagAtom)) {
          unsub()
          $devSubs.delete(ctx, flagAtom)
        }
      }
    })
  }))
);

$devFlagsMap.onChange((ctx, state) => {
  for (const [key, flagAtom] of state) {
    $devSubs.sub(ctx, key, flagAtom)
  }
  $devSubs.unsub(ctx, state)
})

export type ConfigValOpts<T extends 'val' | 'atom'> = { as?: T }

export function getConfigValue(ctx: Ctx, name: string, { as = 'val' }: { as?: 'val' | 'atom' } = {}) {
  let final: DevFlag | null = null;

  const targetAtom = $devFlagsMap.get(ctx, name);

  if (!targetAtom) {
    console.log(`Dev flag "${name}" is undefined, creating atom with default value...`)
    $devFlagsMap.set(ctx, name, defineValWithLS(false, name))
    final = $devFlagsMap.get(ctx, name)!
  } else {
    final = targetAtom
  }

  if (!final) {
    throw new Error(`Dev flag "${name}" is undefined`);
  }

  return as === 'atom' ? final : ctx.get(final)
}

// todo: add declarative definition
// const defineDevFlag = (flagName: string, defaultValue: boolean): void => {
//   const ctx = getReatomCtx();

//   const targetAtom = $devFlagsMap.get(ctx, flagName)
//   if (targetAtom) {
//     console.log(`"${flagName}" is already defined`)
//     return
//   }

//   $devFlagsMap.set(ctx, flagName, defineValWithLS(defaultValue, flagName))
//   console.log(`Dev flag "${flagName}" is defined as ${defaultValue}`)
// }
//

export const getDevConfig = (ctx: Ctx) => {
  let sum: Record<string, any> = {}
  for (const [k, v] of Object.entries(ctx.get($devFlagsMap))) {
    sum[k] = ctx.get(v)
  }
  return  {
    config: sum,
    devSubs: ctx.get($devSubs),
    devPersist: ctx.get($devFlags),
  };
}
