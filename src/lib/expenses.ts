import { Expense, ExpenseMonth } from '@/types';
import { supabase } from './supabase';

// Charger toutes les dépenses pour un utilisateur
export async function loadExpenses(userId: string): Promise<ExpenseMonth[]> {
  try {
    // Récupérer tous les mois de dépenses avec leurs dépenses
    const { data: expenseMonths, error: monthsError } = await supabase
      .from('expense_months')
      .select(`
        *,
        expenses:expenses(*)
      `)
      .eq('user_id', userId)
      .order('month', { ascending: false });

    if (monthsError) {
      console.error('Erreur lors du chargement des mois:', monthsError);
      return [];
    }

    if (!expenseMonths) {
      return [];
    }

    // Transformer les données pour correspondre au format attendu
    return expenseMonths.map(month => ({
      id: month.id,
      month: month.month,
      year: parseInt(month.month.split('-')[0]),
      expenses: month.expenses.map((expense: {
        id: string;
        amount: string;
        description: string;
        date: string;
        created_by: string;
        created_at: string;
      }) => ({
        id: expense.id,
        amount: parseFloat(expense.amount),
        description: expense.description,
        date: expense.date,
        createdBy: expense.created_by,
        createdAt: expense.created_at,
        lastModifiedBy: month.last_modified_by,
        lastModifiedAt: month.last_modified_at
      })),
      total: parseFloat(month.total),
      createdAt: month.created_at,
      lastModifiedAt: month.last_modified_at,
      lastModifiedBy: month.last_modified_by
    }));
  } catch (error) {
    console.error('Erreur lors du chargement des dépenses:', error);
    return [];
  }
}

// Obtenir ou créer un mois de dépenses
export async function getOrCreateExpenseMonth(date: Date, userId: string): Promise<ExpenseMonth> {
  const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  
  // Vérifier si le mois existe déjà
  const { data: existingMonth, error: fetchError } = await supabase
    .from('expense_months')
    .select(`
      *,
      expenses:expenses(*)
    `)
    .eq('user_id', userId)
    .eq('month', monthKey)
    .single();

  if (existingMonth && !fetchError) {
    // Transformer le mois existant
    return {
      id: existingMonth.id,
      month: existingMonth.month,
      year: parseInt(existingMonth.month.split('-')[0]),
      expenses: existingMonth.expenses.map((expense: {
        id: string;
        amount: string;
        description: string;
        date: string;
        created_by: string;
        created_at: string;
      }) => ({
        id: expense.id,
        amount: parseFloat(expense.amount),
        description: expense.description,
        date: expense.date,
        createdBy: expense.created_by,
        createdAt: expense.created_at,
        lastModifiedBy: existingMonth.last_modified_by,
        lastModifiedAt: existingMonth.last_modified_at
      })),
      total: parseFloat(existingMonth.total),
      createdAt: existingMonth.created_at,
      lastModifiedAt: existingMonth.last_modified_at,
      lastModifiedBy: existingMonth.last_modified_by
    };
  }

  // Créer un nouveau mois
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', userId)
    .single();

  const username = profile?.username || 'Utilisateur';

  const { data: newMonth, error: insertError } = await supabase
    .from('expense_months')
    .insert({
      user_id: userId,
      month: monthKey,
      total: 0,
      last_modified_by: username
    })
    .select()
    .single();

  if (insertError || !newMonth) {
    throw new Error('Erreur lors de la création du mois de dépenses');
  }

  return {
    id: newMonth.id,
    month: newMonth.month,
    year: parseInt(newMonth.month.split('-')[0]),
    expenses: [],
    total: 0,
    createdAt: newMonth.created_at,
    lastModifiedAt: newMonth.last_modified_at,
    lastModifiedBy: newMonth.last_modified_by
  };
}

// Ajouter une dépense
export async function addExpense(expense: Omit<Expense, 'id'>, userId: string): Promise<Expense> {
  try {
    const date = new Date(expense.date);
    const expenseMonth = await getOrCreateExpenseMonth(date, userId);

    // Récupérer le nom d'utilisateur
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single();

    const username = profile?.username || 'Utilisateur';

    // Ajouter la dépense
    const { data: newExpense, error: expenseError } = await supabase
      .from('expenses')
      .insert({
        user_id: userId,
        expense_month_id: expenseMonth.id,
        amount: expense.amount,
        description: expense.description,
        date: expense.date,
        created_by: username
      })
      .select()
      .single();

    if (expenseError || !newExpense) {
      throw new Error('Erreur lors de l\'ajout de la dépense');
    }

    // Mettre à jour le total du mois
    const newTotal = expenseMonth.total + expense.amount;
    const { error: updateError } = await supabase
      .from('expense_months')
      .update({
        total: newTotal,
        last_modified_by: username,
        last_modified_at: new Date().toISOString()
      })
      .eq('id', expenseMonth.id);

    if (updateError) {
      throw new Error('Erreur lors de la mise à jour du total');
    }

    return {
      id: newExpense.id,
      amount: parseFloat(newExpense.amount),
      description: newExpense.description,
      date: newExpense.date,
      createdBy: newExpense.created_by,
      createdAt: newExpense.created_at
    };
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la dépense:', error);
    throw error;
  }
}

