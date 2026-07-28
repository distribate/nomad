import { loadProfiles } from "../../shared/components/feed/model"
import { Introduction } from "../../shared/components/introduction"
import { Feed, FeedFallback, FeedLoader } from "../../shared/components/feed"
import { NotFound } from "../../shared/components/templates/not-found"
import { action } from "@reatom/framework"
import { $isAuthed, withAuth } from "../user/user.model"
import type { Routes } from "universal-router"
import { defineRoute, redirect } from "./utils"
import { Me } from "../../shared/components/me"
import { Contacts } from "../../shared/components/contacts"
import { Settings } from "../../shared/components/settings"
import { revertHeaderNodes, updateHeaderNodes } from "../../shared/components/layout/header/model"
import { MoreEvents } from "../../shared/components/more"

export const routes: Routes = [
  {
    path: '/',
    action: defineRoute("feed", {
      component: Feed,
      fallback: FeedFallback,
      loader: FeedLoader,
      onEnter: action(async (ctx) => {
        await loadProfiles(ctx);
      }),
      guard: action((ctx) => {
        withAuth(ctx);
      })
    })
  },
  {
    path: '/intro',
    action: defineRoute("intro", {
      component: Introduction,
      guard: action((ctx) => {
        const isAuthed = ctx.get($isAuthed);
        if (isAuthed) throw redirect("/");
      }),
    })
  },
  {
    path: "/me",
    action: defineRoute("me", {
      component: Me,
      onEnter: action((ctx) => {
        updateHeaderNodes(ctx, { r: MoreEvents })
      }),
      guard: action((ctx) => {
        withAuth(ctx)
      }),
      onLeave: action((ctx) => {
        revertHeaderNodes(ctx)
      })
    })
  },
  {
    path: "/contacts",
    action: defineRoute("contacts", {
      component: Contacts,
      guard: action((ctx) => {
        withAuth(ctx)
      })
    })
  },
  {
    path: "/settings",
    action: defineRoute("settings", {
      component: Settings,
      guard: action((ctx) => {
        withAuth(ctx)
      })
    })
  },
  {
    path: '/*all',
    action: () => ({
      component: NotFound,
    })
  },
]
