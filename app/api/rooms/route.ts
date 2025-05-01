import { NextResponse } from "next/server"

// In-memory room store (in a real app, you'd use a database)
const roomStore: Record<string, { created: number }> = {}

export async function POST(request: Request) {
  try {
    const { roomId } = await request.json()

    if (!roomId) {
      return NextResponse.json({ error: "Room ID is required" }, { status: 400 })
    }

    // Store room information
    roomStore[roomId] = {
      created: Date.now(),
    }

    // Clean up old rooms (keep only rooms created in the last 24 hours)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    Object.keys(roomStore).forEach((id) => {
      if (roomStore[id].created < oneDayAgo) {
        delete roomStore[id]
      }
    })

    return NextResponse.json({ success: true, roomId })
  } catch (error) {
    console.error("Error creating room:", error)
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const roomId = url.searchParams.get("roomId")

    if (!roomId) {
      return NextResponse.json({ error: "Room ID is required" }, { status: 400 })
    }

    // Check if room exists
    const roomExists = roomId in roomStore

    return NextResponse.json({
      success: true,
      exists: roomExists,
      created: roomExists ? roomStore[roomId].created : null,
    })
  } catch (error) {
    console.error("Error checking room:", error)
    return NextResponse.json({ error: "Failed to check room" }, { status: 500 })
  }
}