// Supprimer une dépense
export async function deleteExpense(expenseId: string, userId: string): Promise<void> {
  try {
    // Récupérer la dépense avant de la supprimer
    const { data: expense, error: fetchError } = await supabase
      .from('expenses')
      .select('*, expense_month_id, amount')
      .eq('id', expenseId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !expense) {
      throw new Error('Dépense non trouvée');
    }

    // Supprimer la dépense
    const { error: deleteError } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId)
      .eq('user_id', userId);

    if (deleteError) {
      throw new Error('Erreur lors de la suppression de la dépense');
    }

    // Mettre à jour le total du mois
    const { data: expenseMonth, error: monthError } = await supabase
      .from('expense_months')
      .select('total')
      .eq('id', expense.expense_month_id)
      .single();

    if (monthError || !expenseMonth) {
      throw new Error('Mois de dépense non trouvé');
    }

    const newTotal = parseFloat(expenseMonth.total) - parseFloat(expense.amount);

    // Récupérer le nom d'utilisateur
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single();

    const username = profile?.username || 'Utilisateur';

    const { error: updateError } = await supabase
      .from('expense_months')
      .update({
        total: Math.max(0, newTotal), // S'assurer que le total ne soit jamais négatif
        last_modified_by: username,
        last_modified_at: new Date().toISOString()
      })
      .eq('id', expense.expense_month_id);

    if (updateError) {
      throw new Error('Erreur lors de la mise à jour du total');
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de la dépense:', error);
    throw error;
  }
}

// Mettre à jour une dépense
export async function updateExpense(expenseId: string, updatedData: Partial<Expense>, userId: string): Promise<Expense> {
  try {
    // Récupérer la dépense actuelle
    const { data: currentExpense, error: fetchError } = await supabase
      .from('expenses')
      .select('*, expense_month_id')
      .eq('id', expenseId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !currentExpense) {
      throw new Error('Dépense non trouvée');
    }

    // Récupérer le nom d'utilisateur
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single();

    const username = profile?.username || 'Utilisateur';

    // Mettre à jour la dépense
    const { data: updatedExpense, error: updateError } = await supabase
      .from('expenses')
      .update({
        amount: updatedData.amount ?? currentExpense.amount,
        description: updatedData.description ?? currentExpense.description,
        date: updatedData.date ?? currentExpense.date,
        updated_at: new Date().toISOString()
      })
      .eq('id', expenseId)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError || !updatedExpense) {
      throw new Error('Erreur lors de la mise à jour de la dépense');
    }

    // Recalculer le total du mois si le montant a changé
    if (updatedData.amount !== undefined && updatedData.amount !== parseFloat(currentExpense.amount)) {
      const { data: expenseMonth, error: monthError } = await supabase
        .from('expense_months')
        .select('total')
        .eq('id', currentExpense.expense_month_id)
        .single();

      if (monthError || !expenseMonth) {
        throw new Error('Mois de dépense non trouvé');
      }

      const oldAmount = parseFloat(currentExpense.amount);
      const newAmount = updatedData.amount;
      const newTotal = parseFloat(expenseMonth.total) - oldAmount + newAmount;

      const { error: totalUpdateError } = await supabase
        .from('expense_months')
        .update({
          total: Math.max(0, newTotal),
          last_modified_by: username,
          last_modified_at: new Date().toISOString()
        })
        .eq('id', currentExpense.expense_month_id);

      if (totalUpdateError) {
        throw new Error('Erreur lors de la mise à jour du total');
      }
    }

    return {
      id: updatedExpense.id,
      amount: parseFloat(updatedExpense.amount),
      description: updatedExpense.description,
      date: updatedExpense.date,
      createdBy: updatedExpense.created_by,
      createdAt: updatedExpense.created_at,
      lastModifiedBy: username,
      lastModifiedAt: updatedExpense.updated_at
    };
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la dépense:', error);
    throw error;
  }
}
