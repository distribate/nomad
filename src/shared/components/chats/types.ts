export type ChatMessageType =
  | 'text'
  | 'attach-img'
  | 'attach-video'
  | 'attach-gif'
  | 'attach-voice'
  | 'attach-file'

export type ChatMessage = {
  text: string,
  timestamp: string,
  unread: boolean,
  sender: string,
  messageId: string,
  type: ChatMessageType,
}

export type Chat = {
  id: string,
  username: string,
  avatar: string,
  lastMessage: ChatMessage
}

export type Chats = {
  data: Chat[]
}
