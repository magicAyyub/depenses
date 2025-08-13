import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { deleteExpense, updateExpense } from '@/lib/expenses';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    await deleteExpense(params.id, user.id);

    return NextResponse.json({
      success: true,
      message: 'Dépense supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la dépense:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la suppression de la dépense' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const updatedData = await request.json();
    const expense = await updateExpense(params.id, updatedData, user.id);

    return NextResponse.json({
      success: true,
      expense
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la dépense:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la mise à jour de la dépense' },
      { status: 500 }
    );
  }
}
