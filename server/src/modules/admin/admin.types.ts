export interface UserAttributes {
  user_id: string;
  name: string;
  gmail: string;
  phone_number: string | null;
  role: 'READER' | 'LIBRARIAN' | 'ADMIN';
  created_at: Date;
  updated_at: Date;
}

// Dedicated output DTO layout shapes for response clean frames
export interface AdminUserResponseDto {
  user_id: string;
  name: string;
  gmail: string;
  phone_number: string | null;
  created_at: Date;
  role: string;
}