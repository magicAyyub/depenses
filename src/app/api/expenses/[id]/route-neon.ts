import { NextRequest, NextResponse } from 'next/server';
import { db, expenses } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Récupérer le token depuis les cookies
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier l'utilisateur
    const user = await getCurrentUser(token);
    
    if (!user) {
      return NextResponse.json({ success: false, message: 'Token invalide' }, { status: 401 });
    }

    const expenseId = params.id;

    // Vérifier que l'expense existe et appartient à l'utilisateur
    const [expense] = await db.select().from(expenses)
      .where(and(eq(expenses.id, expenseId), eq(expenses.userId, user.id)))
      .limit(1);

    if (!expense) {
      return NextResponse.json({ success: false, message: 'Dépense non trouvée' }, { status: 404 });
    }

    // Supprimer la dépense
    await db.delete(expenses).where(eq(expenses.id, expenseId));

    return NextResponse.json({ 
      success: true, 
      message: 'Dépense supprimée avec succès' 
    });

  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Récupérer le token depuis les cookies
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier l'utilisateur
    const user = await getCurrentUser(token);
    
    if (!user) {
      return NextResponse.json({ success: false, message: 'Token invalide' }, { status: 401 });
    }

    const { amount, description } = await request.json();
    const expenseId = params.id;

    // Vérifier que l'expense existe et appartient à l'utilisateur
    const [expense] = await db.select().from(expenses)
      .where(and(eq(expenses.id, expenseId), eq(expenses.userId, user.id)))
      .limit(1);

    if (!expense) {
      return NextResponse.json({ success: false, message: 'Dépense non trouvée' }, { status: 404 });
    }

    // Mettre à jour la dépense
    const [updatedExpense] = await db.update(expenses)
      .set({ 
        amount, 
        description,
        updatedAt: new Date()
      })
      .where(eq(expenses.id, expenseId))
      .returning();

    return NextResponse.json({ 
      success: true, 
      expense: updatedExpense,
      message: 'Dépense mise à jour avec succès' 
    });

  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
