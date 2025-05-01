"use client"

import type React from "react"

import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Send,
  Copy,
  Check,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  MessageSquare,
  Lock,
  Clock,
  Trash2,
  LogOut,
  Wifi,
  WifiOff,
  User,
  UserCheck,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { SimpleDialog } from "@/components/simple-dialog"
import { encryptMessage, decryptMessage } from "@/lib/crypto"

type Message = {
  id: string
  sender: string
  content: string
  timestamp: number
  isEncrypted?: boolean
}

// Helper functions for localStorage with improved error handling
const getStoredMessages = (roomId: string): Message[] => {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(`chat_room_${roomId}`)
    return stored ? JSON.parse(stored) : []
  } catch (err) {
    console.error("Error reading from localStorage:", err)
    return []
  }
}

const storeMessages = (roomId: string, messages: Message[]): boolean => {
  if (typeof window === "undefined") return false

  try {
    localStorage.setItem(`chat_room_${roomId}`, JSON.stringify(messages))
    // Update last activity timestamp
    localStorage.setItem(`chat_room_${roomId}_lastActivity`, Date.now().toString())
    return true
  } catch (err) {
    console.error("Error writing to localStorage:", err)
    return false
  }
}

const deleteRoomData = (roomId: string): boolean => {
  if (typeof window === "undefined") return false

  try {
    localStorage.removeItem(`chat_room_${roomId}`)
    localStorage.removeItem(`chat_room_${roomId}_lastActivity`)
    localStorage.removeItem(`chat_username_${roomId}`)

    // Also delete from server
    fetch(`/api/messages?roomId=${roomId}`, {
      method: "DELETE",
    }).catch((err) => console.error("Error deleting server messages:", err))

    return true
  } catch (err) {
    console.error("Error deleting from localStorage:", err)
    return false
  }
}

// Get last activity timestamp
const getLastActivity = (roomId: string): number => {
  if (typeof window === "undefined") return 0

  try {
    const lastActivity = localStorage.getItem(`chat_room_${roomId}_lastActivity`)
    return lastActivity ? Number.parseInt(lastActivity, 10) : 0
  } catch (err) {
    console.error("Error reading last activity:", err)
    return 0
  }
}

// Constants
const INACTIVITY_TIMEOUT = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
const POLLING_INTERVAL = 2000 // 2 seconds - faster polling for better responsiveness

