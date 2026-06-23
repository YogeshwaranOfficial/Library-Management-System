export interface RegisterUserInput {
  name: string;

  gmail: string;

  password: string;

  phoneNumber?: string;
}

export interface LoginUserInput {
  gmail: string;

  password: string;
}