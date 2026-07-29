import type { Plugin } from "vite";
import MagicString from "magic-string";
import { parseSync } from "oxc-parser";

export function exposeMacro(): Plugin {
  return {
    name: "expose-macro",
    apply: "build",
    transform(code, id) {
      if (!/\.[cm]?[jt]sx?$/.test(id)) return;

      const { program, errors } = parseSync(id, code);
      if (errors.length) return;

      const s = new MagicString(code);

      function visit(node: any) {
        if (!node || typeof node !== "object") return;

        if (
          node.type === "CallExpression" &&
          node.callee?.type === "Identifier" &&
          node.callee.name === "expose"
        ) {
          const start = node.span?.start ?? node.start;
          const end = node.span?.end ?? node.end;

          if (typeof start === "number" && typeof end === "number") {
            s.remove(start, end);
          }

          return;
        }

        for (const value of Object.values(node)) {
          if (Array.isArray(value)) {
            for (const child of value) {
              visit(child);
            }
          } else {
            visit(value);
          }
        }
      }

      visit(program);

      if (!s.hasChanged()) return;

      return {
        code: s.toString(),
        map: s.generateMap({
          source: id,
          includeContent: true,
        }),
      };
    },
  };
}
