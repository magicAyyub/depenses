export interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string;
  createdBy: string;
  createdAt: string;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
}

export interface ExpenseMonth {
  id: string;
  month: string; // YYYY-MM format
  year: number;
  expenses: Expense[];
  total: number;
  createdAt: string;
  lastModifiedAt: string;
  lastModifiedBy: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
}

export interface ExpenseForm {
  amount: string;
  description: string;
}
