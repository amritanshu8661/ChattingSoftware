"use client"

import { useState, useEffect, useRef } from "react"
import Pusher from "pusher-js"

export function usePusher(roomId: string) {
  const [channel, setChannel] = useState<Pusher.Channel | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [pusherAvailable, setPusherAvailable] = useState(true)
  const isComponentMounted = useRef(true)
  const pusherRef = useRef<Pusher | null>(null)
  const connectionAttempted = useRef(false)

  useEffect(() => {
    isComponentMounted.current = true

    // Cleanup function to be called on unmount
    const cleanup = () => {
      isComponentMounted.current = false

      if (pusherRef.current) {
        try {
          const channelName = `chat-room-${roomId}`
          pusherRef.current.unsubscribe(channelName)
          pusherRef.current.disconnect()
          pusherRef.current = null
        } catch (e) {
          console.error("Error during Pusher cleanup:", e)
        }
      }
    }

    // Skip if not in browser or no roomId or already attempted connection
    if (typeof window === "undefined" || !roomId || connectionAttempted.current) {
      return cleanup
    }

    connectionAttempted.current = true

    // Fetch Pusher configuration from the server
    const initializePusher = async () => {
      try {
        const response = await fetch("/api/pusher-config")
        if (!response.ok) {
          console.warn("Failed to fetch Pusher config, using polling fallback")
          setPusherAvailable(false)
          return
        }

        const config = await response.json()

        // If the server indicates Pusher is not available, use polling fallback
        if (!config.available || !config.key) {
          console.warn("Pusher not available according to server config, using polling fallback")
          setPusherAvailable(false)
          return
        }

        // Initialize Pusher with error handling
        try {
          pusherRef.current = new Pusher(config.key, {
            cluster: config.cluster || "eu",
            forceTLS: true,
          })

          // Handle connection state changes
          pusherRef.current.connection.bind("connected", () => {
            console.log("Pusher connected")
            if (isComponentMounted.current) {
              setIsConnected(true)
            }
          })

          pusherRef.current.connection.bind("disconnected", () => {
            console.log("Pusher disconnected")
            if (isComponentMounted.current) {
              setIsConnected(false)
            }
          })

          pusherRef.current.connection.bind("error", (err: any) => {
            console.error("Pusher connection error:", err)
            if (isComponentMounted.current) {
              setIsConnected(false)

              // If we get a crypto error, mark Pusher as unavailable
              if (err && err.toString().includes("crypto")) {
                setPusherAvailable(false)

                // Clean up Pusher instance
                if (pusherRef.current) {
                  pusherRef.current.disconnect()
                  pusherRef.current = null
                }
              }
            }
          })

          // Subscribe to the room channel
          const channelName = `chat-room-${roomId}`
          const channelInstance = pusherRef.current.subscribe(channelName)

          if (isComponentMounted.current) {
            setChannel(channelInstance)
          }
        } catch (err) {
          console.error("Error setting up Pusher client:", err)
          setPusherAvailable(false)
        }
      } catch (err) {
        console.error("Error setting up Pusher:", err)
        setPusherAvailable(false)
      }
    }

    initializePusher()
    return cleanup
  }, [roomId])

  return { channel, isConnected, pusherAvailable }
}
