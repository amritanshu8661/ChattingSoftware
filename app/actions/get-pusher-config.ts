"use server"

export async function getPusherConfig() {
  try {
    return {
      cluster: process.env.PUSHER_CLUSTER || "eu",
      available: !!(
        process.env.PUSHER_APP_ID &&
        process.env.PUSHER_KEY &&
        process.env.PUSHER_SECRET &&
        process.env.PUSHER_CLUSTER
      ),
    }
  } catch (error) {
    console.error("Error getting Pusher config:", error)
    return {
      available: false,
      error: "Failed to get Pusher configuration",
    }
  }
}
