import { Header } from "./shared/components/layout/header"
import { Dynamic, Show } from "solid-js/web"
import { useAtomAccessor } from "./lib/reatom"
import { $route, $routeLoading } from "./lib/router"
import { NotFound } from "./shared/components/templates/not-found"
import { Bottom } from "./shared/components/layout/bottom"
import { $appLoading } from "./lib/app/app.model"
import { AlertDialog } from "./shared/components/alert-dialog"
import type { ParentComponent } from "solid-js"
import { Toaster } from "solid-toast"

const DefaultLayout: ParentComponent = (props) => props.children;

const Router = () => {
  const layout = useAtomAccessor($route.render.layout);
  const isLoading = useAtomAccessor($routeLoading);

  return (
    <Show
      when={!isLoading()}
      fallback={<AppLoader />}
    >
      <Dynamic component={layout()?.value ?? DefaultLayout}>
        <RouteOutlet />
      </Dynamic>
    </Show>
  );
};

const RouteOutlet = () => {
  const page = useAtomAccessor($route.render.page);
  const fallback = useAtomAccessor($route.render.fallback);

  return (
    <Show
      when={page()?.value}
      fallback={
        <Dynamic component={fallback()?.value ?? NotFound} />
      }
    >
      {(Component) => (
        <Dynamic component={Component()} />
      )}
    </Show>
  );
};

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
      <AlertDialog />
    </>
  )
}

export const Entry = () => {
  const appLoading = useAtomAccessor($appLoading);

  return (
    <Show
      when={!appLoading()}
      fallback={<AppLoader />}
    >
      <>
        <div class="flex flex-col relative items-center justify-center w-full overflow-hidden h-screen max-w-[440px]">
          <Header />
          <div class="w-full z-1 relative h-full">
            <Router />
          </div>
          <Bottom />
        </div>
        <Global />
      </>
    </Show>
  )
}
