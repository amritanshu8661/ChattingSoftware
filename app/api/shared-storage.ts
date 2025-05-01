// This file provides backward compatibility for existing imports
// The actual storage is now handled directly in the message API

// Global message store for server-side message passing
export const globalMessageStore = global.messageStore || (global.messageStore = {})

// Counter for tracking access to the message store
export let accessCounter = global.accessCounter || (global.accessCounter = 0)

// Helper function to safely add a message to the store
export function addMessageToStore(roomId: string, message: any): void {
  // Initialize room if it doesn't exist
  if (!globalMessageStore[roomId]) {
    globalMessageStore[roomId] = []
  }

  // Add message to store
  globalMessageStore[roomId].push(message)

  // Increment access counter
  accessCounter++

  // Limit message history to prevent memory issues (keep last 100 messages)
  if (globalMessageStore[roomId].length > 100) {
    globalMessageStore[roomId] = globalMessageStore[roomId].slice(-100)
  }
}

// Helper function to safely get messages from the store
export function getMessagesFromStore(roomId: string, since?: string): any[] {
  // Increment access counter
  accessCounter++

  // Get messages for the room
  const roomMessages = globalMessageStore[roomId] || []

  // If 'since' parameter is provided, only return messages after that ID
  if (since) {
    const sinceIndex = roomMessages.findIndex((msg) => msg.id === since)
    if (sinceIndex !== -1) {
      return roomMessages.slice(sinceIndex + 1)
    }
  }

  return roomMessages
}
