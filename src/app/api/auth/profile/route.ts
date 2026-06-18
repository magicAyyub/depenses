import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, hashPassword } from '@/lib/auth';
import { db, users } from '@/lib/db';
import { eq, and, ne } from 'drizzle-orm';

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const currentUser = await getCurrentUser(token);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { username, fullName, pin } = await request.json();

    if (!username || username.trim() === '') {
      return NextResponse.json(
        { success: false, message: "Le nom d'utilisateur est requis" },
        { status: 400 }
      );
    }

    if (!fullName || fullName.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Le nom complet est requis' },
        { status: 400 }
      );
    }

    // Valider l'unicité du nom d'utilisateur (en excluant l'utilisateur actuel)
    const [existingUsername] = await db.select().from(users)
      .where(and(eq(users.username, username.trim()), ne(users.id, currentUser.id)))
      .limit(1);

    if (existingUsername) {
      return NextResponse.json(
        { success: false, message: "Ce nom d'utilisateur est déjà pris" },
        { status: 400 }
      );
    }

    const updateData: {
      username: string;
      fullName: string;
      pinHash?: string;
      updatedAt: Date;
    } = {
      username: username.trim(),
      fullName: fullName.trim(),
      updatedAt: new Date()
    };

    // Si un nouveau PIN est fourni, et que l'utilisateur n'est pas admin, le valider et le hacher
    if (pin !== undefined && pin !== null && pin !== '' && !currentUser.isAdmin) {
      if (!/^\d{4}$/.test(pin)) {
        return NextResponse.json(
          { success: false, message: 'Le code PIN doit contenir exactement 4 chiffres' },
          { status: 400 }
        );
      }
      const hashedPin = await hashPassword(pin);
      updateData.pinHash = hashedPin;
    }

    const [updatedUser] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, currentUser.id))
      .returning();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, pinHash, ...userWithoutSensitiveData } = updatedUser;

    return NextResponse.json({
      success: true,
      user: userWithoutSensitiveData,
      message: 'Profil mis à jour avec succès'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur lors de la mise à jour du profil' },
      { status: 500 }
    );
  }
}
