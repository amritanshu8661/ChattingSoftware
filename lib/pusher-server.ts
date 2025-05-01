import Pusher from "pusher"

// Flag to track if we've already detected the crypto issue
let cryptoIssueDetected = false

// Simplified Pusher server implementation with better error handling
export const PusherServer = {
  trigger: async (channel: string, event: string, data: any): Promise<void> => {
    // If we've already detected the crypto issue, skip Pusher entirely
    if (cryptoIssueDetected) {
      console.log(`Skipping Pusher trigger for ${event} on ${channel} (crypto not available)`)
      return Promise.resolve()
    }

    try {
      // Check if all required env vars are present
      if (
        !process.env.PUSHER_APP_ID ||
        !process.env.PUSHER_SECRET ||
        !process.env.PUSHER_KEY ||
        !process.env.PUSHER_CLUSTER
      ) {
        console.log(`Skipping Pusher trigger for ${event} on ${channel} (missing env vars)`)
        return Promise.resolve()
      }

      // Create a new Pusher instance for each request to avoid shared state issues
      const pusher = new Pusher({
        appId: process.env.PUSHER_APP_ID,
        key: process.env.PUSHER_KEY,
        secret: process.env.PUSHER_SECRET,
        cluster: process.env.PUSHER_CLUSTER,
        useTLS: true,
      })

      await pusher.trigger(channel, event, data)
    } catch (error) {
      // Check specifically for the crypto.createHash error
      if (error.message && error.message.includes("crypto.createHash is not implemented")) {
        // Mark that we've detected the crypto issue to avoid future attempts
        cryptoIssueDetected = true
        console.warn(
          "crypto.createHash is not available in this environment. Disabling Pusher and using polling fallback.",
        )
      } else {
        console.error(`Error triggering Pusher event ${event}:`, error)
      }
    }

    return Promise.resolve()
  },

  // Helper method to check if Pusher is available
  isAvailable: (): boolean => {
    // If we've already detected the crypto issue, Pusher is not available
    if (cryptoIssueDetected) {
      return false
    }

    return !!(
      process.env.PUSHER_APP_ID &&
      process.env.PUSHER_KEY &&
      process.env.PUSHER_SECRET &&
      process.env.PUSHER_CLUSTER
    )
  },
}
