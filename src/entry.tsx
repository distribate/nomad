import { useAtom } from "@reatom/npm-solid-js"
import { type ParentComponent, Show } from "solid-js"
import { Dynamic } from "solid-js/web"
import { $appState, defineInitialRoute } from "./lib/app/app.model"
import { routes } from "./routes"
import { Header } from "./shared/components/layout/header"

const CurrentRouteComponent = () => {
  const [route] = useAtom($appState.route);
  const component = routes[route()]
  return <Dynamic component={component} />
}

const AppLoader = () => {
  return <div>Loading...</div>
}

export const Entry: ParentComponent = (props) => {
  const [statuses] = useAtom(defineInitialRoute.statusesAtom)

  return (
    <main class="bg-neutral-900 w-full p-2 overflow-hidden h-screen">
      <Header />
      <Show when={!statuses().isPending} fallback={<AppLoader />}>
        <CurrentRouteComponent />
        {props.children}
      </Show>
    </main>
  )
}
