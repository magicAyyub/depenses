import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// API pour créer un nouveau utilisateur (admin seulement) - VERSION DEBUG
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 DEBUG POST - Start');
    
    // Vérifier que l'utilisateur est admin
    const authHeader = request.headers.get('authorization');
    console.log('🔍 DEBUG POST - Auth header présent:', !!authHeader);
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('❌ DEBUG POST - Token manquant');
      return NextResponse.json({ success: false, message: 'Token manquant' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    console.log('🔍 DEBUG POST - Token length:', token.length);
    
    // Vérifier le token avec Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    console.log('🔍 DEBUG POST - User ID:', user?.id);
    console.log('🔍 DEBUG POST - Email:', user?.email);
    console.log('🔍 DEBUG POST - Auth error:', error?.message);
    
    if (error || !user) {
      console.log('❌ DEBUG POST - Token invalide:', error?.message);
      return NextResponse.json({ success: false, message: 'Token invalide' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est admin
    console.log('🔍 DEBUG POST - Checking profile for user ID:', user.id);
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin, email, username, id')
      .eq('id', user.id)
      .single();

    console.log('🔍 DEBUG POST - Profile data:', JSON.stringify(profile, null, 2));
    console.log('🔍 DEBUG POST - Profile error:', profileError?.message);

    if (!profile) {
      console.log('❌ DEBUG POST - Profile not found');
      return NextResponse.json({ success: false, message: 'Profil non trouvé' }, { status: 403 });
    }

    if (!profile.is_admin) {
      console.log('❌ DEBUG POST - Not admin - is_admin:', profile.is_admin);
      return NextResponse.json({ success: false, message: 'Accès non autorisé - pas admin' }, { status: 403 });
    }

    console.log('✅ DEBUG POST - User is admin, proceeding...');

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
      console.log('❌ DEBUG POST - Create error:', createError.message);
      return NextResponse.json(
        { success: false, message: createError.message },
        { status: 400 }
      );
    }

    console.log('✅ DEBUG POST - User created successfully');
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
    console.error('❌ DEBUG POST - Erreur:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la création de l\'utilisateur' },
      { status: 500 }
    );
  }
}

// API pour lister tous les utilisateurs (admin seulement) - VERSION DEBUG
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 DEBUG GET - Start');
    
    // Vérifier que l'utilisateur est admin
    const authHeader = request.headers.get('authorization');
    console.log('🔍 DEBUG GET - Auth header présent:', !!authHeader);
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('❌ DEBUG GET - Token manquant');
      return NextResponse.json({ success: false, message: 'Token manquant' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    console.log('🔍 DEBUG GET - Token length:', token.length);
    
    // Vérifier le token avec Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    console.log('🔍 DEBUG GET - User ID:', user?.id);
    console.log('🔍 DEBUG GET - Email:', user?.email);
    console.log('🔍 DEBUG GET - Auth error:', error?.message);
    
    if (error || !user) {
      console.log('❌ DEBUG GET - Token invalide:', error?.message);
      return NextResponse.json({ success: false, message: 'Token invalide' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est admin
    console.log('🔍 DEBUG GET - Checking profile for user ID:', user.id);
    
    // D'abord, cherchons TOUS les profils pour voir ce qui existe
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('*');
    
    console.log('🔍 DEBUG GET - All profiles count:', allProfiles?.length);
    console.log('🔍 DEBUG GET - All profiles:', JSON.stringify(allProfiles, null, 2));
    
    // Ensuite, cherchons spécifiquement par ID
    const { data: profilesById, error: byIdError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id);
    
    console.log('🔍 DEBUG GET - Profiles by ID count:', profilesById?.length);
    console.log('🔍 DEBUG GET - Profiles by ID:', JSON.stringify(profilesById, null, 2));
    console.log('🔍 DEBUG GET - By ID error:', byIdError?.message);
    
    // Cherchons par email aussi
    const { data: profilesByEmail, error: byEmailError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', user.email);
    
    console.log('🔍 DEBUG GET - Profiles by email count:', profilesByEmail?.length);
    console.log('🔍 DEBUG GET - Profiles by email:', JSON.stringify(profilesByEmail, null, 2));
    console.log('🔍 DEBUG GET - By email error:', byEmailError?.message);

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin, email, username, id')
      .eq('id', user.id)
      .single();

    console.log('🔍 DEBUG GET - Profile data:', JSON.stringify(profile, null, 2));
    console.log('🔍 DEBUG GET - Profile error:', profileError?.message);

    if (!profile) {
      console.log('❌ DEBUG GET - Profile not found');
      return NextResponse.json({ success: false, message: 'Profil non trouvé' }, { status: 403 });
    }

    if (!profile.is_admin) {
      console.log('❌ DEBUG GET - Not admin - is_admin:', profile.is_admin);
      return NextResponse.json({ success: false, message: 'Accès non autorisé - pas admin' }, { status: 403 });
    }

    console.log('✅ DEBUG GET - User is admin, getting users...');

    // Récupérer tous les profils
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.log('❌ DEBUG GET - Profiles error:', profilesError.message);
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la récupération des utilisateurs' },
        { status: 500 }
      );
    }

    console.log('✅ DEBUG GET - Found', profiles?.length, 'users');
    return NextResponse.json({
      success: true,
      users: profiles
    });
  } catch (error) {
    console.error('❌ DEBUG GET - Erreur:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    );
  }
}
