import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Search, Camera, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import BookListItem from "@/components/book-list-item";
import { booksApi } from "@/lib/api";

export default function DuplicateChecker() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ["/api/books/search", searchQuery],
    queryFn: () => booksApi.search(searchQuery),
    enabled: searchQuery.length > 2,
  });

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="h-full flex flex-col">
        {/* Header */}
        <header className="bg-primary text-primary-foreground p-4 shadow-md">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <ArrowLeft size={18} />
            </Button>
            <h1 className="text-lg font-medium">Check Duplicates</h1>
            <div className="w-10"></div>
          </div>
        </header>

        {/* Search Interface */}
        <div className="p-4">
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Input
                placeholder="Search your library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-3 text-gray-400" size={16} />
            </div>

            {/* Camera Search Button */}
            <Button
              variant="outline"
              className="w-full flex items-center justify-center space-x-3 p-3 h-auto border-2 border-dashed"
              onClick={() => setLocation("/camera")}
            >
              <Camera size={18} />
              <span>Or scan book cover to check</span>
            </Button>
          </div>

          {/* Search Results */}
          <div className="mt-6">
            {searchQuery.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Search className="mx-auto text-4xl mb-3 opacity-50" size={48} />
                <p>Start typing to search your library</p>
              </div>
            ) : searchQuery.length <= 2 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Type at least 3 characters to search</p>
              </div>
            ) : isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex space-x-3">
                    <div className="w-12 h-16 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-3">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium">Books Found in Library</div>
                    <div className="text-sm mt-1">
                      Found {searchResults.length} matching book{searchResults.length !== 1 ? 's' : ''}
                    </div>
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  {searchResults.map((book) => (
                    <div key={book.id} className="border border-red-200 rounded-lg overflow-hidden">
                      <BookListItem book={book} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-3">✅</div>
                <p className="font-medium text-green-600">No duplicates found!</p>
                <p className="text-sm mt-1">This book is not in your library</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
