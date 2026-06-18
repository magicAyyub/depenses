import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, hashPassword, generateToken } from '@/lib/auth';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { emailOrUsername, password, pin, newPin } = await request.json();

    if (!emailOrUsername || !password) {
      return NextResponse.json(
        { success: false, message: 'Email/nom d\'utilisateur et mot de passe requis' },
        { status: 400 }
      );
    }

    // Chercher l'utilisateur par email ou username
    const [user] = await db.select().from(users)
      .where(
        emailOrUsername.includes('@') 
          ? eq(users.email, emailOrUsername)
          : eq(users.username, emailOrUsername)
      )
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Utilisateur non trouvé' },
        { status: 401 }
      );
    }

    // Vérifier le mot de passe
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Exclure le mot de passe et le hash du PIN de l'objet utilisateur renvoyé
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, pinHash, ...userWithoutSensitiveData } = user;

    // Si l'utilisateur est admin, il se connecte directement sans PIN
    if (user.isAdmin) {
      const token = generateToken(user.id);
      const response = NextResponse.json({
        success: true,
        user: userWithoutSensitiveData,
        message: 'Connexion réussie (Admin)'
      });

      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 heures
        path: '/'
      });

      return response;
    }

    // Pour un utilisateur normal, vérifier s'il a un code PIN configuré
    if (!user.pinHash) {
      // Étape de configuration du code PIN (premier login ou reset)
      if (!newPin) {
        return NextResponse.json({
          success: true,
          requirePinSetup: true,
          message: 'Veuillez configurer votre code PIN de sécurité.'
        });
      }

      // Valider le nouveau code PIN (uniquement des chiffres, exactement 4 caractères)
      if (!/^\d{4}$/.test(newPin)) {
        return NextResponse.json(
          { success: false, message: 'Le code PIN doit contenir exactement 4 chiffres' },
          { status: 400 }
        );
      }

      // Hacher et sauvegarder le nouveau PIN
      const hashedPin = await hashPassword(newPin);
      await db.update(users)
        .set({ pinHash: hashedPin, updatedAt: new Date() })
        .where(eq(users.id, user.id));

      const token = generateToken(user.id);
      const response = NextResponse.json({
        success: true,
        user: userWithoutSensitiveData,
        message: 'Code PIN configuré et connexion réussie'
      });

      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24,
        path: '/'
      });

      return response;
    } else {
      // Le code PIN existe, il faut le vérifier
      if (!pin) {
        return NextResponse.json({
          success: true,
          requirePinVerify: true,
          message: 'Veuillez saisir votre code PIN de sécurité.'
        });
      }

      // Vérifier le code PIN
      const isPinValid = await verifyPassword(pin, user.pinHash);
      if (!isPinValid) {
        return NextResponse.json(
          { success: false, message: 'Code PIN incorrect' },
          { status: 401 }
        );
      }

      const token = generateToken(user.id);
      const response = NextResponse.json({
        success: true,
        user: userWithoutSensitiveData,
        message: 'Connexion réussie'
      });

      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24,
        path: '/'
      });

      return response;
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

