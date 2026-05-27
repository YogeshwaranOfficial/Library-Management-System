export interface CreateBookPayload {
  book_name: string;
  book_author: string;
  category_id: string;
  total_copies: number;
}

export interface UpdateBookPayload {
  book_name?: string;
  book_author?: string;
  category_id?: string;
  total_copies?: number;
  available_copies?: number;
}