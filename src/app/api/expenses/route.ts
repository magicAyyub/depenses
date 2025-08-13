import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserByEmail } from '@/lib/auth';
import { addExpense, getAllExpensesWithMonths } from '@/lib/expenses';
import { Expense } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Token manquant' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Token invalide' },
        { status: 401 }
      );
    }

    const expenseMonths = await getAllExpensesWithMonths();

    return NextResponse.json({
      success: true,
      expenseMonths
    });

  } catch (error) {
    console.error('Erreur lors de la récupération:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la récupération' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Token manquant');
      return NextResponse.json(
        { success: false, message: 'Token manquant' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      console.log('❌ Token invalide');
      return NextResponse.json(
        { success: false, message: 'Token invalide' },
        { status: 401 }
      );
    }

    const user = getUserByEmail(decoded.email);
    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return NextResponse.json(
        { success: false, message: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const { expenses } = await request.json();
    console.log('📝 Données reçues:', { expenses, userEmail: user.email });

    if (!expenses || !Array.isArray(expenses) || expenses.length === 0) {
      console.log('❌ Données invalides:', expenses);
      return NextResponse.json(
        { success: false, message: 'Données de dépenses invalides' },
        { status: 400 }
      );
    }

    const savedExpenses: Expense[] = [];

    // Sauvegarder chaque dépense
    for (const expenseData of expenses) {
      if (!expenseData.amount || !expenseData.description) {
        console.log('⚠️ Dépense ignorée (données manquantes):', expenseData);
        continue; // Ignorer les dépenses invalides
      }

      console.log('💾 Sauvegarde de la dépense:', expenseData);

      const expense = await addExpense({
        amount: parseFloat(expenseData.amount.toString()),
        description: expenseData.description,
        date: expenseData.date || new Date().toISOString(),
        createdBy: user.name,
        createdAt: new Date().toISOString()
      }, user.id);

      console.log('✅ Dépense sauvegardée:', expense);
      savedExpenses.push(expense);
    }

    console.log(`🎉 Total sauvegardé: ${savedExpenses.length} dépense(s)`);
    return NextResponse.json({
      success: true,
      expenses: savedExpenses,
      message: `${savedExpenses.length} dépense(s) sauvegardée(s)`
    });

  } catch (error) {
    console.error('💥 Erreur lors de la sauvegarde:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la sauvegarde' },
      { status: 500 }
    );
  }
}
