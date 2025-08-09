import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Book as BookIcon, Image as ImageIcon } from "lucide-react";
import { booksApi } from "@/lib/api";
import type { Book } from "@shared/schema";

interface BookCoverThumbnailProps {
  book: Book;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function BookCoverThumbnail({ book, size = "md", className = "" }: BookCoverThumbnailProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const { data: coverData, isLoading } = useQuery({
    queryKey: ["book-cover", book.id],
    queryFn: () => booksApi.getBookCover(book.id),
    staleTime: 24 * 60 * 60 * 1000, // Cache for 24 hours
  });

  const sizeClasses = {
    sm: "w-8 h-12",
    md: "w-12 h-16",
    lg: "w-16 h-20",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-xs",
    lg: "text-sm",
  };

  // Fallback placeholder with book title
  const PlaceholderCover = () => (
    <div className={`${sizeClasses[size]} bg-gradient-to-b from-blue-100 to-blue-200 rounded shadow-sm flex items-center justify-center ${className}`}>
      <span className={`${textSizeClasses[size]} text-blue-600 font-medium text-center leading-tight px-1`}>
        {book.title.substring(0, 4)}
      </span>
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-200 rounded shadow-sm flex items-center justify-center animate-pulse ${className}`}>
        <ImageIcon className="text-gray-400" size={size === "sm" ? 12 : 16} />
      </div>
    );
  }

  // If we have a cover URL from Open Library
  if (coverData?.coverUrl && !imageError) {
    return (
      <div className={`${sizeClasses[size]} relative rounded shadow-sm overflow-hidden ${className}`}>
        <img
          src={coverData.coverUrl}
          alt={`Cover of ${book.title}`}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <ImageIcon className="text-gray-400" size={size === "sm" ? 12 : 16} />
          </div>
        )}
      </div>
    );
  }

  // If we have AI-generated description, create a styled cover
  if (coverData?.description && coverData.confidence > 0.3) {
    // Generate a color scheme based on the book title
    const colors = [
      "from-red-100 to-red-200 text-red-800",
      "from-blue-100 to-blue-200 text-blue-800",
      "from-green-100 to-green-200 text-green-800",
      "from-purple-100 to-purple-200 text-purple-800",
      "from-yellow-100 to-yellow-200 text-yellow-800",
      "from-pink-100 to-pink-200 text-pink-800",
      "from-indigo-100 to-indigo-200 text-indigo-800",
      "from-gray-100 to-gray-200 text-gray-800",
    ];
    
    const colorIndex = book.title.length % colors.length;
    const colorScheme = colors[colorIndex];

    return (
      <div 
        className={`${sizeClasses[size]} bg-gradient-to-b ${colorScheme} rounded shadow-sm flex flex-col items-center justify-center p-1 ${className}`}
        title={coverData.description}
      >
        <BookIcon size={size === "sm" ? 10 : 12} className="mb-1 opacity-60" />
        <span className={`${textSizeClasses[size]} font-medium text-center leading-tight`}>
          {book.title.substring(0, size === "sm" ? 3 : 4)}
        </span>
        {book.author && size !== "sm" && (
          <span className="text-xs opacity-60 text-center leading-tight mt-0.5">
            {book.author.split(" ").pop()?.substring(0, 3)}
          </span>
        )}
      </div>
    );
  }

  // Default fallback
  return <PlaceholderCover />;
}