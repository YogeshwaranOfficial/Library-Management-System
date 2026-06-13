// ✨ NEW: Defines the payload contract returned by the inventory search engine
export interface SearchBookResult {
  book_id: string;
  title: string;           // Maps directly to front-end expected 'title' state parameter
  author: string;
  available_copies: number;
  compliance: {
    status: "AVAILABLE" | "OUT_OF_STOCK";
    message: string;
    isBlocked: boolean;    // true means dropdown blocks click selection (0 copies)
  };
  language: string | "English";
}

export interface CreateBookPayload {
  book_name: string;
  book_author: string;
  category_id: string;
  total_copies: number;
  available_copies?: number;
  language: string | "English"; 
}

export interface UpdateBookPayload {
  book_name?: string;
  book_author?: string;
  category_id?: string;
  total_copies?: number;
  available_copies?: number;
  language?: string | "English";
}