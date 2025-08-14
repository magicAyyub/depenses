import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';

// Middleware pour vérifier que l'utilisateur est admin
async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    return { error: 'Token non trouvé', status: 401 };
  }

  const user = await getCurrentUser(token);
  
  if (!user) {
    return { error: 'Utilisateur non trouvé', status: 401 };
  }

  if (!user.isAdmin) {
    return { error: 'Accès non autorisé - droits admin requis', status: 403 };
  }

  return { user };
}

// Supprimer un utilisateur
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const authCheck = await requireAdmin(request);
    
    if ('error' in authCheck) {
      return NextResponse.json(
        { success: false, message: authCheck.error },
        { status: authCheck.status }
      );
    }

    const userId = resolvedParams.id;
    const currentUser = authCheck.user;

    // Empêcher l'admin de se supprimer lui-même
    if (currentUser.id === userId) {
      return NextResponse.json(
        { success: false, message: 'Vous ne pouvez pas supprimer votre propre compte' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur existe
    const [targetUser] = await db.select().from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Supprimer l'utilisateur
    await db.delete(users).where(eq(users.id, userId));

    return NextResponse.json({
      success: true,
      message: `Utilisateur ${targetUser.username} supprimé avec succès`
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// Modifier les droits admin d'un utilisateur
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const authCheck = await requireAdmin(request);
    
    if ('error' in authCheck) {
      return NextResponse.json(
        { success: false, message: authCheck.error },
        { status: authCheck.status }
      );
    }

    const userId = resolvedParams.id;
    const currentUser = authCheck.user;
    const { isAdmin } = await request.json();

    if (typeof isAdmin !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'Le champ isAdmin doit être un booléen' },
        { status: 400 }
      );
    }

    // Empêcher l'admin de retirer ses propres droits
    if (currentUser.id === userId && !isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Vous ne pouvez pas retirer vos propres droits admin' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur existe
    const [targetUser] = await db.select().from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Mettre à jour les droits admin
    const [updatedUser] = await db.update(users)
      .set({ 
        isAdmin,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        email: users.email,
        username: users.username,
        fullName: users.fullName,
        isAdmin: users.isAdmin,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    const action = isAdmin ? 'accordés' : 'retirés';
    
    return NextResponse.json({
      success: true,
      message: `Droits admin ${action} pour ${targetUser.username}`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user admin rights error:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
