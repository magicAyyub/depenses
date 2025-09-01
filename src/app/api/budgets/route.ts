import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db, monthlyBudgets } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

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

// Récupérer le budget d'un mois spécifique
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
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    if (!month || !year) {
      return NextResponse.json(
        { success: false, message: 'Mois et année requis' },
        { status: 400 }
      );
    }

    // Récupérer le budget partagé pour ce mois (sans filtrer par utilisateur)
    const budget = await db.select().from(monthlyBudgets)
      .where(and(
        eq(monthlyBudgets.month, month),
        eq(monthlyBudgets.year, parseInt(year))
      ))
      .limit(1);

    return NextResponse.json({
      success: true,
      budget: budget[0] || null
    });
  } catch (error) {
    console.error('Erreur lors du chargement du budget:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// Créer ou mettre à jour un budget mensuel
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
    const { month, year, initialCapital, description } = await request.json();

    // Validation
    if (!month || !year || !initialCapital) {
      return NextResponse.json(
        { success: false, message: 'Mois, année et capital initial requis' },
        { status: 400 }
      );
    }

    const numericCapital = parseFloat(initialCapital);
    if (isNaN(numericCapital) || numericCapital <= 0) {
      return NextResponse.json(
        { success: false, message: 'Le capital doit être un nombre positif' },
        { status: 400 }
      );
    }

    // Vérifier s'il existe déjà un budget pour ce mois (partagé, sans user)
    const existingBudget = await db.select().from(monthlyBudgets)
      .where(and(
        eq(monthlyBudgets.month, month),
        eq(monthlyBudgets.year, year)
      ))
      .limit(1);

    let budget;

    if (existingBudget.length > 0) {
      // Mettre à jour le budget existant
      [budget] = await db.update(monthlyBudgets)
        .set({
          initialCapital: numericCapital.toString(),
          description: description || null,
          updatedAt: new Date(),
        })
        .where(eq(monthlyBudgets.id, existingBudget[0].id))
        .returning();
    } else {
      // Créer un nouveau budget
      [budget] = await db.insert(monthlyBudgets).values({
        userId: user.id,
        month,
        year,
        initialCapital: numericCapital.toString(),
        description: description || null,
      }).returning();
    }

    return NextResponse.json({
      success: true,
      budget,
      message: existingBudget.length > 0 ? 'Budget mis à jour' : 'Budget créé'
    });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du budget:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// Supprimer un budget mensuel
export async function DELETE(request: NextRequest) {
  try {
    const authCheck = await requireAuth(request);
    
    if ('error' in authCheck) {
      return NextResponse.json(
        { success: false, message: authCheck.error },
        { status: authCheck.status }
      );
    }

    const { user } = authCheck;
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    if (!month || !year) {
      return NextResponse.json(
        { success: false, message: 'Mois et année requis' },
        { status: 400 }
      );
    }

    // Vérifier si le budget existe (partagé, sans user)
    const existingBudget = await db.select().from(monthlyBudgets)
      .where(and(
        eq(monthlyBudgets.month, month),
        eq(monthlyBudgets.year, parseInt(year))
      ))
      .limit(1);

    if (existingBudget.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Budget non trouvé' },
        { status: 404 }
      );
    }

    // Supprimer le budget
    await db.delete(monthlyBudgets)
      .where(eq(monthlyBudgets.id, existingBudget[0].id));

    return NextResponse.json({
      success: true,
      message: 'Budget supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du budget:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
