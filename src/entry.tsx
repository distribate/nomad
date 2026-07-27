import { Header } from "./shared/components/layout/header"
import { Dynamic, Show } from "solid-js/web"
import { useAtomAccessor } from "./lib/reatom"
import { $route } from "./router"
import { NotFound } from "./shared/components/templates/not-found"

const Router = () => {
  const route = useAtomAccessor($route);

  return (
    <Show
      when={route()?.component}
      fallback={<NotFound />}
    >
      {(Component) => <Dynamic component={Component()} />}
    </Show>
  )
}

export const Entry = () => {
  return (
    <main class="flex flex-col bg-neutral-900 *:border w-full overflow-hidden h-screen">
      <Header />
      <div class="w-full z-1 relative h-full">
        <Router />
      </div>
    </main>
  )
}
