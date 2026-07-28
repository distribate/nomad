/**
 * Applies a rule to a given name, returning the name with or without a leading underscore.
 * In Reatom, anything with an underscore prefix is not logged.
 */
export const withRule = (name: string, rule: (() => boolean) | boolean): string => {
  return (typeof rule === "function" ? rule() : rule)
    ? name
    : `_${name}`
}
