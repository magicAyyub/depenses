import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// API pour créer un nouveau utilisateur (admin seulement)
export async function POST(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est admin
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

    // Vérifier que l'utilisateur est admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile || !profile.is_admin) {
      return NextResponse.json({ success: false, message: 'Accès non autorisé' }, { status: 403 });
    }

    const { email, password, username, full_name } = await request.json();

    if (!email || !password || !username || !full_name) {
      return NextResponse.json(
        { success: false, message: 'Données manquantes' },
        { status: 400 }
      );
    }

    // Créer l'utilisateur avec l'API Admin de Supabase
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        username,
        full_name
      },
      email_confirm: true // Confirmer l'email automatiquement
    });

    if (createError) {
      return NextResponse.json(
        { success: false, message: createError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.user?.id,
        email: newUser.user?.email,
        username,
        full_name
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la création de l\'utilisateur' },
      { status: 500 }
    );
  }
}

// API pour lister tous les utilisateurs (admin seulement)
export async function GET(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est admin
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

    // Vérifier que l'utilisateur est admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile || !profile.is_admin) {
      return NextResponse.json({ success: false, message: 'Accès non autorisé' }, { status: 403 });
    }

    // Récupérer tous les profils
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la récupération des utilisateurs' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      users: profiles
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    );
  }
}
