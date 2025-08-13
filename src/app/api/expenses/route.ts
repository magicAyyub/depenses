import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { addExpense, loadExpenses } from '@/lib/expenses';

export async function GET(request: NextRequest) {
  try {
    // Récupérer l'utilisateur depuis la session Supabase
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Token manquant' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Vérifier le token avec Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return NextResponse.json({ success: false, message: 'Token invalide' }, { status: 401 });
    }

    const expenseMonths = await loadExpenses(user.id);

    return NextResponse.json({
      success: true,
      expenseMonths
    });
  } catch (error) {
    console.error('Erreur lors du chargement des dépenses:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors du chargement des dépenses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Récupérer l'utilisateur depuis la session Supabase
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Token manquant' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Vérifier le token avec Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return NextResponse.json({ success: false, message: 'Token invalide' }, { status: 401 });
    }

    const { amount, description, date } = await request.json();

    if (!amount || !description || !date) {
      return NextResponse.json(
        { success: false, message: 'Données manquantes' },
        { status: 400 }
      );
    }

    const expense = await addExpense(
      {
        amount: parseFloat(amount),
        description,
        date,
        createdBy: user.id,
        createdAt: new Date().toISOString()
      },
      user.id
    );

    return NextResponse.json({
      success: true,
      expense
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la dépense:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de l\'ajout de la dépense' },
      { status: 500 }
    );
  }
}
