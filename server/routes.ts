import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookSchema } from "@shared/schema";
import { extractBookDetailsFromImage } from "./services/gemini";
import multer from "multer";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Books CRUD operations
  app.get("/api/books", async (req, res) => {
    try {
      const books = await storage.getAllBooks();
      res.json(books);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch books" });
    }
  });

  app.get("/api/books/:id", async (req, res) => {
    try {
      const book = await storage.getBookById(req.params.id);
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
      res.json(book);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch book" });
    }
  });

  app.post("/api/books", async (req, res) => {
    try {
      const validatedData = insertBookSchema.parse(req.body);
      const book = await storage.createBook(validatedData);
      res.status(201).json(book);
    } catch (error) {
      res.status(400).json({ error: "Invalid book data" });
    }
  });

  app.put("/api/books/:id", async (req, res) => {
    try {
      const validatedData = insertBookSchema.partial().parse(req.body);
      const book = await storage.updateBook(req.params.id, validatedData);
      res.json(book);
    } catch (error) {
      if (error instanceof Error && error.message === "Book not found") {
        res.status(404).json({ error: "Book not found" });
      } else {
        res.status(400).json({ error: "Invalid book data" });
      }
    }
  });

  app.delete("/api/books/:id", async (req, res) => {
    try {
      await storage.deleteBook(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete book" });
    }
  });

  // Search books
  app.get("/api/books/search/:query", async (req, res) => {
    try {
      const books = await storage.searchBooks(req.params.query);
      res.json(books);
    } catch (error) {
      res.status(500).json({ error: "Failed to search books" });
    }
  });

  // OCR endpoint for book cover analysis
  app.post("/api/ocr/analyze", upload.single("image"), async (req: Request & { file?: Express.Multer.File }, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const imageBase64 = req.file.buffer.toString("base64");
      const bookDetails = await extractBookDetailsFromImage(imageBase64);
      
      res.json(bookDetails);
    } catch (error) {
      console.error("OCR analysis failed:", error);
      res.status(500).json({ error: "Failed to analyze image" });
    }
  });

  // Check for duplicate books
  app.post("/api/books/check-duplicate", async (req, res) => {
    try {
      const { title, author } = req.body;
      if (!title) {
        return res.status(400).json({ error: "Title is required" });
      }

      const allBooks = await storage.getAllBooks();
      const duplicates = allBooks.filter(book => {
        const titleMatch = book.title.toLowerCase().trim() === title.toLowerCase().trim();
        const authorMatch = author && book.author ? 
          book.author.toLowerCase().trim() === author.toLowerCase().trim() : false;
        
        return titleMatch || (titleMatch && authorMatch);
      });

      res.json({
        isDuplicate: duplicates.length > 0,
        matches: duplicates
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to check for duplicates" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
