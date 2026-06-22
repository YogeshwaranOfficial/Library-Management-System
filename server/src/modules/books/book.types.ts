// ✨ UPDATED: Defines the payload contract returned by the inventory search engine
export interface SearchBookResult {
  book_id: string;
  title: string;           // Maps directly to front-end expected 'title' state parameter
  author: string;
  available_copies: number;
  isbn: string;            // 🚀 NEW: Returned inside dynamic typeahead records mapping arrays
  compliance: {
    status: "AVAILABLE" | "OUT_OF_STOCK";
    message: string;
    isBlocked: boolean;    // true means dropdown blocks click selection (0 copies)
  };
  language: string;
}

export interface CreateBookPayload {
  book_name: string;
  book_author: string;
  category_id: string;
  total_copies: number;
  available_copies?: number;
  language: string; 
  isbn: string;            // 🚀 NEW: Explicitly required string when adding entries
}

export interface UpdateBookPayload {
  book_name?: string;
  book_author?: string;
  category_id?: string;
  total_copies?: number;
  available_copies?: number;
  language?: string;
  isbn?: string;           // 🚀 NEW: Optional on mutation patches to support partial updates
}

// 🚀 UPDATED: Type contract for incoming catalog queries
export interface GetBooksQueryParams {
  page: number;
  limit: number;
  search?: string;
  category_id?: string;
  language?: string;
  // 🚀 NEW: Appended "isbn" to allow remote layout column sorting triggers
  sort_by?: "book_name" | "created_at" | "language" | "total_copies" | "available_copies" | "isbn";
  order?: "ASC" | "DESC" | "asc" | "desc";
}