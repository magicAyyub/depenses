// Helper pour les requêtes authentifiées avec Neon DB
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const defaultOptions: RequestInit = {
    credentials: 'include', // Important pour envoyer les cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
      throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    console.error('Erreur lors de la requête:', error);
    throw error;
  }
}

// Helper pour récupérer les headers d'authentification (compatibilité avec l'ancien code)
export async function getAuthHeaders(): Promise<Record<string, string>> {
  // Avec Neon DB, l'authentification se fait via les cookies
  // On retourne un objet vide car les cookies sont automatiquement envoyés
  return {};
}
