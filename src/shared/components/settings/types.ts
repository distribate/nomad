import type { Action, AtomMut } from "@reatom/framework";

type SettingMeta = {
  title: string;
  description?: string;
};

type SettingItemPage = {
  type: "page";
  meta: SettingMeta;
  route: string;
}
type SettingItemAction = {
  type: "action";
  meta: SettingMeta;
} & (
  | {
    event: Action<[boolean], any>;
    as: "switch",
    value: AtomMut<boolean>
  } | {
    event: Action<[], any>;
    as: "input",
    value: AtomMut<string>
  } | {
    event: Action<[], any>;
    as: "button",
    value?: never,
    isActive?: boolean
  }
)

type SettingItemGroup = {
  type: "group";
  meta: SettingMeta;
  children: Record<string, SettingItem>;
}

export type SettingItem =
  | SettingItemPage
  | SettingItemAction
  | SettingItemGroup

export type SettingsSection = {
  title?: string;
  children: Record<string, SettingItem>;
};

export type Settings = Record<string, SettingsSection>;
