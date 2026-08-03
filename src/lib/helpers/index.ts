/**
 * Applies a rule to a given name, returning the name with or without a leading underscore.
 * In Reatom, anything with an underscore prefix is not logged.
 */
export const withRule = (name: string, rule: (() => boolean) | boolean): string => {
  return (typeof rule === "function" ? rule() : rule)
    ? name
    : `_${name}`
}

type ModelContext = {
  name: (childName: string) => string,
}

export function declareModel<T>(
  modelName: string,
  fn: (ctx: ModelContext) => T
): T {
  const name = (childName: string) => `${modelName}.${childName}`
  return fn({ name })
}
