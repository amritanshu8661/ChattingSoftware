import { NextResponse } from "next/server"
import { globalMessageStore, accessCounter } from "../shared-storage"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const roomId = url.searchParams.get("roomId")

    // Basic stats about the message store
    const stats = {
      totalRooms: Object.keys(globalMessageStore).length,
      accessCount: accessCounter,
      timestamp: new Date().toISOString(),
    }

    // If a specific room is requested, return details about that room
    if (roomId) {
      const roomMessages = globalMessageStore[roomId] || []
      return NextResponse.json({
        success: true,
        stats,
        roomId,
        messageCount: roomMessages.length,
        messages: roomMessages.map((msg) => ({
          id: msg.id,
          sender: msg.sender,
          timestamp: msg.timestamp,
          isEncrypted: msg.isEncrypted,
          // Don't include the actual content for privacy
          contentLength: msg.content ? msg.content.length : 0,
        })),
      })
    }

    // Otherwise return summary of all rooms
    return NextResponse.json({
      success: true,
      stats,
      rooms: Object.keys(globalMessageStore).map((roomId) => {
        const messages = globalMessageStore[roomId] || []
        return {
          roomId,
          messageCount: messages.length,
          lastMessageTime: messages.length > 0 ? new Date(messages[messages.length - 1].timestamp).toISOString() : null,
        }
      }),
    })
  } catch (error) {
    console.error("Error in debug endpoint:", error)
    return NextResponse.json({ error: "Debug endpoint error" }, { status: 500 })
  }
}
