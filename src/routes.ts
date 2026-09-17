import { NotFound } from "./shared/components/templates/not-found"
import { action, reatomAsync } from "@reatom/framework"
import { $isAuthed } from "./lib/user/user.model"
import { defineRoute, asDeferred, redirect } from "./lib/router/utils"
import { $headerNodes } from "./shared/components/layout/header/model"
import { defineChat, unloadChat } from "./shared/components/chat/model"
import { Chat } from "./shared/components/chat"
import { Chats } from "./shared/components/chats"
import { defineRoutes } from "./lib/router"
import { withAuthEffect } from "./effects"

export const registerRoutes = () => {
  defineRoutes([
    {
      path: "/",
      name: "home",
      action: defineRoute("chats", {
        render: {
          page: Chats,
        },
        effects: [
          withAuthEffect
        ]
      }),
    },
    {
      path: "/chat/:id",
      name: "chat",
      action: defineRoute("chat", {
        render: {
          page: Chat,
        },
        effects: [
          withAuthEffect,
          {
            phase: "beforeEnter",
            run: (args) => reatomAsync((ctx) => defineChat(ctx, args.params!["id"]))
          },
          {
            phase: "onLeave",
            run: () => unloadChat
          }
        ]
      }),
    },
    {
      path: '/intro',
      name: "intro",
      action: defineRoute("intro", {
        render: {
          page: asDeferred(() => import("./shared/components/introduction").then(m => m.Introduction))
        },
        effects: [
          {
            phase: "beforeEnter",
            run: () => action((ctx) => {
              const isAuthed = ctx.get($isAuthed);
              if (isAuthed) throw redirect("/");
            })
          }
        ]
      }),
    },
    {
      path: "/me",
      name: "me",
      action: defineRoute("me", {
        render: {
          page: asDeferred(() => import("./shared/components/me").then(m => m.Me))
        },
        effects: [
          {
            phase: "afterEnter",
            run: () => action(async (ctx) => {
              const { MeMore } = await import("./shared/components/me/index")
              $headerNodes.update(ctx, { r: MeMore })
            })
          },
          {
            phase: "onLeave",
            run: () => action((ctx) => {
              $headerNodes.revert(ctx)
            }),
          },
          withAuthEffect
        ],
      })
    },
    {
      path: "/friends",
      name: "friends",
      action: defineRoute("friends", {
        render: {
          page: asDeferred(() => import("./shared/components/friends").then(m => m.Friends))
        },
        effects: [
          withAuthEffect
        ]
      })
    },
    {
      path: "/settings",
      name: "settings",
      action: defineRoute("settings", {
        render: {
          page: asDeferred(() => import("./shared/components/settings").then(m => m.SettingsPage)),
          layout: asDeferred(() => import("./shared/components/settings").then(m => m.SettingsLayout))
        },
        effects: [
          withAuthEffect
        ],
      })
    },
    {
      path: '/*all',
      name: "not-found",
      action: defineRoute("not-found", {
        render: {
          page: NotFound
        },
      })
    },
  ])
}
