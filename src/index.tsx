import './index.css';
import 'virtual:uno.css'

import "./lib/logger/setup.ts";

/* @refresh reload */
import { render } from 'solid-js/web'
import { Entry } from './entry'
import { isTMA, retrieveLaunchParams } from '@tma.js/sdk';
import { $appState } from './lib/app/app.model.ts';
import { reatomContext } from '@reatom/npm-solid-js'
import { getReatomCtx } from './lib/app/ctx.ts';
import { createRouter } from './lib/router/index.tsx';
import { initAsTMA } from './lib/app/tma.ts';
import { config } from './const/config.ts';
import { setupDayjs } from './lib/dayjs.ts';
import { initGsap } from './lib/gsap/index.ts';
import { action } from '@reatom/framework';
import { withRule } from './lib/helpers.ts';
import { $user } from './lib/user/user.model.ts';

const root = document.getElementById('root')!;
const ctx = getReatomCtx();

const initDevModules = action(async (ctx) => {
  const m = await import("./lib/dev/dev.model.ts");
  m.startReatomLogger(ctx);

  if (config.withDev) {
    m.$dev.initPane(ctx);
  }
}, withRule("initDevModules", config.withAppActionsLog))

const boot = async () => {
  if (import.meta.env.DEV) {
    await initDevModules(ctx)
  }

  // const launchParams = retrieveLaunchParams();
  // const user = launchParams.tgWebAppData?.user;

  // if (user) {
  //   $user.data(ctx, {
  //     photo: user.photo_url ? { src: user.photo_url } : null,
  //     firstName: user.first_name,
  //     username: user.username ?? "unknown",
  //     createdAt: new Date().toISOString()
  //   })
  // }

  await initGsap(ctx);
  await setupDayjs(ctx, "ru");
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
