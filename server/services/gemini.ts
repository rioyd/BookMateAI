import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "AIzaSyBCF8WivpTRnUhOz_Wzf6xmz2xITW9ggBk" 
});

export interface BookDetails {
  title: string;
  author?: string;
  confidence: number;
}

export async function extractBookDetailsFromImage(imageBase64: string): Promise<BookDetails> {
  try {
    const systemPrompt = `You are an expert at extracting book information from book cover images.
Analyze the image and extract the book title and author name.
Respond with JSON in this exact format:
{"title": "Book Title", "author": "Author Name", "confidence": 0.95}

Guidelines:
- Extract the main title of the book (not subtitle)
- Extract the author's name if visible
- Set confidence between 0 and 1 based on text clarity
- If you can't find the title, set title to empty string
- If you can't find author, set author to empty string or null`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            title: { type: "string" },
            author: { type: "string" },
            confidence: { type: "number" },
          },
          required: ["title", "confidence"],
        },
      },
      contents: [
        {
          inlineData: {
            data: imageBase64,
            mimeType: "image/jpeg",
          },
        },
        "Extract the book title and author from this book cover image.",
      ],
    });

    const rawJson = response.text;
    console.log(`Gemini OCR response: ${rawJson}`);

    if (rawJson) {
      const data: BookDetails = JSON.parse(rawJson);
      return data;
    } else {
      throw new Error("Empty response from Gemini");
    }
  } catch (error) {
    console.error("Failed to extract book details:", error);
    throw new Error(`Failed to extract book details: ${error}`);
  }
}
