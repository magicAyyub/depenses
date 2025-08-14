import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db, expenses, expenseItems } from '@/lib/db';
import { eq } from 'drizzle-orm';

// Helper pour vérifier l'authentification
async function requireAuth(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    return { error: 'Token non trouvé', status: 401 };
  }

  const user = await getCurrentUser(token);
  
  if (!user) {
    return { error: 'Utilisateur non trouvé', status: 401 };
  }

  return { user };
}

// Récupérer les dépenses de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireAuth(request);
    
    if ('error' in authCheck) {
      return NextResponse.json(
        { success: false, message: authCheck.error },
        { status: authCheck.status }
      );
    }

    const { user } = authCheck;

    // Récupérer toutes les dépenses de l'utilisateur avec leurs éléments
    const userExpenses = await db.select().from(expenses)
      .where(eq(expenses.userId, user.id))
      .orderBy(expenses.date);

    // Pour l'instant, retourner un format compatible avec l'ancien système
    // Plus tard, on pourra optimiser cette structure
    const expenseMonths = [
      {
        id: 'temp-month',
        month: new Date().toISOString().slice(0, 7), // YYYY-MM
        year: new Date().getFullYear(),
        expenses: userExpenses.map(expense => ({
          id: expense.id,
          amount: parseFloat(expense.amount),
          description: expense.description || '',
          date: expense.date.toISOString(),
          createdBy: user.username,
          createdAt: expense.createdAt.toISOString(),
        })),
        total: userExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0),
        createdAt: new Date().toISOString(),
        lastModifiedAt: new Date().toISOString(),
        lastModifiedBy: user.username
      }
    ];

    return NextResponse.json({
      success: true,
      expenseMonths
    });
  } catch (error) {
    console.error('Erreur lors du chargement des dépenses:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// Créer une nouvelle dépense
export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireAuth(request);
    
    if ('error' in authCheck) {
      return NextResponse.json(
        { success: false, message: authCheck.error },
        { status: authCheck.status }
      );
    }

    const { user } = authCheck;
    const { title, description, amount, category, date } = await request.json();

    if (!title || !amount || !category || !date) {
      return NextResponse.json(
        { success: false, message: 'Données manquantes (title, amount, category, date requis)' },
        { status: 400 }
      );
    }

    // Créer la nouvelle dépense
    const [newExpense] = await db.insert(expenses).values({
      userId: user.id,
      title,
      description,
      amount: amount.toString(),
      category,
      date: new Date(date),
    }).returning();

    return NextResponse.json({
      success: true,
      expense: newExpense,
      message: 'Dépense créée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création de la dépense:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
