import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, ExternalLink } from "lucide-react"

export default function SetupGuidePage() {
  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Pusher Setup Guide</h1>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Create a Pusher Account</CardTitle>
            <CardDescription>Sign up for a Pusher account and create a Channels app</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                Go to{" "}
                <Link
                  href="https://pusher.com/"
                  className="text-primary underline inline-flex items-center"
                  target="_blank"
                >
                  Pusher.com <ExternalLink className="h-3 w-3 ml-1" />
                </Link>{" "}
                and sign up for an account
              </li>
              <li>Once logged in, click on "Create app" button</li>
              <li>Give your app a name (e.g., "SecureWebChat")</li>
              <li>Select a cluster closest to your location</li>
              <li>Choose "Channels" as the product</li>
              <li>Select "JavaScript" as the frontend tech and "Node.js" as the backend tech</li>
              <li>Click "Create app"</li>
            </ol>

            <div className="rounded-md overflow-hidden border mt-4">
              <Image
                src="/pusher-app-interface.png"
                alt="Pusher App Creation"
                width={600}
                height={300}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Step 2: Get Your Pusher Credentials</CardTitle>
            <CardDescription>Find your app credentials in the Pusher dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>In your app dashboard, you'll find the following credentials that you need:</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-md">
                <p className="font-semibold">App ID</p>
                <p className="text-sm text-muted-foreground">Used for PUSHER_APP_ID</p>
              </div>
              <div className="p-4 bg-muted rounded-md">
                <p className="font-semibold">Key</p>
                <p className="text-sm text-muted-foreground">Used for PUSHER_KEY</p>
              </div>
              <div className="p-4 bg-muted rounded-md">
                <p className="font-semibold">Secret</p>
                <p className="text-sm text-muted-foreground">Used for PUSHER_SECRET</p>
              </div>
              <div className="p-4 bg-muted rounded-md">
                <p className="font-semibold">Cluster</p>
                <p className="text-sm text-muted-foreground">Used for PUSHER_CLUSTER</p>
              </div>
            </div>

            <div className="rounded-md overflow-hidden border mt-4">
              <Image
                src="/generic-dashboard-login.png"
                alt="Pusher Credentials"
                width={600}
                height={300}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Step 3: Add Environment Variables</CardTitle>
            <CardDescription>Add your Pusher credentials as environment variables</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Add the following environment variables to your project:</p>

            <div className="bg-black text-white p-4 rounded-md font-mono text-sm overflow-x-auto">
              <p>PUSHER_KEY=your_pusher_key</p>
              <p>PUSHER_CLUSTER=your_pusher_cluster</p>
              <p>PUSHER_APP_ID=your_pusher_app_id</p>
              <p>PUSHER_SECRET=your_pusher_secret</p>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Make sure to replace the placeholder values with your actual Pusher credentials.
              </AlertDescription>
            </Alert>

            <h4 className="font-semibold mt-6">Option 1: Using .env.local file (Development)</h4>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                Create a file named <code>.env.local</code> in the root of your project
              </li>
              <li>Add the environment variables listed above to this file</li>
              <li>Restart your development server</li>
            </ol>

            <h4 className="font-semibold mt-6">Option 2: Using Vercel Environment Variables (Production)</h4>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Go to your project settings in the Vercel dashboard</li>
              <li>Navigate to the "Environment Variables" section</li>
              <li>Add each of the variables listed above</li>
              <li>Deploy your project again to apply the changes</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Step 4: Verify Setup</CardTitle>
            <CardDescription>Test that your Pusher integration is working correctly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>To verify that your Pusher setup is working:</p>

            <ol className="list-decimal pl-5 space-y-2">
              <li>Open your chat application in two different browser windows or devices</li>
              <li>Create a chat room in one window and copy the link</li>
              <li>Open the link in the second window</li>
              <li>Send messages between the windows</li>
              <li>Check that messages appear in both windows in real-time</li>
            </ol>

            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Success Indicators</AlertTitle>
              <AlertDescription className="text-green-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>You see "Connected" status in the chat room</li>
                  <li>Messages sent from one window appear in the other</li>
                  <li>No error messages in the browser console</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="mt-6">
              <Link href="/">
                <Button>Return to Home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
