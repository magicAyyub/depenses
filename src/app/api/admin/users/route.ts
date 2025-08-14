import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, registerUser } from '@/lib/auth';
import { db, users } from '@/lib/db';

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

// Créer un nouveau utilisateur (admin seulement)
export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireAdmin(request);
    
    if ('error' in authCheck) {
      return NextResponse.json(
        { success: false, message: authCheck.error },
        { status: authCheck.status }
      );
    }

    const { email, username, fullName, password, isAdmin = false } = await request.json();

    if (!email || !username || !fullName || !password) {
      return NextResponse.json(
        { success: false, message: 'Tous les champs sont requis (email, username, fullName, password)' },
        { status: 400 }
      );
    }

    const result = await registerUser(email, username, fullName, password, isAdmin);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        user: result.user
      });
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// Récupérer la liste des utilisateurs (admin seulement)
export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireAdmin(request);
    
    if ('error' in authCheck) {
      return NextResponse.json(
        { success: false, message: authCheck.error },
        { status: authCheck.status }
      );
    }

    // Récupérer tous les utilisateurs sans les mots de passe
    const allUsers = await db.select({
      id: users.id,
      email: users.email,
      username: users.username,
      fullName: users.fullName,
      isAdmin: users.isAdmin,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    }).from(users).orderBy(users.createdAt);

    return NextResponse.json({
      success: true,
      users: allUsers
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
