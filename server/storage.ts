import { type User, type InsertUser, type Book, type InsertBook } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Book operations
  getAllBooks(): Promise<Book[]>;
  getBookById(id: string): Promise<Book | undefined>;
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: string, book: Partial<InsertBook>): Promise<Book>;
  deleteBook(id: string): Promise<void>;
  searchBooks(query: string): Promise<Book[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private books: Map<string, Book>;

  constructor() {
    this.users = new Map();
    this.books = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllBooks(): Promise<Book[]> {
    return Array.from(this.books.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getBookById(id: string): Promise<Book | undefined> {
    return this.books.get(id);
  }

  async createBook(insertBook: InsertBook): Promise<Book> {
    const id = randomUUID();
    const book: Book = {
      ...insertBook,
      id,
      author: insertBook.author ?? null,
      isRead: insertBook.isRead ?? false,
      createdAt: new Date(),
    };
    this.books.set(id, book);
    return book;
  }

  async updateBook(id: string, updateData: Partial<InsertBook>): Promise<Book> {
    const existingBook = this.books.get(id);
    if (!existingBook) {
      throw new Error("Book not found");
    }
    
    const updatedBook: Book = {
      ...existingBook,
      ...updateData,
    };
    
    this.books.set(id, updatedBook);
    return updatedBook;
  }

  async deleteBook(id: string): Promise<void> {
    this.books.delete(id);
  }

  async searchBooks(query: string): Promise<Book[]> {
    const allBooks = await this.getAllBooks();
    const lowercaseQuery = query.toLowerCase();
    
    return allBooks.filter(book => 
      book.title.toLowerCase().includes(lowercaseQuery) ||
      (book.author && book.author.toLowerCase().includes(lowercaseQuery))
    );
  }
}

export const storage = new MemStorage();
