import { action, atom, entries, isObject, withAssign, type Atom, type Unsubscribe } from "@reatom/framework";
import type { FolderApi } from "tweakpane";
import { tryGetPaneInstance, writeToBindingValue } from "../dev/pane.model";

type InspectorOptions = {
  title: string; expanded?: boolean;
}

const formatValue = (v: unknown): unknown => isObject(v) ? JSON.stringify(v, null, 2) : v

export const createFeatureInspector = (
  options: InspectorOptions = { title: "Intro", expanded: true },
  targets: Record<string, Atom<unknown>>
) => {
  let folder: FolderApi | null = null;
  let unsubs: Unsubscribe[] = [];

  const cleanup = () => {
    unsubs.forEach((unsub) => unsub());
    unsubs = [];
    folder?.dispose();
    folder = null;
  };

  return atom(null, `inspector.${options.title}`).pipe(
    withAssign((_, name) => ({
      mount: action((ctx) => {
        cleanup();

        const pane = tryGetPaneInstance();
        if (!pane) return;

        folder = pane.addFolder({
          title: options.title,
          expanded: options.expanded ?? true,
        });

        const head = folder.element.querySelector<HTMLElement>('.tp-fldv_t');
        if (head) head.style.backgroundColor = "rgba(255, 0, 0, 0.3)";

        for (const [key, targetAtom] of entries(targets)) {
          const initialValue = ctx.get(targetAtom);
          const isObj = isObject(initialValue);

          const binding = folder.addBinding(
            { [key]: formatValue(initialValue) },
            key,
            {
              readonly: true,
              multiline: isObj,
              rows: isObj ? 4 : 1,
            }
          );

          const unsub = ctx.subscribe(targetAtom, (state) => {
            writeToBindingValue(binding)(formatValue(state));
          });

          unsubs.push(unsub);
        }
      }, `${name}.mount`),

      cleanup: action(() => {
        cleanup();
      }, `${name}.cleanup`),
    }))
  );
}
