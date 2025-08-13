import { supabase } from '@/lib/supabase';

// Helper pour récupérer le token d'autorisation pour les requêtes API
export async function getAuthHeaders(): Promise<{ Authorization: string } | Record<string, never>> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      return {
        'Authorization': `Bearer ${session.access_token}`
      };
    }
    
    return {} as Record<string, never>;
  } catch (error) {
    console.error('Erreur lors de la récupération des headers d\'auth:', error);
    return {} as Record<string, never>;
  }
}
