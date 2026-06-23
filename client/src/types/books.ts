export interface BookCategory {
  id: string;
  name: string;
}

export interface LanguageCategory {
  id: string;
  name: string;
}

export interface BookInventoryItem {
  id: string;
  title: string;
  author: string;
  totalCopies: number;
  availableCopies: number;
  language: string;
  lendingCount: number;
  categoryId: string;
  categoryName: string;
  createdAt: string; 
  isbn: string;
}

interface BorrowHistoryItem {
  member_name: string;
  gmail: string;
  borrow_date: string;
  return_date: string | null;
  status: "BORROWED" | "RETURNED";
  condition: "GOOD" | "DAMAGED";
  damage_description: string | null;
}

export interface EditingBookInventoryItem {
  book_id: string;
  book_name: string;
  book_author: string;
  total_copies: number;
  available_copies: number;
  language: string;
  lending_count: number;
 category?: {
    category_id: string;
    category_name: string;
  };
  created_at: string; 
  isbn: string;
  history: BorrowHistoryItem[];
}