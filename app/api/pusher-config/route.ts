import { NextResponse } from "next/server"
import { PusherServer } from "@/lib/pusher-server"

export async function GET() {
  try {
    // Check if Pusher is available in this environment
    const isPusherAvailable = PusherServer.isAvailable()

    // Only return the public key and cluster if Pusher is available
    if (isPusherAvailable) {
      return NextResponse.json({
        // Only return the cluster, not the key
        cluster: process.env.PUSHER_CLUSTER || "eu",
        available: true,
      })
    } else {
      // Return a response indicating Pusher is not available
      return NextResponse.json({
        available: false,
        message: "Pusher is not available in this environment",
      })
    }
  } catch (error) {
    console.error("Error in Pusher config endpoint:", error)
    // If there's any error, indicate Pusher is not available
    return NextResponse.json({
      available: false,
      message: "Error checking Pusher availability",
    })
  }
}
