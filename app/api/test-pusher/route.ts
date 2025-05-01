import { NextResponse } from "next/server"
import { PusherServer } from "@/lib/pusher-server"

export async function GET() {
  try {
    // Check if Pusher environment variables are set
    const appId = process.env.PUSHER_APP_ID
    const key = process.env.PUSHER_KEY
    const secret = process.env.PUSHER_SECRET
    const cluster = process.env.PUSHER_CLUSTER

    const missingVars = []
    if (!appId) missingVars.push("PUSHER_APP_ID")
    if (!key) missingVars.push("PUSHER_KEY")
    if (!secret) missingVars.push("PUSHER_SECRET")
    if (!cluster) missingVars.push("PUSHER_CLUSTER")

    if (missingVars.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing environment variables",
          missingVars,
        },
        { status: 400 },
      )
    }

    // Try to trigger a test event to verify Pusher is working
    try {
      await PusherServer.trigger("test-channel", "test-event", {
        message: "Pusher is working correctly!",
        timestamp: new Date().toISOString(),
      })

      return NextResponse.json({
        success: true,
        message: "Pusher is configured correctly!",
        config: {
          appId: "✓ Set",
          key: "✓ Set",
          secret: "✓ Set",
          cluster: "✓ Set",
        },
      })
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          message: "Pusher configuration error",
          error: error.message || "Unknown error",
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: error.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}
