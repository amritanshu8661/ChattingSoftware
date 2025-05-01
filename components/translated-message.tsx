"use client"

import { useState } from "react"
import { Loader2, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TranslatedMessageProps {
  content: string
  sourceLanguage?: string
  targetLanguage?: string
  isOwnMessage: boolean
}

export function TranslatedMessage({
  content,
  sourceLanguage = "en",
  targetLanguage = "en",
  isOwnMessage,
}: TranslatedMessageProps) {
  const [translatedContent, setTranslatedContent] = useState<string | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Skip translation if languages are the same or it's the user's own message
  const needsTranslation = sourceLanguage !== targetLanguage && !isOwnMessage

  const handleTranslate = async () => {
    if (isTranslating || translatedContent) return

    setIsTranslating(true)
    setError(null)

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: content,
          sourceLanguage,
          targetLanguage,
        }),
      })

      if (!response.ok) {
        throw new Error("Translation failed")
      }

      const data = await response.json()
      setTranslatedContent(data.translatedText || content)
    } catch (err) {
      console.error("Translation error:", err)
      setError("Failed to translate")
      setTranslatedContent(content) // Use original content as fallback
    } finally {
      setIsTranslating(false)
    }
  }

  const toggleView = () => {
    setShowOriginal(!showOriginal)
  }

  // If no translation needed, just show the content
  if (!needsTranslation) {
    return <div>{content}</div>
  }

  return (
    <div className="space-y-1">
      {/* Show either original or translated content */}
      <div>{showOriginal ? content : translatedContent || content}</div>

      {/* Translation controls */}
      <div className="flex items-center gap-1 text-xs">
        {isTranslating ? (
          <div className="flex items-center text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
            Translating...
          </div>
        ) : translatedContent ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-5 px-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={toggleView}
          >
            <Globe className="h-3 w-3 mr-1" />
            {showOriginal ? "Show translation" : "Show original"}
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-5 px-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={handleTranslate}
          >
            <Globe className="h-3 w-3 mr-1" />
            Translate
          </Button>
        )}

        {error && <span className="text-red-500 text-xs">{error}</span>}
      </div>
    </div>
  )
}
