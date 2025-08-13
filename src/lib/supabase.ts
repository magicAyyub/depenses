import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour TypeScript
export interface Profile {
  id: string;
  email: string;
  username: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseMonth {
  id: string;
  user_id: string;
  month: string;
  total: number;
  last_modified_by: string;
  last_modified_at: string;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  expense_month_id: string;
  amount: number;
  description: string;
  date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}
