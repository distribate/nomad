/* @refresh reload */
import './index.css';
import 'virtual:uno.css'

import "./lib/logger/setup.ts";

import { render } from 'solid-js/web'
import { Entry } from './entry'
import { reatomContext } from '@reatom/npm-solid-js'
import { getReatomCtx } from './lib/app/ctx.ts';
import { boot } from './lib/app/boot.ts';

const root = document.getElementById('root')!;
const ctx = getReatomCtx();

const getRootNode = () => (
  <reatomContext.Provider value={ctx}>
    <Entry />
  </reatomContext.Provider>
);

try {
  render(getRootNode, root);
  await boot(ctx);
} catch (e) {
  console.error("App error", e)
}
