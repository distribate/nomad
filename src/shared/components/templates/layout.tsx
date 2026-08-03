import type { ParentComponent } from "solid-js"

export const AppLayout: ParentComponent = (props) => {
  return (
    <main class="flex items-center h-screen overflow-hidden bg-neutral-900 justify-center w-full">
      {props.children}
    </main>
  )
}
