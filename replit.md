# BookMate - Personal Library Tracker

## Overview

BookMate is a personal library and reading tracker application designed for book enthusiasts who frequently buy books but forget to read them. The app helps users manage their personal digital library, track reading status, and prevent duplicate purchases through AI-powered book scanning and intelligent book recognition.

The application is built as a full-stack web application with a React frontend and Express backend, featuring a mobile-first design with camera integration for scanning book covers and extracting book details using Google's Gemini AI.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development patterns
- **Routing**: Wouter for lightweight client-side routing optimized for mobile navigation
- **UI Components**: Radix UI primitives with shadcn/ui components for consistent, accessible design
- **Styling**: Tailwind CSS with custom design tokens for responsive, mobile-first styling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js for RESTful API endpoints
- **Database ORM**: Drizzle ORM for type-safe database operations and schema management
- **Database**: PostgreSQL configured through Neon Database serverless connections
- **File Processing**: Multer for handling image uploads with memory storage
- **Development**: TypeScript with ES modules for modern JavaScript features

### Mobile-First Design
- **Responsive Layout**: Mobile-optimized interface with bottom navigation
- **Camera Integration**: Browser-based camera access for book cover scanning
- **Touch-Friendly**: Optimized for mobile interactions and gestures
- **Progressive Web App**: Built with PWA capabilities for app-like experience

### Data Storage
- **Database Schema**: 
  - Books table with title, author, read status, and timestamps
  - Users table for future authentication (currently using in-memory storage)
- **File Storage**: Image processing handled in-memory for AI analysis
- **Session Management**: Connect-pg-simple for PostgreSQL session storage

### AI Integration
- **Image Recognition**: Google Gemini AI for extracting book details from cover images
- **Confidence Scoring**: AI responses include confidence levels for accuracy assessment
- **Fallback Handling**: Manual input options when AI recognition fails

### API Design
- **RESTful Endpoints**: Standard HTTP methods for CRUD operations
- **Error Handling**: Consistent error responses with proper HTTP status codes
- **Data Validation**: Zod schemas for request/response validation
- **File Upload**: Multipart form data handling for image processing

### Development Tools
- **Type Safety**: Full TypeScript coverage across frontend and backend
- **Code Quality**: ESLint and Prettier for consistent code formatting
- **Build Process**: Separate build pipelines for client and server code
- **Development Server**: Hot reloading with Vite middleware integration

## External Dependencies

### Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL database hosting
- **Drizzle Kit**: Database migration and schema management tools

### AI & Machine Learning
- **Google Gemini AI**: Book cover image analysis and text extraction
- **OCR Processing**: Automated book title and author recognition

### UI & Design System
- **Radix UI**: Headless UI components for accessibility and functionality
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent visual elements

### Development & Build Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Static type checking and enhanced development experience
- **React Hook Form**: Form handling with validation
- **TanStack Query**: Server state management and data fetching

### File Processing & Utilities
- **Multer**: File upload middleware for image processing
- **Date-fns**: Date manipulation and formatting utilities
- **Nanoid**: Unique ID generation for database records

### Mobile & Camera Features
- **Browser Camera API**: Native camera access for book scanning
- **Image Processing**: Canvas-based image manipulation for AI analysis
- **File Upload**: Seamless image capture to server processing pipeline