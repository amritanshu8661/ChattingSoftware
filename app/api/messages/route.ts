import { NextResponse } from "next/server"
import { addMessageToStore, getMessagesFromStore } from "../shared-storage"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const roomId = url.searchParams.get("roomId")
    const since = url.searchParams.get("since")

    if (!roomId) {
      return NextResponse.json({ error: "Room ID is required" }, { status: 400 })
    }

    // Get messages for the room using the helper function
    const messages = getMessagesFromStore(roomId, since || undefined)

    return NextResponse.json({
      success: true,
      messages,
      total: messages.length,
      timestamp: Date.now(), // Add timestamp for debugging
    })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { roomId, message } = data

    if (!roomId || !message) {
      return NextResponse.json({ error: "Room ID and message are required" }, { status: 400 })
    }

    // Add message to store using the helper function
    addMessageToStore(roomId, message)

    return NextResponse.json({
      success: true,
      messageId: message.id,
      timestamp: Date.now(), // Add timestamp for debugging
    })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}

// Delete all messages for a room
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const roomId = url.searchParams.get("roomId")

    if (!roomId) {
      return NextResponse.json({ error: "Room ID is required" }, { status: 400 })
    }

    // Delete room messages
    if (
      typeof globalThis !== "undefined" &&
      (globalThis as any).globalMessageStore &&
      roomId in (globalThis as any).globalMessageStore
    ) {
      delete (globalThis as any).globalMessageStore[roomId]
    }

    return NextResponse.json({
      success: true,
      message: "All messages deleted",
    })
  } catch (error) {
    console.error("Error deleting messages:", error)
    return NextResponse.json({ error: "Failed to delete messages" }, { status: 500 })
  }
}
