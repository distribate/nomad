import './index.css';
import 'virtual:uno.css'

import "./lib/logger/setup.ts";
import "./lib/gsap/setup.ts";

/* @refresh reload */
import { render } from 'solid-js/web'
import { Entry } from './entry'
import { isTMA } from '@tma.js/sdk';
import { $appState } from './lib/app/app.model.ts';
import { reatomContext } from '@reatom/npm-solid-js'
import { getReatomCtx } from './lib/app/index.ts';
import { createRouter } from './router.tsx';
import { initAsTMA } from './lib/app/tma.ts';
import { config } from './const/config.ts';
import { setupDayjs } from './lib/dayjs.ts';

const root = document.getElementById('root')!;
const ctx = getReatomCtx();

const boot = async () => {
  if (import.meta.env.DEV) {
    const m = await import("./lib/dev/dev.model.ts");
    m.startReatomLogger(ctx);

    if (config.withDev) {
      m.$dev.initPane(ctx);
    }
  }

  await setupDayjs(ctx);
  await createRouter(ctx);

  const type = isTMA() ? "tma" : "standalone"
  $appState.meta.type(ctx, type);

  if (type === 'tma') {
    await initAsTMA(ctx);
  }
}

const getRootNode = () => (
  <reatomContext.Provider value={ctx}>
    <Entry />
  </reatomContext.Provider>
);

try {
  render(getRootNode, root);
  await boot();
} catch (e) {
  console.error("App error", e)
}
