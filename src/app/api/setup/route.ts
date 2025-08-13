import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    console.log('🔧 SETUP - Creating admin profile...');
    
    // Données du profil admin (basées sur vos logs)
    const adminProfile = {
      id: 'c948c834-e738-4f6c-bd0a-70f00322160e',
      email: 'ayoubadoumbia041@gmail.com',
      is_admin: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('🔧 SETUP - Profile data:', adminProfile);

    // Vérifier si le profil existe déjà
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', adminProfile.id)
      .maybeSingle();

    console.log('🔧 SETUP - Existing profile:', existingProfile);
    console.log('🔧 SETUP - Check error:', checkError);

    if (existingProfile) {
      return NextResponse.json({ 
        success: true, 
        message: 'Profil admin existe déjà',
        profile: existingProfile 
      });
    }

    // Créer le profil
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert([adminProfile])
      .select()
      .single();

    console.log('🔧 SETUP - New profile:', newProfile);
    console.log('🔧 SETUP - Insert error:', insertError);

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Profil admin créé avec succès',
      profile: newProfile 
    });

  } catch (error) {
    console.error('🔧 SETUP - Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        details: error
      },
      { status: 500 }
    );
  }
}
