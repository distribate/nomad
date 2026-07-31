import { Header } from "./shared/components/layout/header"
import { Dynamic, Show } from "solid-js/web"
import { useAtomAccessor } from "./lib/reatom"
import { $route, $routeLoading } from "./lib/router"
import { NotFound } from "./shared/components/templates/not-found"
import { Bottom } from "./shared/components/layout/bottom"
import { $appLoading } from "./lib/app/app.model"
import { Toaster } from 'solid-toast';

const Router = () => {
  const route = useAtomAccessor($route.render);

  return (
    <Show
      when={route()?.component}
      fallback={
        <Dynamic
          component={route()?.fallback ?? NotFound}
        />
      }
    >
      {(Component) => <Dynamic component={Component()} />}
    </Show>
  )
}

const AppLoader = () => {
  return (
    <div class="h-screen w-full overflow-hidden flex items-center justify-center">
      <img src="/favicon.png" alt="" class="h-32 aspect-square" />
    </div>
  )
}

const Global = () => {
  return (
    <>
      <Toaster />
    </>
  )
}

export const Entry = () => {
  const appLoading = useAtomAccessor($appLoading);
  const routeLoading = useAtomAccessor($routeLoading);

  return (
    <>
      <main class="flex items-center bg-neutral-900 justify-center w-full">
        <Show
          when={!appLoading()}
          fallback={<AppLoader />}
        >
          <>
            <div class="flex flex-col relative items-center justify-center w-full overflow-hidden h-screen max-w-[440px]">
              <Header />
              <Show
                when={!routeLoading()}
                fallback={null}
              >
                <div class="w-full z-1 relative h-full">
                  <Router />
                </div>
              </Show>
              <Bottom />
            </div>
            <Global />
          </>
        </Show>
      </main>
    </>
  )
}
