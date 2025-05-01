import { NextResponse } from "next/server"
import { PusherServer } from "@/lib/pusher-server"

export async function POST(request: Request) {
  try {
    const data = await request.formData()
    const socketId = data.get("socket_id") as string
    const channel = data.get("channel_name") as string

    if (!socketId || !channel) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // For presence channels, we need to provide user information
    // In a real app, you would get this from your auth system
    const presenceData = {
      user_id: `user-${Math.random().toString(36).substring(2, 9)}`,
      user_info: {
        name: `User-${Math.floor(Math.random() * 10000)}`,
      },
    }

    // Check if it's a presence channel
    if (channel.startsWith("presence-")) {
      const authResponse = PusherServer.authorizeChannel(socketId, channel, presenceData)
      return NextResponse.json(authResponse)
    } else {
      // For private channels
      const authResponse = PusherServer.authorizeChannel(socketId, channel)
      return NextResponse.json(authResponse)
    }
  } catch (error) {
    console.error("Pusher auth error:", error)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
