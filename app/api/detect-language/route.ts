import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    // Simple language detection based on common words and characters
    // This is just a demo - use a proper language detection service in production
    const languagePatterns = [
      { pattern: /\b(the|and|is|in|to|of|a|for|that|this)\b/gi, code: "en" }, // English
      { pattern: /\b(el|la|los|las|y|en|de|que|es|por)\b/gi, code: "es" }, // Spanish
      { pattern: /\b(le|la|les|et|en|de|que|est|pour|dans)\b/gi, code: "fr" }, // French
      { pattern: /\b(der|die|das|und|in|zu|den|dem|von|für)\b/gi, code: "de" }, // German
      { pattern: /[\u4e00-\u9fff]/, code: "zh" }, // Chinese
    ]

    // Count matches for each language
    const matches = languagePatterns.map((lang) => {
      const match = text.match(lang.pattern)
      return {
        code: lang.code,
        count: match ? match.length : 0,
      }
    })

    // Find the language with the most matches
    const detectedLanguage = matches.reduce((prev, current) => (current.count > prev.count ? current : prev), {
      code: "en",
      count: 0,
    })

    // Default to English if no matches or very few matches
    const languageCode = detectedLanguage.count > 1 ? detectedLanguage.code : "en"

    return NextResponse.json({
      success: true,
      languageCode,
    })
  } catch (error) {
    console.error("Error detecting language:", error)
    return NextResponse.json({ error: "Failed to detect language" }, { status: 500 })
  }
}
