import { Header } from "./shared/components/layout/header"
import { Dynamic, Show } from "solid-js/web"
import { useAtomAccessor } from "./lib/reatom"
import { $route, $routeLoading } from "./lib/router"
import { NotFound } from "./shared/components/templates/not-found"
import { Skeleton } from "./shared/ui/skeleton"
import { Bottom } from "./shared/components/layout/bottom"
import { $appLoading } from "./lib/app/app.model"
import { Toaster } from 'solid-toast';

const Router = () => {
  const route = useAtomAccessor($route.render);
  const routeLoading = useAtomAccessor($routeLoading);

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
    <>
      <Skeleton class="w-full h-screen rounded-none" />
    </>
  )
}


const Global = () => {
  return (
    <Toaster />
  )
}

export const Entry = () => {
  const appLoading = useAtomAccessor($appLoading);

  return (
    <>
      <main class="flex items-center justify-center w-full">
        <div class="flex flex-col relative bg-neutral-900 items-center justify-center w-full overflow-hidden h-screen max-w-[440px]">
          <Header />
          <Show
            when={!appLoading()}
            fallback={<AppLoader />}
          >
            <div class="w-full z-1 relative h-full">
              <Router />
            </div>
          </Show>
          <Bottom />
        </div>
      </main>
      <Global />
    </>
  )
}
