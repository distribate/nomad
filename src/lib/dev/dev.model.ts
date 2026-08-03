import {
  action, atom, entries, reatomMap, withAssign, withInit,
  type AtomMut, type AtomState, type Ctx, type Unsubscribe
} from "@reatom/framework";
import { withLocalStorage } from "@reatom/persist-web-storage";
import type { DevFlag } from "./types";
import { STATIC_CONFIG_KEYS } from "./const";

const initialConfig = new Map([
  [STATIC_CONFIG_KEYS.LOG_APP_ACTIONS, atom(true)],
  [STATIC_CONFIG_KEYS.LOG_REF_ATOM, atom(false)],
  [STATIC_CONFIG_KEYS.GSAP, atom(true)],
  [STATIC_CONFIG_KEYS.LOG_ROUTER, atom(true)],
  [STATIC_CONFIG_KEYS.LOG_DEV, atom(false)],
])

// todo: add the value formatter
const initFromPersist = action((ctx): Map<string, AtomMut<any>> => {
  const persistRec = ctx.get($devFlagsRec)
  const persistEntries = entries(persistRec)
  const persistMap = new Map(persistEntries)

  const finalMap = new Map<string, DevFlag>()
  const nextPersistRec: Record<string, any> = { ...persistRec }

  for (const [key, defaultAtom] of initialConfig) {
    if (persistMap.has(key)) {
      const savedValue = persistMap.get(key)
      finalMap.set(key, atom(savedValue))
    } else {
      finalMap.set(key, defaultAtom)
      nextPersistRec[key] = ctx.get(defaultAtom)
    }
  }

  for (const [key, savedValue] of persistMap) {
    if (!finalMap.has(key)) {
      finalMap.set(key, atom(savedValue))
    }
  }

  for (const [flagName, flagAtom] of finalMap) {
    $devSubs.sub(ctx, flagName, flagAtom)
  }

  $devFlagsRec(ctx, nextPersistRec)
  return finalMap
})

const $devFlagsRec = atom<Record<string, any>>({}).pipe(
  withLocalStorage("devFlags")
)
const $devFlagsMap = reatomMap<string, DevFlag>(new Map()).pipe(
  withInit((ctx) => initFromPersist(ctx))
)
const $devSubs = reatomMap<DevFlag, Unsubscribe>(new Map()).pipe(
  withAssign(() => ({
    sub: action((ctx, flagName: string, flagAtom: DevFlag) => {
      if (!$devSubs.has(ctx, flagAtom)) {
        const unsub = ctx.subscribe(flagAtom, (state) => {
          // persist
          $devFlagsRec(ctx, (prev) => ({ ...prev, [flagName]: state }))
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

export const getConfigValue = (
  ctx: Ctx, name: string, { as = 'val' }: { as?: 'val' | 'atom' } = {}
) => {
  let final: DevFlag | null = null;

  const targetAtom = $devFlagsMap.get(ctx, name);

  if (!targetAtom) {
    console.log(`Dev flag "${name}" is undefined, creating atom with default value...`)
    $devFlagsMap.set(ctx, name, atom(false, name))
    final = $devFlagsMap.get(ctx, name)!
  } else {
    final = targetAtom
  }

  if (!final) {
    throw new Error(`Dev flag "${name}" is undefined`);
  }

  return as === 'atom' ? final : ctx.get(final)
}

export const getDevConfig = (ctx: Ctx) => {
  let sum: Record<string, any> = {}
  for (const [k, v] of Object.entries(ctx.get($devFlagsMap))) sum[k] = ctx.get(v)
  return {
    config: sum,
    devSubs: ctx.get($devSubs),
    devPersist: ctx.get($devFlagsRec),
  };
}
