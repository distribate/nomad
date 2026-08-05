/* @refresh reload */
import './index.css';
import 'virtual:uno.css'

import 'solid-devtools'

import "./lib/logger/setup.ts";

import { render } from 'solid-js/web'
import { Entry } from './entry'
import { reatomContext } from '@reatom/npm-solid-js'
import { getReatomCtx } from './lib/app/ctx.ts';
import { boot, beforeBoot } from './lib/app/boot.ts';
import { AppError } from './shared/components/templates/error.tsx';
import { isError } from './lib/utils.ts';
import type { ParentComponent } from 'solid-js';
import { AppLayout } from './shared/components/templates/layout.tsx';
import { registerPublicApi } from './lib/exposing.ts';

registerPublicApi();

const root = document.getElementById('root')!;
const ctx = getReatomCtx();

const AppRoot: ParentComponent = (props) => (
  <reatomContext.Provider value={ctx}>
    <AppLayout>
      {props.children}
    </AppLayout>
  </reatomContext.Provider>
);

let dispose: (() => void) | null = null;;

try {
  await beforeBoot(ctx);

  dispose = render(
    () => (
      <AppRoot>
        <Entry />
      </AppRoot>
    ),
    root
  );

  await boot(ctx);
} catch (e) {
  dispose?.();

  console.error(e);

  if (isError(e)) {
    render(
      () => (
        <AppRoot>
          <AppError e={e} />
        </AppRoot>
      ),
      root
    )
  }
}
