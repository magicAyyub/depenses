import { supabase } from './supabase';
import { User } from '@/types';

export async function signIn(email: string, password: string): Promise<{ success: boolean; user?: User; message?: string }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        message: error.message === 'Invalid login credentials' 
          ? 'Email ou mot de passe incorrect' 
          : error.message
      };
    }

    if (!data.user) {
      return {
        success: false,
        message: 'Erreur lors de la connexion'
      };
    }

    // Récupérer le profil utilisateur
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      return {
        success: false,
        message: 'Profil utilisateur non trouvé'
      };
    }

    return {
      success: true,
      user: {
        id: profile.id,
        email: profile.email,
        username: profile.username,
        full_name: profile.full_name,
        is_admin: profile.is_admin || false
      }
    };
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return {
      success: false,
      message: 'Erreur lors de la connexion'
    };
  }
}

export async function signOut(): Promise<{ success: boolean; message?: string }> {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return {
        success: false,
        message: error.message
      };
    }

    return {
      success: true
    };
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    return {
      success: false,
      message: 'Erreur lors de la déconnexion'
    };
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    // Récupérer le profil utilisateur
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !profile) {
      return null;
    }

    return {
      id: profile.id,
      email: profile.email,
      username: profile.username,
      full_name: profile.full_name,
      is_admin: profile.is_admin || false
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return null;
  }
}

export async function getSession() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Erreur lors de la récupération de la session:', error);
    return null;
  }
}
