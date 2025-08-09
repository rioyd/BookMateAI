import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "AIzaSyBCF8WivpTRnUhOz_Wzf6xmz2xITW9ggBk" 
});

export interface BookCoverData {
  coverImageUrl?: string;
  description?: string;
  confidence: number;
}

export async function generateBookCoverDescription(title: string, author?: string): Promise<BookCoverData> {
  try {
    const bookInfo = author ? `"${title}" by ${author}` : `"${title}"`;
    
    const prompt = `Generate a detailed visual description for the book cover of ${bookInfo}. 
    Focus on:
    - Typography and title design
    - Color scheme and visual style
    - Key visual elements or imagery
    - Overall aesthetic and mood
    
    Respond with JSON in this format:
    {"description": "detailed cover description", "confidence": 0.85}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            description: { type: "string" },
            confidence: { type: "number" },
          },
          required: ["description", "confidence"],
        },
      },
      contents: [prompt],
    });

    const rawJson = response.text;
    console.log(`Book cover description for "${title}": ${rawJson}`);

    if (rawJson) {
      const data = JSON.parse(rawJson);
      return {
        description: data.description,
        confidence: data.confidence,
      };
    } else {
      throw new Error("Empty response from Gemini");
    }
  } catch (error) {
    console.error("Failed to generate book cover description:", error);
    return {
      confidence: 0,
      description: undefined,
    };
  }
}

// Function to get book cover from Open Library API as fallback
export async function getBookCoverFromOpenLibrary(title: string, author?: string): Promise<string | null> {
  try {
    const searchQuery = author ? `${title} ${author}` : title;
    const searchUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery)}&limit=1`;
    
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    if (data.docs && data.docs.length > 0) {
      const book = data.docs[0];
      if (book.cover_i) {
        return `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Failed to fetch from Open Library:", error);
    return null;
  }
}