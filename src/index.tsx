import "./lib/logger/setup.ts";

/* @refresh reload */
import { render } from 'solid-js/web'

import './index.css';
import 'virtual:uno.css'

import { Entry } from './entry'
import { isTMA } from '@tma.js/sdk';
import { $appState, defineInitialRoute, getReatomCtx } from './lib/app/app.model.ts';
import { connectLogger } from '@reatom/framework'
import { reatomContext } from '@reatom/npm-solid-js'
import { rootLogger } from './lib/logger/logger.model';
import { config } from "./const/index.ts";

const root = document.getElementById('root')!;
const ctx = getReatomCtx();

try {
  if (import.meta.env.DEV) {
    startReatomLogger();
  }

  const type = isTMA() ? "tma" : "standalone"
  $appState.meta.type(ctx, type);

  if (type === 'tma') {
    await initTMA();
  }

  defineInitialRoute(ctx);
} catch (e) {
  console.error(e)
}

const getRootNode = () => (
  <reatomContext.Provider value={ctx}>
    <Entry />
  </reatomContext.Provider>
);

render(getRootNode, root)

if (import.meta.env.DEV && config.withDev) {
  const { $dev } = await import("./lib/dev/dev.model.ts")
  $dev.initPane(ctx)
}

function startReatomLogger() {
  connectLogger(ctx);
  rootLogger.info("Logger connected")
}
async function initTMA() {
  const { backButton, init } = await import("@tma.js/sdk")
  init();
  backButton.mount();
  backButton.show();
}
