import {
  action, atom, reatomAsync,
  withAssign, withErrorAtom, withReset, withStatusesAtom
} from "@reatom/framework";
import type { Chat, ChatMessage } from "../chats/types";
import { $chats } from "../chats/model";
import { invariant } from "@/lib/utils";
import { nanoid } from "nanoid";
import { withCallParams } from "@distribate/reatom-kit";

export const $chat = atom(null, "chat").pipe(
  withAssign((_, name) => ({
    data: atom<Chat | null>(null, `${name}.data`),
    meta: atom<{ from: string } | null>(null, `${name}.meta`)
  }))
)
export const $chatIsLoaded = atom((ctx) =>
  !ctx.spy(defineChat.statusesAtom).isPending &&
  !!ctx.spy($chat.data),
  "chatIsLoaded"
)

export const defineChat = reatomAsync(async (ctx, id: string) => {
  const chats = ctx.get($chats);
  const result = chats.find((chat) => chat.id === id)
  invariant(result, `Chat not found: ${id}`);

  $chat.meta(ctx, { from: "chats" })
  $chat.data(ctx, result);

  await defineChatMsgs(ctx)
}, "defineChat").pipe(
  withStatusesAtom()
)
export const unloadChat = reatomAsync(async (ctx) => {
  $chat.data(ctx, null);
  $chat.meta(ctx, null);
}, "unloadChat").pipe(
  withStatusesAtom(),
  withErrorAtom()
)

if (import.meta.env.DEV) {
  // unloadChat.statusesAtom.onChange((_, s) => console.log(unloadChat.statusesAtom.__reatom.name, s))
  // $chatIsLoaded.onChange((_, s) => console.log($chatIsLoaded.__reatom.name, s))
}

const texts = [
  "привет",
  "хай",
  "привет как дела",
  `Я в своем познании настолько преисполнился, что я как будто бы уже
  сто триллионов миллиардов лет проживаю на триллионах и триллионах таких же планет, как эта Земля, мне этот мир абсолютно
  понятен, и я здесь ищу только одного - покоя, умиротворения и вот этой гармонии, от слияния с бесконечно вечным, от созерцания
  великого фрактального подобия и от вот этого замечательного всеединства
  существа, бесконечно вечного, куда ни посмотри, хоть вглубь - бесконечно
  малое, хоть ввысь - бесконечное большое, понимаешь? А ты мне опять со
  своим вот этим, иди суетись дальше, это твоё распределение, это
  твой путь и твой горизонт познания и ощущения твоей природы, он
  несоизмеримо мелок по сравнению с моим, понимаешь? Я как будто бы уже
  давно глубокий старец, бессмертный, ну или там уже почти бессмертный,
  который на этой планете от её самого зарождения, ещё когда только Солнце
  только-только сформировалось как звезда, и вот это газопылевое облако,
  вот, после взрыва, Солнца, когда оно вспыхнуло, как звезда, начало
  формировать вот эти коацерваты, планеты, понимаешь, я на этой Земле уже
  как будто почти пять миллиардов лет живу и знаю её вдоль и поперёк
  этот весь мир, а ты мне какие-то... мне не важно на твои тачки, на твои
  яхты, на твои квартиры, там, на твоё благо. Я был на этой
  планете бесконечным множеством, и круче Цезаря, и круче Гитлера, и круче
  всех великих, понимаешь, был, а где-то был конченым говном, ещё хуже,
  чем здесь. Я множество этих состояний чувствую. Где-то я был больше
  подобен растению, где-то я больше был подобен птице, там, червю, где-то
  был просто сгусток камня, это всё есть душа, понимаешь? Она имеет грани
  подобия совершенно многообразные, бесконечное множество. Но тебе этого
  не понять, поэтому ты езжай себе , мы в этом мире как бы живем
  разными ощущениями и разными стремлениями, соответственно, разное наше и
  место, разное и наше распределение. Тебе я желаю все самые крутые тачки
  чтоб были у тебя, и все самые лучше самки, если мало идей, обращайся ко мне, я тебе на каждую твою идею предложу сотню триллионов, как всё делать. Ну а я всё, я иду как глубокий старец,узревший вечное, прикоснувшийся к Божественному, сам стал богоподобен и устремлен в это бесконечное, и который в умиротворении, покое, гармонии, благодати, в этом сокровенном блаженстве пребывает, вовлеченный во всё и во вся, понимаешь, вот и всё, в этом наша разница. Так что я иду любоваться мирозданием, а ты идёшь преисполняться в ГРАНЯХ каких-то, вот и вся разница, понимаешь, ты не зришь это вечное бесконечное, оно тебе не нужно. Ну зато ты, так сказать, более активен, как вот этот дятел долбящий, или муравей, который очень активен в своей стезе, поэтому давай, наши пути здесь, конечно, имеют грани подобия, потому что всё едино, но я-то тебя прекрасно понимаю, а вот ты меня - вряд ли, потому что я как бы тебя в себе содержу, всю твою природу, она составляет одну маленькую там песчиночку, от того что есть во мне, вот и всё, поэтому давай, ступай, езжай, а я пошел наслаждаться прекрасным осенним закатом на берегу теплой южной реки. Всё, ступай, и я пойду.`,
  "что делаешь",
  "да"
];
const limit = 1024;
export const $chatMsgs = atom<ChatMessage[]>([], `chatMsgs`)

export const defineChatMsgs = reatomAsync(async (ctx) => {
  const msgs: ChatMessage[] = [];

  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];

    for (let offset = 0; offset < text.length; offset += limit) {
      msgs.push({
        messageId: (msgs.length + 1).toString(),
        sender: "test",
        text: text.slice(offset, offset + limit),
        timestamp: new Date().toISOString(),
        type: "text",
        unread: false,
      });
    }
  }

  $chatMsgs(ctx, msgs)
}, "defineChatMsgs").pipe(
  withStatusesAtom(),
  withErrorAtom()
)

export const defineChatMsg = reatomAsync(async (ctx, text: string) => {
  const msg: ChatMessage = {
    text,
    messageId: nanoid(6),
    timestamp: new Date().toISOString(),
    unread: false,
    sender: "",
    type: "text",
  }

  $chatMsgs(ctx, (state) => [...state, msg])

  return msg
}, {
  onFulfill: (ctx) => {
    $msgText.reset(ctx);
  }
}).pipe(
  withCallParams()
)

type EventOf<TElement extends HTMLElement, TEvent extends Event> = TEvent & {
  currentTarget: TElement
}

export const $msgText = atom<string>("", "msgText").pipe(withReset());
export const $msgAttachs = atom<File[]>([], "msgAttachs").pipe(withReset());

export const sendMsg = action((ctx, e: EventOf<HTMLFormElement, SubmitEvent>) => {
  e.preventDefault();

  // const data = new FormData(e.currentTarget)
  // const text = data.get("message") as string
  const text = ctx.get($msgText);

  if (text.trim().length === 0) {
    return;
  }

  defineChatMsg(ctx, text)
}, "sendMsg")

export const $chatFooter = atom(null, "chatFooter").pipe(
  withAssign((_, name) => ({
    height: atom(0, `${name}.height`)
  }))
)
export const defineAttachs = action((ctx, files: FileList | null) => {
  if (!files) return;
  $msgAttachs(ctx, (state) => [...state, ...Array.from(files)])
}, "defineAttachs")

export const $msgTypemode = atom<"text" | "file" | "none">((ctx) => {
  if (ctx.spy($msgText).trim().length >= 1) {
    return "text"
  }

  if (ctx.spy($msgAttachs).length >= 1) {
    return "file"
  }

  return "none"
}, "msgTypemode")
