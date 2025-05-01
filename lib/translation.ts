// Supported languages with their codes and names
export const supportedLanguages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ar", name: "Arabic" },
  { code: "ru", name: "Russian" },
  { code: "pt", name: "Portuguese" },
  { code: "it", name: "Italian" },
  { code: "nl", name: "Dutch" },
  { code: "hi", name: "Hindi" },
  { code: "tr", name: "Turkish" },
  { code: "vi", name: "Vietnamese" },
]

// Function to detect the language of a text
export async function detectLanguage(text: string): Promise<string> {
  try {
    const response = await fetch("/api/detect-language", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    })

    if (!response.ok) {
      throw new Error("Language detection failed")
    }

    const data = await response.json()
    return data.languageCode || "en"
  } catch (error) {
    console.error("Error detecting language:", error)
    return "en" // Default to English on error
  }
}

// Function to translate text
export async function translateText(text: string, sourceLanguage: string, targetLanguage: string): Promise<string> {
  try {
    // Skip translation if languages are the same
    if (sourceLanguage === targetLanguage) {
      return text
    }

    const response = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        sourceLanguage,
        targetLanguage,
      }),
    })

    if (!response.ok) {
      throw new Error("Translation failed")
    }

    const data = await response.json()
    return data.translatedText || text
  } catch (error) {
    console.error("Error translating text:", error)
    return text // Return original text on error
  }
}

// Get language name from code
export function getLanguageName(code: string): string {
  const language = supportedLanguages.find((lang) => lang.code === code)
  return language ? language.name : code
}
