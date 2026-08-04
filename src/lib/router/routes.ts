import { loadProfiles } from "../../shared/components/feed/model"
import { NotFound } from "../../shared/components/templates/not-found"
import { action } from "@reatom/framework"
import { $isAuthed, withAuth } from "../user/user.model"
import type { Routes } from "universal-router"
import { defineRoute, asDeferred, redirect } from "./utils"
import { $headerNodes } from "../../shared/components/layout/header/model"
import type { RouteEffect } from "./types"
import { MoreEvents } from "../../shared/components/global/more"

const withAuthEffect = (): RouteEffect => ({
  phase: "beforeEnter",
  run: action((ctx) => withAuth(ctx)),
})

export const routes: Routes = [
  {
    path: '/',
    action: defineRoute("feed", {
      render: {
        page: asDeferred(() => import("../../shared/components/feed").then(m => m.Feed)),
        fallback: asDeferred(() => import("../../shared/components/feed").then(m => m.FeedFallback)),
        loader: asDeferred(() => import("../../shared/components/feed").then(m => m.FeedLoader)),
      },
      effects: [
        {
          phase: "afterEnter",
          run: action(async (ctx) => {
            await loadProfiles(ctx);
          }),
        },
        withAuthEffect()
      ],
    })
  },
  {
    path: '/intro',
    action: defineRoute("intro", {
      render: {
        page: asDeferred(() => import("../../shared/components/introduction").then(m => m.Introduction))
      },
      effects: [
        {
          phase: "beforeEnter",
          run: action((ctx) => {
            const isAuthed = ctx.get($isAuthed);
            if (isAuthed) throw redirect("/");
          })
        }
      ]
    }),
  },
  {
    path: "/me",
    action: defineRoute("me", {
      render: {
        page: asDeferred(() => import("../../shared/components/me").then(m => m.Me))
      },
      effects: [
        {
          phase: "afterEnter",
          run: action((ctx) => {
            $headerNodes.update(ctx, { r: MoreEvents })
          })
        },
        {
          phase: "beforeLeave",
          run: action((ctx) => {
            $headerNodes.revert(ctx)
          }),
        },
        withAuthEffect()
      ],
    })
  },
  {
    path: "/contacts",
    action: defineRoute("contacts", {
      render: {
        page: asDeferred(() => import("../../shared/components/contacts").then(m => m.Contacts))
      },
      effects: [
        {
          phase: "beforeEnter",
          run: action((ctx) => withAuth(ctx))
        }
      ]
    })
  },
  {
    path: "/settings",
    action: defineRoute("settings", {
      render: {
        page: asDeferred(() => import("../../shared/components/settings").then(m => m.SettingsPage)),
        layout: asDeferred(() => import("../../shared/components/settings").then(m => m.SettingsLayout))
      },
      effects: [
        withAuthEffect()
      ],
    })
  },
  {
    path: '/*all',
    action: defineRoute("not-found", {
      render: {
        page: NotFound
      },
    })
  },
]
