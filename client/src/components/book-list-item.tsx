import { Clock, CheckCircle, MoreVertical } from "lucide-react";
import type { Book } from "@shared/schema";

interface BookListItemProps {
  book: Book;
  onToggleRead?: (id: string, isRead: boolean) => void;
}

export default function BookListItem({ book, onToggleRead }: BookListItemProps) {
  return (
    <div className="bg-white border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start space-x-3">
        {/* Placeholder book cover */}
        <div className="w-12 h-16 bg-gradient-to-b from-blue-100 to-blue-200 rounded shadow-sm flex items-center justify-center">
          <span className="text-xs text-blue-600 font-medium text-center leading-tight px-1">
            {book.title.substring(0, 4)}
          </span>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{book.title}</h3>
          {book.author && (
            <p className="text-sm text-gray-600 truncate">{book.author}</p>
          )}
          <div className="flex items-center mt-1 space-x-2">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                book.isRead
                  ? "bg-green-100 text-green-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {book.isRead ? (
                <>
                  <CheckCircle className="mr-1" size={12} />
                  Read
                </>
              ) : (
                <>
                  <Clock className="mr-1" size={12} />
                  Unread
                </>
              )}
            </span>
          </div>
        </div>
        
        <button
          onClick={() => onToggleRead?.(book.id, !book.isRead)}
          className="text-gray-400 hover:text-gray-600 p-1"
        >
          <MoreVertical size={16} />
        </button>
      </div>
    </div>
  );
}
