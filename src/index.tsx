/* @refresh reload */
import './index.css';
import 'virtual:uno.css'

import 'solid-devtools'

import "@/lib/logger/setup.ts";

import { render } from 'solid-js/web'
import { reatomContext } from '@reatom/npm-solid-js'
import type { ParentComponent } from 'solid-js';
import { isError } from 'utils/index';

import { getReatomCtx } from '@/lib/app/ctx.ts';
import { startBoot, beforeBoot } from '@/lib/app/boot.ts';

import { AppError } from '@/shared/components/templates/error.tsx';
import { AppLayout } from '@/shared/components/templates/layout.tsx';
import { Entry } from '@/entry'

import { registerPublicApi } from '@/shared/api/exposing.ts';
import { registerRoutes } from '@/routes.ts';

registerPublicApi();
registerRoutes();

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

  await startBoot(ctx);
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
