import { action, atom } from "@reatom/framework";
import type { Chat, Chats } from "./types";
import { withLocalStorage } from "@reatom/persist-web-storage";

const seed: Chats["data"] = [
  {
    id: "chat-001",
    username: "alex",
    avatar: "https://i.pravatar.cc/150?img=12",
    lastMessage: {
      text: "Да, я уже залил изменения, можешь посмотреть",
      timestamp: "2026-09-17T00:42:00+03:00",
      unread: true,
      sender: "alex",
      messageId: "msg-001",
      type: "text",
    },
  },
  {
    id: "chat-002",
    username: "maria",
    avatar: "https://i.pravatar.cc/150?img=47",
    lastMessage: {
      text: "Вот фотка с вчерашнего вечера",
      timestamp: "2026-09-16T23:18:00+03:00",
      unread: true,
      sender: "maria",
      messageId: "msg-002",
      type: "attach-img",
    },
  },
  {
    id: "chat-003",
    username: "dmitry",
    avatar: "https://i.pravatar.cc/150?img=53",
    lastMessage: {
      text: "Посмотри это видео, особенно последние 10 секунд",
      timestamp: "2026-09-16T22:51:00+03:00",
      unread: false,
      sender: "dmitry",
      messageId: "msg-003",
      type: "attach-video",
    },
  },
  {
    id: "chat-004",
    username: "kate",
    avatar: "https://i.pravatar.cc/150?img=44",
    lastMessage: {
      text: "😂",
      timestamp: "2026-09-16T21:37:00+03:00",
      unread: true,
      sender: "kate",
      messageId: "msg-004",
      type: "attach-gif",
    },
  },
  {
    id: "chat-005",
    username: "max",
    avatar: "https://i.pravatar.cc/150?img=68",
    lastMessage: {
      text: "Голосовое сообщение",
      timestamp: "2026-09-16T20:14:00+03:00",
      unread: false,
      sender: "max",
      messageId: "msg-005",
      type: "attach-voice",
    },
  },
  {
    id: "chat-006",
    username: "nikita",
    avatar: "https://i.pravatar.cc/150?img=11",
    lastMessage: {
      text: "project-specification.pdf",
      timestamp: "2026-09-16T19:42:00+03:00",
      unread: true,
      sender: "nikita",
      messageId: "msg-006",
      type: "attach-file",
    },
  },
  {
    id: "chat-007",
    username: "sofia",
    avatar: "https://i.pravatar.cc/150?img=32",
    lastMessage: {
      text: "Окей, тогда встречаемся в семь",
      timestamp: "2026-09-16T18:09:00+03:00",
      unread: false,
      sender: "sofia",
      messageId: "msg-007",
      type: "text",
    },
  },
  {
    id: "chat-008",
    username: "anton",
    avatar: "https://i.pravatar.cc/150?img=59",
    lastMessage: {
      text: "Скинул скрин, там видно проблему",
      timestamp: "2026-09-16T16:53:00+03:00",
      unread: true,
      sender: "anton",
      messageId: "msg-008",
      type: "attach-img",
    },
  },
  {
    id: "chat-009",
    username: "lena",
    avatar: "https://i.pravatar.cc/150?img=25",
    lastMessage: {
      text: "Вот тот файл, о котором говорила",
      timestamp: "2026-09-16T15:21:00+03:00",
      unread: false,
      sender: "lena",
      messageId: "msg-009",
      type: "attach-file",
    },
  },
  {
    id: "chat-010",
    username: "sergey",
    avatar: "https://i.pravatar.cc/150?img=70",
    lastMessage: {
      text: "Глянь, какой момент нашёл 😄",
      timestamp: "2026-09-16T13:47:00+03:00",
      unread: true,
      sender: "sergey",
      messageId: "msg-010",
      type: "attach-gif",
    },
  },
  {
    id: "chat-011",
    username: "olga",
    avatar: "https://i.pravatar.cc/150?img=49",
    lastMessage: {
      text: "Я тебе позже перезвоню",
      timestamp: "2026-09-16T12:32:00+03:00",
      unread: false,
      sender: "olga",
      messageId: "msg-011",
      type: "attach-voice",
    },
  },
  {
    id: "chat-012",
    username: "igor",
    avatar: "https://i.pravatar.cc/150?img=3",
    lastMessage: {
      text: "Не забудь проверить PR перед релизом",
      timestamp: "2026-09-16T10:16:00+03:00",
      unread: false,
      sender: "igor",
      messageId: "msg-012",
      type: "text",
    },
  },
];

export const $chats = atom<Chat[]>(seed, "chats");
export const $displayedChats = atom<Chat[]>((ctx) => {
  const activeFolder = ctx.spy($chatsActiveFolder);
  if (activeFolder === DEFAULT_FOLDER.id) {
    return ctx.spy($chats);
  }

  const { included, excluded } = ctx.get($chatsFolders).find(d => d.id === activeFolder)!;

  const includedSet = new Set(included)
  const excludedSet = new Set(excluded)

  const result = ctx.spy($chats)
    .filter(({ id }) => includedSet.has(id) && !excludedSet.has(id),)

  return result
})

type ChatsFolder = {
  id: number,
  title: string,
  createdAt: string // timestamp,
  included: string[]
  excluded: string[]
}

export const DEFAULT_FOLDER: ChatsFolder = {
  id: 1,
  title: "All",
  createdAt: new Date().toISOString(),
  included: [],
  excluded: []
}
const unremovableFolders = [DEFAULT_FOLDER.id]
const defaultFolders: ChatsFolder[] = [
  DEFAULT_FOLDER
]

export const $chatsFolders = atom<ChatsFolder[]>(defaultFolders, "chatsFolders").pipe(
  withLocalStorage("chats-folders")
)
export const $chatsActiveFolder = atom<number>(DEFAULT_FOLDER.id, "chatsActiveFolder").pipe(
  withLocalStorage("chats-active-folder")
)

type CreateFolderArgs = Pick<ChatsFolder, "title"> & {
  initialChats: {
    included: string[] // chat ids
    excluded?: string[]
  }
}

export const createFolder = action((ctx, value: CreateFolderArgs) => {
  const { title, initialChats } = value;
  const { included, excluded } = initialChats;

  $chatsFolders(ctx, (state) => [...state, {
    id: state.length + 1,
    title,
    createdAt: new Date().toISOString(),
    included,
    excluded: excluded ?? [],
  }])
}, "createFolder")

const $foldersWhitelist = atom((ctx) =>
  defaultFolders.map(folder => folder.id));

export const deleteFolder = action((ctx, folderId: number) => {
  const inWhitelist = defaultFolders.some(folder => folder.id === folderId)
  if (inWhitelist) {
    throw new Error("Cannot delete default folder")
  }

  $chatsFolders(ctx, (state) => state.filter(folder => folder.id !== folderId))
}, "deleteFolder")

export const $folderIsRemovable = (folderId: number) =>
  atom((ctx) => ctx.spy($foldersWhitelist).includes(folderId))
