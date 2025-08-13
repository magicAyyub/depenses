import { Expense, ExpenseMonth } from '@/types';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const EXPENSES_FILE = path.join(DATA_DIR, 'expenses.json');

// Assurer que le dossier data existe
export async function ensureDataDirectory(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Charger toutes les dépenses
export async function loadExpenses(): Promise<ExpenseMonth[]> {
  try {
    await ensureDataDirectory();
    console.log('📁 Lecture du fichier:', EXPENSES_FILE);
    const data = await fs.readFile(EXPENSES_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    console.log('📖 Données chargées:', parsed.length, 'mois');
    return parsed;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.log('⚠️ Fichier non trouvé ou erreur de lecture, retour tableau vide:', errorMessage);
    return [];
  }
}

// Sauvegarder toutes les dépenses
export async function saveExpenses(expenses: ExpenseMonth[]): Promise<void> {
  await ensureDataDirectory();
  console.log('💾 Sauvegarde dans:', EXPENSES_FILE);
  console.log('📊 Données à sauvegarder:', expenses.length, 'mois');
  await fs.writeFile(EXPENSES_FILE, JSON.stringify(expenses, null, 2));
  console.log('✅ Sauvegarde terminée');
}

// Obtenir ou créer un mois de dépenses
export async function getOrCreateExpenseMonth(date: Date, userId: string): Promise<ExpenseMonth> {
  const expenses = await loadExpenses();
  const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  
  let expenseMonth = expenses.find(em => em.month === monthKey);
  
  if (!expenseMonth) {
    expenseMonth = {
      id: `${monthKey}-${Date.now()}`,
      month: monthKey,
      year: date.getFullYear(),
      expenses: [],
      total: 0,
      createdAt: new Date().toISOString(),
      lastModifiedAt: new Date().toISOString(),
      lastModifiedBy: userId
    };
    expenses.push(expenseMonth);
    await saveExpenses(expenses);
  }
  
  return expenseMonth;
}

// Ajouter une dépense
export async function addExpense(expense: Omit<Expense, 'id'>, userId: string): Promise<Expense> {
  console.log('🔍 addExpense appelé avec:', { expense, userId });
  
  const expenses = await loadExpenses();
  console.log('📂 Dépenses chargées:', expenses.length, 'mois');
  
  const date = new Date(expense.date);
  const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  console.log('📅 Clé du mois:', monthKey);
  
  let expenseMonth = expenses.find(em => em.month === monthKey);
  
  if (!expenseMonth) {
    console.log('📝 Création d\'un nouveau mois');
    expenseMonth = {
      id: `${monthKey}-${Date.now()}`,
      month: monthKey,
      year: date.getFullYear(),
      expenses: [],
      total: 0,
      createdAt: new Date().toISOString(),
      lastModifiedAt: new Date().toISOString(),
      lastModifiedBy: userId
    };
    expenses.push(expenseMonth);
  }
  
  const newExpense: Expense = {
    ...expense,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  };
  
  console.log('➕ Nouvelle dépense créée:', newExpense);
  
  expenseMonth.expenses.push(newExpense);
  expenseMonth.total = expenseMonth.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  expenseMonth.lastModifiedAt = new Date().toISOString();
  expenseMonth.lastModifiedBy = userId;
  
  console.log('📊 Mois mis à jour - Total:', expenseMonth.total, 'Nb dépenses:', expenseMonth.expenses.length);
  
  console.log('💾 Sauvegarde en cours...');
  await saveExpenses(expenses);
  console.log('✅ Sauvegarde terminée');
  
  return newExpense;
}

// Mettre à jour une dépense
export async function updateExpense(expenseId: string, updates: Partial<Expense>, userId: string): Promise<Expense | null> {
  const expenses = await loadExpenses();
  
  for (const expenseMonth of expenses) {
    const expenseIndex = expenseMonth.expenses.findIndex(exp => exp.id === expenseId);
    if (expenseIndex >= 0) {
      const updatedExpense = {
        ...expenseMonth.expenses[expenseIndex],
        ...updates,
        lastModifiedBy: userId,
        lastModifiedAt: new Date().toISOString()
      };
      
      expenseMonth.expenses[expenseIndex] = updatedExpense;
      expenseMonth.total = expenseMonth.expenses.reduce((sum, exp) => sum + exp.amount, 0);
      expenseMonth.lastModifiedAt = new Date().toISOString();
      expenseMonth.lastModifiedBy = userId;
      
      await saveExpenses(expenses);
      return updatedExpense;
    }
  }
  
  return null;
}

// Supprimer une dépense
export async function deleteExpense(expenseId: string, userId: string): Promise<boolean> {
  const expenses = await loadExpenses();
  
  for (const expenseMonth of expenses) {
    const expenseIndex = expenseMonth.expenses.findIndex(exp => exp.id === expenseId);
    if (expenseIndex >= 0) {
      expenseMonth.expenses.splice(expenseIndex, 1);
      expenseMonth.total = expenseMonth.expenses.reduce((sum, exp) => sum + exp.amount, 0);
      expenseMonth.lastModifiedAt = new Date().toISOString();
      expenseMonth.lastModifiedBy = userId;
      
      await saveExpenses(expenses);
      return true;
    }
  }
  
  return false;
}

// Obtenir les dépenses d'un mois
export async function getExpensesByMonth(year: number, month: number): Promise<ExpenseMonth | null> {
  const expenses = await loadExpenses();
  const monthKey = `${year}-${String(month).padStart(2, '0')}`;
  return expenses.find(em => em.month === monthKey) || null;
}

// Obtenir toutes les dépenses triées par date
export async function getAllExpensesWithMonths(): Promise<ExpenseMonth[]> {
  const expenses = await loadExpenses();
  return expenses.sort((a, b) => b.month.localeCompare(a.month));
}
