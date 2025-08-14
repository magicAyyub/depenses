'use client';

import { NeonAuthProvider, useNeonAuth } from '@/contexts/NeonAuthContext';
import NeonLoginForm from '@/components/NeonLoginForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Toaster } from '@/components/ui/sonner';

function TestContent() {
  const { user, logout, isLoading } = useNeonAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md">
          <NeonLoginForm onSuccess={() => {}} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>🎉 Migration Neon DB réussie !</span>
              <Button onClick={logout} variant="outline">
                Se déconnecter
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Informations utilisateur :</h3>
                <div className="bg-gray-100 p-4 rounded-lg space-y-2">
                  <p><strong>ID:</strong> {user.id}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Nom d&apos;utilisateur:</strong> {user.username}</p>
                  <p><strong>Nom complet:</strong> {user.fullName}</p>
                  <p>
                    <strong>Statut:</strong> 
                    <Badge variant={user.isAdmin ? "default" : "secondary"} className="ml-2">
                      {user.isAdmin ? "Administrateur" : "Utilisateur"}
                    </Badge>
                  </p>
                  <p><strong>Créé le:</strong> {new Date(user.createdAt).toLocaleString('fr-FR')}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-2">✅ Fonctionnalités validées :</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Base de données PostgreSQL Neon configurée</li>
                  <li>• Authentification JWT fonctionnelle</li>
                  <li>• Hachage sécurisé des mots de passe (bcrypt)</li>
                  <li>• Système de cookies HttpOnly pour la sécurité</li>
                  <li>• Types TypeScript avec Drizzle ORM</li>
                  <li>• Gestion des utilisateurs admin/standard</li>
                </ul>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-2">🚀 Prochaines étapes :</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Migrer les composants existants vers la nouvelle API</li>
                  <li>• Implémenter la gestion des dépenses avec Neon DB</li>
                  <li>• Créer l&apos;interface d&apos;administration</li>
                  <li>• Nettoyer les dernières références obsolètes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function TestNeonPage() {
  return (
    <NeonAuthProvider>
      <TestContent />
      <Toaster />
    </NeonAuthProvider>
  );
}
