export type Message = {
  id: string
  sender: string
  content: string
  timestamp: number
  isEncrypted?: boolean
  language?: string // Language code of the message
}
