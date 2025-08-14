import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { emailOrUsername, password } = await request.json();

    if (!emailOrUsername || !password) {
      return NextResponse.json(
        { success: false, message: 'Email/nom d\'utilisateur et mot de passe requis' },
        { status: 400 }
      );
    }

    const result = await signIn(emailOrUsername, password);

    if (result.success && result.token) {
      // Créer la réponse avec le token dans un cookie
      const response = NextResponse.json({
        success: true,
        user: result.user,
        message: result.message
      });

      // Configurer le cookie avec le token
      response.cookies.set('auth-token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 heures
        path: '/'
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: result.message },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
