// Types pour la base de données (Drizzle ORM)
export type { 
  User, 
  NewUser, 
  Expense, 
  NewExpense, 
  ExpenseItem, 
  NewExpenseItem 
} from '../lib/schema';

// Types pour l'interface avec imports locaux
import type { User as DatabaseUser, Expense as DatabaseExpense, ExpenseItem as DatabaseExpenseItem } from '../lib/schema';

// Types d'interface
export interface ExpenseWithItems extends DatabaseExpense {
  items: DatabaseExpenseItem[];
}

export interface UserWithoutPassword {
  id: string;
  email: string;
  username: string;
  fullName: string;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Types pour l'authentification
export interface AuthResponse {
  success: boolean;
  user?: DatabaseUser;
  message?: string;
}

// Types pour les formulaires
export interface ExpenseForm {
  amount: string;
  description: string;
  category: string;
  date: string;
}

export interface UserForm {
  email: string;
  username: string;
  fullName: string;
  password: string;
}

// Types pour l'ancien système (compatibility)
export interface ExpenseMonth {
  id: string;
  month: string; // YYYY-MM format
  year: number;
  expenses: OldExpense[];
  total: number;
  createdAt: string;
  lastModifiedAt: string;
  lastModifiedBy: string;
}

export interface OldExpense {
  id: string;
  amount: number;
  description: string;
  date: string;
  createdBy: string;
  createdAt: string;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
}
