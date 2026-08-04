import { action, isAbort, type Action } from "@reatom/framework";
import { navigate } from "../../../lib/router/utils";
import type { IconName } from "../../ui/icon";
import { translate } from "../../../lib/app/locale";

type MeEvent = {
  icon: IconName,
  label: string,
  action: Action<[], any>
}

export const me_events: MeEvent[] = [
  {
    label: translate["profile.set-photo"](),
    action: action(async (ctx) => {
      if ('showOpenFilePicker' in window) {
        try {
           // @ts-expect-error
          const [fileHandle] = await window.showOpenFilePicker({
            types: [
              {
                description: 'Media',
                accept: {
                  'image/*': ['.png', '.jpeg', '.jpg', '.webp'],
                  'video/*': ['.mp4', '.mov', '.webm']
                }
              }
            ],
            multiple: false
          });

          const file = await fileHandle.getFile();
          console.log('Выбран файл:', file);
        } catch (e) {
          if (!isAbort(e)) {
            console.error(e);
          }
        }
      } else {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,video/*';

        input.onchange = () => {
          if (!input.files) return;

          if (input.files.length > 0) {
            console.log('Выбран файл:', input.files[0]);
          }
        };

        input.click();
      }
    }),
    icon: "sprite:photo-edit"
  },
  {
    label: translate["profile.edit-info"](),
    action: action(async (ctx) => {
      await navigate("/settings", { a: "account" })
    }),
    icon: "sprite:edit"
  },
  {
    label: translate["shared.settings"](),
    action: action(async (ctx) => {
      await navigate("/settings")
    }),
    icon: "sprite:settings"
  },
]
