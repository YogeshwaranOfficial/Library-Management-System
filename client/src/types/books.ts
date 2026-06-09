export interface BookCategory {
  id: string;
  name: string;
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
  createdAt: string; // 💡 Tracks when the asset entered the shelf index
}