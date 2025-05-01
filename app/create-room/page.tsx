"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, Shield, Lock, Copy, Check } from "lucide-react"
import { generateRoomId } from "@/lib/crypto"

export default function CreateRoomPage() {
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [roomCreated, setRoomCreated] = useState(false)
  const [secretLink, setSecretLink] = useState("")
  const [isCopied, setIsCopied] = useState(false)
  const [username, setUsername] = useState("")
  const router = useRouter()

  const createRoom = async () => {
    if (!username.trim()) {
      setError("Please enter a username")
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      // Generate a secure room ID
      const roomId = generateRoomId()

      // Create the secret link
      const link = `${window.location.origin}/room/${roomId}`
      setSecretLink(link)

      // Store username in localStorage
      localStorage.setItem(`chat_username_${roomId}`, username)

      // Register the room with the server
      await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomId }),
      })

      setRoomCreated(true)
      setIsCreating(false)
    } catch (error) {
      console.error("Error creating room:", error)
      setError("Failed to create room. Please try again.")
      setIsCreating(false)
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(secretLink)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const joinRoom = () => {
    router.push(secretLink)
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-center">Create a Private Chat</CardTitle>
          <CardDescription className="text-center">
            {!roomCreated
              ? "Enter your name and create a secure chat room to share with one person."
              : "Your secure chat room is ready! Share this secret code with one person."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!roomCreated ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <Input
                  id="username"
                  placeholder="Enter your name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                <Lock className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">End-to-End Encrypted</p>
                  <p className="text-xs text-muted-foreground">Messages are encrypted in your browser</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                <Shield className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Private Connection</p>
                  <p className="text-xs text-muted-foreground">Only someone with the secret code can join</p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-md">
                <p className="text-sm font-medium mb-1">Secret Link (Share with one person)</p>
                <div className="flex items-center">
                  <div className="bg-background p-2 rounded border flex-1 overflow-hidden">
                    <p className="text-sm truncate">{secretLink}</p>
                  </div>
                  <Button variant="outline" size="icon" className="ml-2" onClick={copyLink}>
                    {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="bg-amber-50 p-3 rounded-md">
                <p className="text-sm text-amber-800">
                  <strong>Important:</strong> Share this secret link with only one person. Anyone with this link can
                  access your chat.
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          {!roomCreated ? (
            <Button className="w-full" onClick={createRoom} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Secure Room...
                </>
              ) : (
                "Create Private Chat Room"
              )}
            </Button>
          ) : (
            <div className="w-full space-y-2">
              <Button className="w-full" onClick={joinRoom}>
                Join Chat Room
              </Button>
              <Button variant="outline" className="w-full" onClick={copyLink}>
                {isCopied ? "Copied!" : "Copy Secret Link"}
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
