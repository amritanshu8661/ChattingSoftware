"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getPusherConfig } from "../actions/get-pusher-config"

export default function TestConnectionPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [result, setResult] = useState<any>(null)
  const [clientVars, setClientVars] = useState({
    cluster: false,
    available: false,
  })

  useEffect(() => {
    // Check client-side environment variables by fetching from our secure API
    const checkConfig = async () => {
      try {
        const config = await getPusherConfig()
        setClientVars({
          cluster: !!config.cluster,
          available: config.available,
        })
      } catch (error) {
        console.error("Error checking Pusher config:", error)
      }
    }

    checkConfig()
  }, [])

  const testConnection = async () => {
    setStatus("loading")
    try {
      const response = await fetch("/api/test-pusher")
      const data = await response.json()

      if (data.success) {
        setStatus("success")
      } else {
        setStatus("error")
      }

      setResult(data)
    } catch (error) {
      setStatus("error")
      setResult({ message: "Failed to connect to server" })
    }
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-lg">
      <Link href="/setup-guide" className="flex items-center text-sm mb-6 hover:underline">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Setup Guide
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Test Pusher Connection</CardTitle>
          <CardDescription>Verify that your Pusher environment variables are correctly configured</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Client-Side Variables</h3>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <span>Pusher Available</span>
                {clientVars.available ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Yes
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    <XCircle className="h-3 w-3 mr-1" /> No
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <span>Pusher Cluster</span>
                {clientVars.cluster ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Set
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    <XCircle className="h-3 w-3 mr-1" /> Missing
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Server-Side Test</h3>
            <p className="text-sm text-muted-foreground">
              Click the button below to test if all Pusher environment variables are correctly set up on the server.
            </p>

            {status === "success" && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Success!</AlertTitle>
                <AlertDescription className="text-green-700">{result?.message}</AlertDescription>
              </Alert>
            )}

            {status === "error" && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {result?.message}
                  {result?.missingVars && (
                    <div className="mt-2">
                      <p>Missing variables:</p>
                      <ul className="list-disc pl-5">
                        {result.missingVars.map((variable: string) => (
                          <li key={variable}>{variable}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result?.error && (
                    <div className="mt-2 text-xs font-mono bg-red-950 text-white p-2 rounded">{result.error}</div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/">Return Home</Link>
          </Button>
          <Button onClick={testConnection} disabled={status === "loading"}>
            {status === "loading" ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 mr-2" />
                Test Connection
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
