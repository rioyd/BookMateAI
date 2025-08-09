import { apiRequest } from "./queryClient";
import type { Book, InsertBook } from "@shared/schema";

export interface BookDetails {
  title: string;
  author?: string;
  confidence: number;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  matches: Book[];
}

export interface BookCoverResult {
  coverUrl?: string;
  description?: string;
  confidence?: number;
  source: "openlibrary" | "ai-generated";
}

export const booksApi = {
  getAll: (): Promise<Book[]> =>
    fetch("/api/books").then(res => res.json()),

  create: (book: InsertBook): Promise<Book> =>
    apiRequest("POST", "/api/books", book).then(res => res.json()),

  update: (id: string, book: Partial<InsertBook>): Promise<Book> =>
    apiRequest("PUT", `/api/books/${id}`, book).then(res => res.json()),

  delete: (id: string): Promise<void> =>
    apiRequest("DELETE", `/api/books/${id}`).then(() => {}),

  search: (query: string): Promise<Book[]> =>
    fetch(`/api/books/search/${encodeURIComponent(query)}`).then(res => res.json()),

  analyzeImage: async (imageFile: File): Promise<BookDetails> => {
    const formData = new FormData();
    formData.append("image", imageFile);
    
    const response = await fetch("/api/ocr/analyze", {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error("Failed to analyze image");
    }
    
    return response.json();
  },

  checkDuplicate: (title: string, author?: string): Promise<DuplicateCheckResult> =>
    apiRequest("POST", "/api/books/check-duplicate", { title, author }).then(res => res.json()),

  getBookCover: (bookId: string): Promise<BookCoverResult> =>
    fetch(`/api/books/${bookId}/cover`).then(res => res.json()),
};
