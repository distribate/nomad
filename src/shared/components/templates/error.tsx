import { Show } from "solid-js";
import { reportError } from "../../../lib/app/app.model"
import { useAtomAccessor } from "../../../lib/reatom"
import { Button } from "../../ui/button";
import { useCtx } from "@reatom/npm-solid-js";

const AppErrorPending = () => {
  return (
    <div class="flex flex-col items-center gap-2">
      <div class="h-6 w-6 animate-spin rounded-full border-2 border-neutral-500 border-t-white" />
      <p class="text-lg font-medium text-white">
        Reporting diagnostic information…
      </p>
      <p class="max-w-sm text-center text-sm text-neutral-400">
        Please wait a moment. This usually takes only a few seconds.
      </p>
    </div>
  )
}

export const AppError = (props: { e: Error }) => {
  const ctx = useCtx();
  const statuses = useAtomAccessor(reportError.statusesAtom);

  return (
    <div class="flex items-center justify-center p-4 w-full">
      <Show
        when={!statuses().isPending}
        fallback={<AppErrorPending />}
      >
        <div class="flex flex-col gap-6 items-center w-full h-full">
          <div class="flex flex-col gap-2 w-full">
            <h1 class="text-2xl font-bold text-white">
              Something went wrong
            </h1>
            <p class="leading-5 text-neutral-400">
              The application encountered a fatal error and couldn't continue.
            </p>
          </div>
          <div class="flex flex-col rounded-lg border border-red-900/40 bg-red-950/30 p-2 w-full">
            <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-red-400">
              Error
            </p>
            <code class="wrap-break-words text-sm text-red-200">
              {props.e.message.slice(0, 100)}
            </code>
          </div>
          <div class="flex flex-wrap gap-3">
            <Button
              onClick={() => location.reload()}
            >
              Reload app
            </Button>
            <Show
              when={!statuses().isFulfilled}
              fallback={null}
            >
              <Button
                onClick={() => reportError(ctx, props.e)}
              >
                Send report
              </Button>
            </Show>
          </div>
          <p class="text-xs text-neutral-500">
            If the problem persists, please include the error message above when
            reporting the issue.
          </p>
        </div>
      </Show>
    </div>
  )
}
