import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Lock, Shield } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Lock className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Private Two-Person Chat
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Create a secure chat room, share the secret code with one person, and start a private conversation.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full mt-8">
                <Card className="bg-background border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-center mb-4">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Lock className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-center mb-2">End-to-End Encrypted</h3>
                    <p className="text-sm text-gray-500 text-center">
                      Messages are encrypted in your browser. Only you and your chat partner can read them.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-background border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-center mb-4">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Shield className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-center mb-2">No Registration</h3>
                    <p className="text-sm text-gray-500 text-center">
                      No accounts, no emails. Just create a room and share the secret code.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4 mt-8">
                <Link href="/create-room">
                  <Button className="px-8">
                    Create a Private Chat
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <p className="text-sm text-gray-500 mt-2">
                  Create a room, share the secret code, and start chatting instantly.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Your privacy matters. All messages are end-to-end encrypted and automatically deleted after 24 hours.
          </p>
        </div>
      </footer>
    </div>
  )
}