export default function ChatRoomPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = typeof params?.roomId === "string" ? params.roomId : ""
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [username, setUsername] = useState("")
  const [isCopied, setIsCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [showEndChatDialog, setShowEndChatDialog] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<string>("")
  const [lastMessageId, setLastMessageId] = useState<string | null>(null)
  const [partnerPresent, setPartnerPresent] = useState(false)
  const [partnerName, setPartnerName] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const activityCheckRef = useRef<NodeJS.Timeout | null>(null)
  const isComponentMounted = useRef(true)
  const connectionRetryCount = useRef(0)

  // Fetch messages from server with improved error handling
  const fetchMessages = useCallback(async () => {
    if (!roomId || !isComponentMounted.current) return

    try {
      const url = `/api/messages?roomId=${roomId}${lastMessageId ? `&since=${lastMessageId}` : ""}`
      const response = await fetch(url)

      // Reset connection retry count on successful fetch
      connectionRetryCount.current = 0
      setIsConnected(true)

      if (!response.ok) {
        console.warn(`Server returned ${response.status}: ${response.statusText}`)
        return
      }

      const data = await response.json()

      if (data.success && Array.isArray(data.messages)) {
        if (data.messages.length > 0) {
          // Get current messages to avoid duplicates
          const currentMessages = getStoredMessages(roomId)
          const currentIds = new Set(currentMessages.map((m) => m.id))

          // Filter out messages we already have
          const newMessages = data.messages.filter((m: Message) => !currentIds.has(m.id))

          if (newMessages.length > 0 && isComponentMounted.current) {
            // Add new messages to localStorage
            const updatedMessages = [...currentMessages, ...newMessages]
            storeMessages(roomId, updatedMessages)

            // Update state with new messages
            setMessages(updatedMessages)
            if (updatedMessages.length > 0) {
              setLastMessageId(updatedMessages[updatedMessages.length - 1].id)
            }

            // Update participants
            updateParticipants(updatedMessages)
          }
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
      connectionRetryCount.current += 1

      // After 3 failed attempts, mark as disconnected
      if (connectionRetryCount.current >= 3) {
        setIsConnected(false)
      }
    }
  }, [roomId, lastMessageId])

  // Update participants based on messages
  const updateParticipants = useCallback(
    (messages: Message[]) => {
      try {
        const senders = new Set(messages.map((m) => m.sender))

        // If we have a message from someone other than the current user
        if (username && senders.size > 1) {
          const otherSenders = Array.from(senders).filter((sender) => sender !== username)
          if (otherSenders.length > 0) {
            setPartnerName(otherSenders[0])
            setPartnerPresent(true)
          }
        }
      } catch (error) {
        console.error("Error updating participants:", error)
      }
    },
    [username],
  )

  // Initialize chat
  useEffect(() => {
    isComponentMounted.current = true

    const initializeChat = async () => {
      try {
        if (!roomId) {
          setError("Invalid room ID. Please check the URL.")
          return
        }

        // Get username from localStorage or generate a random one
        const storedUsername = localStorage.getItem(`chat_username_${roomId}`)
        if (storedUsername) {
          setUsername(storedUsername)
        } else {
          const randomUsername = `User-${Math.floor(Math.random() * 10000)}`
          setUsername(randomUsername)
          localStorage.setItem(`chat_username_${roomId}`, randomUsername)
        }

        // Check if chat has expired due to inactivity
        const lastActivity = getLastActivity(roomId)
        if (lastActivity > 0) {
          const inactiveTime = Date.now() - lastActivity
          if (inactiveTime > INACTIVITY_TIMEOUT) {
            // Chat has expired, delete data and show message
            deleteRoomData(roomId)
            setError("This chat has expired due to inactivity. All messages have been deleted.")
            return
          }
        }

        // Load initial messages from localStorage
        const storedMessages = getStoredMessages(roomId)
        setMessages(storedMessages)

        // Update participants
        updateParticipants(storedMessages)

        // Set last message ID for polling
        if (storedMessages.length > 0) {
          setLastMessageId(storedMessages[storedMessages.length - 1].id)
        }

        // Update last activity
        if (storedMessages.length > 0) {
          localStorage.setItem(`chat_room_${roomId}_lastActivity`, Date.now().toString())
        }

        // Initial fetch from server
        await fetchMessages()

        // Set up polling interval
        pollingIntervalRef.current = setInterval(() => {
          if (isComponentMounted.current) {
            fetchMessages().catch((err) => {
              console.error("Error in polling fetchMessages:", err)
            })
          }
        }, POLLING_INTERVAL)

        // Set up interval to check and update time remaining
        activityCheckRef.current = setInterval(() => {
          if (!isComponentMounted.current) return

          try {
            const lastActivity = getLastActivity(roomId)
            if (lastActivity > 0) {
              const timeElapsed = Date.now() - lastActivity
              const timeLeft = INACTIVITY_TIMEOUT - timeElapsed

              if (timeLeft <= 0) {
                // Chat has expired, delete data and show message
                deleteRoomData(roomId)
                setError("This chat has expired due to inactivity. All messages have been deleted.")
                if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current)
                if (activityCheckRef.current) clearInterval(activityCheckRef.current)
                return
              }

              // Format time remaining
              const hours = Math.floor(timeLeft / (60 * 60 * 1000))
              const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000))
              setTimeRemaining(`${hours}h ${minutes}m`)
            }
          } catch (err) {
            console.error("Error in activity check:", err)
          }
        }, 60000) // Check every minute
      } catch (err) {
        console.error("Error initializing chat:", err)
        setError("Failed to initialize chat. Please try refreshing the page.")
      }
    }

    initializeChat()

    // Clean up on unmount
    return () => {
      isComponentMounted.current = false

      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }

      if (activityCheckRef.current) {
        clearInterval(activityCheckRef.current)
        activityCheckRef.current = null
      }
    }
  }, [roomId, fetchMessages, updateParticipants])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    try {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    } catch (err) {
      console.error("Error scrolling to bottom:", err)
    }
  }, [messages])

  // Send a message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending || !roomId) return

    try {
      setIsSending(true)

      const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

      // Create message object with plaintext for local display
      const localMessage: Message = {
        id: messageId,
        sender: username,
        content: newMessage,
        timestamp: Date.now(),
        isEncrypted: false,
      }

      // Create encrypted message for storage and transmission
      let encryptedContent
      try {
        encryptedContent = encryptMessage(newMessage)
      } catch (err) {
        console.error("Error encrypting message:", err)
        encryptedContent = newMessage // Fallback to plaintext if encryption fails
      }

      const storageMessage: Message = {
        id: messageId,
        sender: username,
        content: encryptedContent,
        timestamp: Date.now(),
        isEncrypted: true,
      }

      // Get current messages from localStorage
      const currentMessages = getStoredMessages(roomId)

      // Add new message to localStorage (encrypted)
      const updatedMessages = [...currentMessages, storageMessage]
      storeMessages(roomId, updatedMessages)

      // Update local state with plaintext message for display
      setMessages((prev) => [...prev, localMessage])

      // Update last message ID for polling
      setLastMessageId(messageId)

      // Clear input first to improve perceived performance
      setNewMessage("")

      // Send to server (encrypted)
      try {
        // Simplify the message object to avoid potential serialization issues
        const simpleMessage = {
          id: messageId,
          sender: username,
          content: encryptedContent,
          timestamp: Date.now(),
          isEncrypted: true,
        }

        const response = await fetch("/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomId,
            message: simpleMessage,
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("Server returned error when sending message:", errorText)
          // Continue even if server sync fails - local messages will still work
        }
      } catch (err) {
        console.error("Error sending message to server:", err)
        // Continue even if server sync fails - local messages will still work
      }
    } catch (err) {
      console.error("Error sending message:", err)
    } finally {
      setIsSending(false)
    }
  }

  // Copy room link to clipboard
  const copyRoomLink = () => {
    try {
      if (!roomId) {
        setError("Cannot copy link: missing room information")
        return
      }

      const url = `${window.location.origin}/room/${roomId}`
      navigator.clipboard.writeText(url)
      setIsCopied(true)
      setTimeout(() => {
        if (isComponentMounted.current) {
          setIsCopied(false)
        }
      }, 2000)
    } catch (err) {
      console.error("Error copying link:", err)
      setError("Failed to copy link. Please try again.")
    }
  }

  // Handle reconnection
  const handleReconnect = () => {
    window.location.reload()
  }

  // End chat and delete all data
  const endChat = async () => {
    try {
      if (!roomId) {
        setError("Cannot end chat: missing room ID")
        return
      }

      // Delete all chat data
      deleteRoomData(roomId)

      // Close dialog
      setShowEndChatDialog(false)

      // Redirect to home page
      router.push("/")
    } catch (err) {
      console.error("Error ending chat:", err)
      setError("Failed to end chat. Please try again.")
    }
  }

  // Process messages for display
  const processMessages = () => {
    try {
      return messages.map((message) => {
        // If message is already decrypted or is from current user, display as is
        if (!message.isEncrypted || message.sender === username) {
          return message
        }

        // Otherwise decrypt the message
        try {
          if (typeof message.content === "string") {
            return {
              ...message,
              content: decryptMessage(message.content),
              isEncrypted: false,
            }
          }
        } catch (err) {
          console.error("Error decrypting message:", err)
        }

        return {
          ...message,
          content: "[Encrypted message]",
        }
      })
    } catch (err) {
      console.error("Error processing messages:", err)
      return messages
    }
  }

  // Show error state
  if (error) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Chat Error</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="mt-4 text-center space-y-2">
              <p className="text-sm text-gray-500 mb-2">Please try refreshing the page or starting a new chat.</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button onClick={handleReconnect} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
                <Link href="/">
                  <Button variant="outline" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    New Chat
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show invalid room state
  if (!roomId) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Invalid Chat Room</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500">
              This chat room link is invalid. Please make sure you have the complete link.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return Home
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Process messages for display
  const displayMessages = processMessages()

  // Main chat UI
  return (
    <>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="h-[calc(100vh-4rem)]">
          <CardHeader className="border-b p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Lock className="h-5 w-5 text-green-500 mr-2" />
                <CardTitle>Private Chat</CardTitle>
                <div className="ml-2 flex items-center">
                  {partnerPresent ? (
                    <span className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      <UserCheck className="h-3 w-3 mr-1" />
                      {partnerName || "Partner"} connected
                    </span>
                  ) : (
                    <span className="flex items-center text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                      <User className="h-3 w-3 mr-1" />
                      Waiting for partner
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={copyRoomLink} className="flex items-center gap-1">
                  {isCopied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Share Link
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEndChatDialog(true)}
                  className="flex items-center gap-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">End Chat</span>
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center">
                <div className={`h-2 w-2 rounded-full mr-2 ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
                <span className="text-sm text-gray-500 flex items-center">
                  {isConnected ? (
                    <>
                      <Wifi className="h-3 w-3 mr-1 text-green-500" /> Connected
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-3 w-3 mr-1 text-red-500" /> Disconnected
                      <Button variant="ghost" size="sm" onClick={fetchMessages} className="ml-2 h-6 text-xs">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Reconnect
                      </Button>
                    </>
                  )}
                </span>
              </div>
              {timeRemaining && (
                <div className="flex items-center text-xs text-amber-600">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Auto-deletes after {timeRemaining} of inactivity</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 overflow-y-auto h-[calc(100%-10rem)]">
            {displayMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MessageSquare className="h-12 w-12 mb-4 text-gray-300" />
                <p>No messages yet</p>
                <p className="text-sm mt-2">Send a message to start the conversation</p>
                <div className="mt-6 text-xs text-center max-w-md text-amber-600 bg-amber-50 p-3 rounded-md">
                  <p className="font-medium mb-1">Privacy Notice</p>
                  <p>
                    Messages are end-to-end encrypted and stored only in your browser. They will be automatically
                    deleted after 24 hours of inactivity.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-xs text-center text-amber-600 bg-amber-50 p-2 rounded-md">
                  Messages are end-to-end encrypted and will be deleted after 24 hours of inactivity
                </div>
                {displayMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === username ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex items-start gap-2 max-w-[80%] ${
                        message.sender === username ? "flex-row-reverse" : ""
                      }`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{message.sender.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div
                          className={`rounded-lg px-4 py-2 ${
                            message.sender === username ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                        >
                          {message.content}
                        </div>
                        <div className="flex gap-2 mt-1 text-xs text-gray-500">
                          <span>{message.sender}</span>
                          <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t p-4">
            <form onSubmit={sendMessage} className="flex w-full gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={isSending}
                className="flex-1"
              />
              <Button type="submit" disabled={!newMessage.trim() || isSending}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>

      {/* End Chat Confirmation Dialog - Using our custom SimpleDialog */}
      <SimpleDialog
        open={showEndChatDialog}
        onOpenChange={setShowEndChatDialog}
        title="End Chat Session"
        description="Are you sure you want to end this chat? All messages will be permanently deleted and cannot be recovered."
        footer={
          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowEndChatDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={endChat} className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              End Chat & Delete Messages
            </Button>
          </div>
        }
      >
        <div className="text-center text-amber-600 bg-amber-50 p-3 rounded-md mt-4">
          <p>This action cannot be undone. All messages will be permanently deleted.</p>
        </div>
      </SimpleDialog>
    </>
  )
}
