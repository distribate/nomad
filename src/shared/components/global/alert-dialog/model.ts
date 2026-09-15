import { action, atom, withAssign, withReset } from "@reatom/framework";
import { withAtomLog } from "@distribate/reatom-kit";

type AlertDialogOpenParams = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

type AlertDialogState = (AlertDialogOpenParams & {
  resolve: (value: boolean) => void;
}) | null;

export const $alertDialog = atom(null, "alertDialog").pipe(
  withAssign((_, name) => {
    const data = atom<AlertDialogState>(null, `${name}.data`).pipe(
      withReset(),
      withAtomLog()
    );

    return {
      data,
      open: action((ctx, params: AlertDialogOpenParams): Promise<boolean> => {
        return new Promise((resolve) => {
          data(ctx, {
            ...params,
            resolve: (result: boolean) => {
              resolve(result);
              data.reset(ctx);
            },
          });
        });
      }, `${name}.open`),
      close: action((ctx) => {
        const current = ctx.get(data);
        if (current) {
          current.resolve(false);
        }
      }, `${name}.close`),
    };
  })
)
