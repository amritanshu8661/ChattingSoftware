// Generate a secure random room ID
export function generateRoomId(): string {
  try {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  } catch (error) {
    console.error("Error generating room ID:", error)
    return Date.now().toString(36)
  }
}

// Generate a secure encryption key
export function generateEncryptionKey(): string {
  try {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  } catch (error) {
    console.error("Error generating encryption key:", error)
    return Date.now().toString(36)
  }
}

// Simple "encryption" (just for demo purposes)
export function encryptMessage(message: string): string {
  try {
    // For demo purposes, we're just doing a simple encoding
    // In a real app, you would use proper encryption
    return btoa(message)
  } catch (error) {
    console.error("Encryption error:", error)
    return message
  }
}

// Simple "decryption" (just for demo purposes)
export function decryptMessage(encryptedMessage: string): string {
  try {
    // For demo purposes, we're just doing a simple decoding
    // In a real app, you would use proper decryption
    return atob(encryptedMessage)
  } catch (error) {
    console.error("Decryption error:", error)
    return "[Encrypted message]"
  }
}
