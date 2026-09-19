import {
  action, atom, entries, isObject, withAssign,
  type Action, type Atom, type AtomMut, type Unsubscribe
} from "@reatom/framework";
import type { FolderApi } from "tweakpane";
import { tryGetRootFolder, writeToBindingValue } from "../dev/pane.model";
import { getConfigVal } from "../../const/config";
import { STATIC_CONFIG_KEYS } from "../dev/const";
import { createNoopProxy } from "./index";
import { nanoid } from "nanoid";

type InspectorOptions = {
  title?: string;
  expanded?: boolean;
}
type Targets = Record<string, Atom<unknown> | undefined>
type Inspector = AtomMut<null> & {
  mount: Action<[], void>
  cleanup: Action<[], void>
}

const formatValue = (v: unknown): unknown => isObject(v) ? JSON.stringify(v, null, 2) : v

const noop = createNoopProxy();

/**
 * Creates a feature inspector.
 */
export function createFeatureInspector(targets: Targets): Inspector;
export function createFeatureInspector(targets: Targets, options: InspectorOptions): Inspector;
export function createFeatureInspector(targets: Targets, _options: InspectorOptions = {}): Inspector {
  const isEnabled = getConfigVal(STATIC_CONFIG_KEYS.FEATURE_INSPECTOR)
  if (!isEnabled) return noop;

  const options = {
    title: nanoid(6),
    expanded: true,
    ..._options,
  };

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

        const pane = tryGetRootFolder();
        if (!pane) return;

        folder = pane.addFolder({
          title: options.title,
          expanded: options.expanded ?? true,
        });

        const head = folder.element.querySelector<HTMLElement>('.tp-fldv_t');
        if (head) head.style.backgroundColor = "rgba(255, 0, 0, 0.3)";

        for (const [key, targetAtom] of entries(targets)) {
          if (!targetAtom) continue;

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
