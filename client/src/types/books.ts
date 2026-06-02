export interface BookCategory {
  id: string;
  name: string;
  code: string;
}

export interface BookInventoryItem {
  id: string;
  title: string;
  author: string;
  totalCopies: number;
  availableCopies: number;
  lendingCount: number;
  categoryId: string;
  categoryName: string;
}