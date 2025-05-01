import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { text, sourceLanguage, targetLanguage } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    // Skip translation if languages are the same
    if (sourceLanguage === targetLanguage) {
      return NextResponse.json({
        success: true,
        translatedText: text,
        sourceLanguage,
        targetLanguage,
      })
    }

    // Simple mock translation - in a real app, you would use a translation API
    const translatedText = mockTranslate(text, targetLanguage)

    return NextResponse.json({
      success: true,
      translatedText,
      sourceLanguage,
      targetLanguage,
    })
  } catch (error) {
    console.error("Error translating text:", error)
    return NextResponse.json({ error: "Failed to translate text" }, { status: 500 })
  }
}

// Simple mock translation function
function mockTranslate(text: string, targetLanguage: string): string {
  const translations: Record<string, Record<string, string>> = {
    en: {
      hello: "hello",
      hi: "hi",
      goodbye: "goodbye",
      thanks: "thank you",
    },
    es: {
      hello: "hola",
      hi: "hola",
      goodbye: "adiós",
      thanks: "gracias",
    },
    fr: {
      hello: "bonjour",
      hi: "salut",
      goodbye: "au revoir",
      thanks: "merci",
    },
    de: {
      hello: "hallo",
      hi: "hallo",
      goodbye: "auf wiedersehen",
      thanks: "danke",
    },
    zh: {
      hello: "你好",
      hi: "嗨",
      goodbye: "再见",
      thanks: "谢谢",
    },
  }

  // Add language prefix for demo purposes
  return `[${targetLanguage}] ${text}`
}
