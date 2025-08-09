import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, MoreHorizontal, SortAsc } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import BookListItem from "@/components/book-list-item";
import BookCoverThumbnail from "@/components/book-cover-thumbnail";
import { booksApi } from "@/lib/api";
import type { Book } from "@shared/schema";

export default function Library() {
  const [, setLocation] = useLocation();
  const [filter, setFilter] = useState<"all" | "read" | "unread">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddOptions, setShowAddOptions] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: books = [], isLoading } = useQuery({
    queryKey: ["/api/books"],
    queryFn: booksApi.getAll,
  });

  const updateBookMutation = useMutation({
    mutationFn: ({ id, ...book }: { id: string } & Partial<Book>) =>
      booksApi.update(id, book),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
    },
  });

  const filteredBooks = books.filter(book => {
    const matchesFilter = filter === "all" || 
      (filter === "read" && book.isRead) ||
      (filter === "unread" && !book.isRead);
    
    const matchesSearch = searchQuery === "" ||
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.author && book.author.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const readCount = books.filter(book => book.isRead).length;
  const unreadCount = books.filter(book => !book.isRead).length;

  const handleToggleRead = (id: string, isRead: boolean) => {
    updateBookMutation.mutate({ id, isRead });
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex space-x-3">
                <div className="w-12 h-16 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative pb-20">
      {/* Top App Bar */}
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-xl">📚</div>
            <h1 className="text-xl font-medium">BookMate</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/20">
              <Search size={18} />
            </Button>
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/20">
              <MoreHorizontal size={18} />
            </Button>
          </div>
        </div>
      </header>

      {/* Library Stats */}
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-medium text-gray-900">My Library</h2>
          <span className="text-sm text-gray-600">{books.length} books</span>
        </div>
        <div className="flex space-x-4">
          <div className="flex-1 bg-green-50 p-3 rounded-lg">
            <div className="text-lg font-semibold text-green-600">{readCount}</div>
            <div className="text-xs text-gray-600">Read</div>
          </div>
          <div className="flex-1 bg-blue-50 p-3 rounded-lg">
            <div className="text-lg font-semibold text-blue-600">{unreadCount}</div>
            <div className="text-xs text-gray-600">Unread</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-white border-b border-gray-200">
        <Input
          placeholder="Search your library..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-3"
        />
        
        {/* Filter Chips */}
        <div className="flex space-x-2 overflow-x-auto pb-1">
          {[
            { key: "all", label: "All Books" },
            { key: "read", label: "Read" },
            { key: "unread", label: "Unread" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                filter === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
          <button className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-sm whitespace-nowrap hover:bg-gray-300 flex items-center">
            <SortAsc className="mr-1" size={14} />
            Sort
          </button>
        </div>
      </div>

      {/* Book List */}
      <div className="bg-gray-50">
        {filteredBooks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-3">📚</div>
            <p className="text-lg font-medium mb-2">No books found</p>
            <p className="text-sm">
              {searchQuery ? "Try a different search term" : "Add your first book to get started"}
            </p>
          </div>
        ) : (
          filteredBooks.map((book) => (
            <BookListItem
              key={book.id}
              book={book}
              onToggleRead={handleToggleRead}
            />
          ))
        )}
      </div>

      {/* Floating Action Button */}
      <Sheet open={showAddOptions} onOpenChange={setShowAddOptions}>
        <SheetTrigger asChild>
          <Button
            className="fixed bottom-20 right-4 w-14 h-14 rounded-full shadow-lg"
            size="icon"
          >
            <Plus size={20} />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="max-w-md mx-auto">
          <SheetHeader>
            <SheetTitle>Add New Book</SheetTitle>
          </SheetHeader>
          
          <div className="space-y-3 mt-4">
            <Button
              onClick={() => {
                setShowAddOptions(false);
                setLocation("/camera");
              }}
              className="w-full flex items-center space-x-3 p-4 h-auto bg-primary/10 text-primary hover:bg-primary/20"
              variant="outline"
            >
              <div className="text-xl">📷</div>
              <div className="text-left">
                <div className="font-medium">Scan Book Cover</div>
                <div className="text-sm opacity-80">Use AI to extract book details</div>
              </div>
            </Button>
            
            <Button
              onClick={() => {
                setShowAddOptions(false);
                setLocation("/add-book");
              }}
              className="w-full flex items-center space-x-3 p-4 h-auto"
              variant="outline"
            >
              <div className="text-xl">⌨️</div>
              <div className="text-left">
                <div className="font-medium">Manual Entry</div>
                <div className="text-sm opacity-80">Type book details manually</div>
              </div>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
