import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserByEmail } from '@/lib/auth';
import { updateExpense, deleteExpense } from '@/lib/expenses';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
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

    const user = getUserByEmail(decoded.email);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const { amount, description } = await request.json();

    if (!amount && !description) {
      return NextResponse.json(
        { success: false, message: 'Aucune donnée à modifier' },
        { status: 400 }
      );
    }

    const updates: Partial<{ amount: number; description: string }> = {};
    if (amount !== undefined) updates.amount = parseFloat(amount.toString());
    if (description !== undefined) updates.description = description;

    const updatedExpense = await updateExpense(params.id, updates, user.id);

    if (!updatedExpense) {
      return NextResponse.json(
        { success: false, message: 'Dépense non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      expense: updatedExpense,
      message: 'Dépense modifiée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la modification:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la modification' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
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

    const user = getUserByEmail(decoded.email);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const deleted = await deleteExpense(params.id, user.id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Dépense non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Dépense supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
