'use client';

import { useState, useEffect, useCallback } from 'react';
import { useNeonAuth } from '@/contexts/NeonAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { toast } from 'sonner';
import { UserPlus, Users, ArrowLeft } from 'lucide-react';
import { authenticatedFetch } from '@/lib/neonAuthHelpers';
import { Toaster } from '@/components/ui/sonner';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  createdAt: string;
  isAdmin?: boolean;
}

export default function AdminPage() {
  const { user } = useNeonAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    fullName: '',
    password: '',
    isAdmin: false
  });

  const loadUsers = useCallback(async () => {
    try {
      const response = await authenticatedFetch('/api/admin/users');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors du chargement');
      }

      const result = await response.json();

      if (result.success) {
        setUsers(result.users);
        toast.success('Utilisateurs chargés avec succès');
      } else {
        toast.error(result.message || 'Erreur lors du chargement des utilisateurs');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Erreur:', error);
      toast.error(`Erreur: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await authenticatedFetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création');
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success('Utilisateur créé avec succès !');
        setFormData({ email: '', username: '', fullName: '', password: '', isAdmin: false });
        setShowCreateForm(false);
        loadUsers(); // Recharger la liste
      } else {
        throw new Error(data.message || 'Erreur lors de la création de l\'utilisateur');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Erreur:', error);
      toast.error(`Erreur: ${errorMessage}`);
    } finally {
      setCreating(false);
    }
  };

  // Vérifier si l'utilisateur a accès à l'admin
  const isAdmin = user?.isAdmin;

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4">Accès non autorisé</h2>
            <p className="text-gray-600 mb-6">
              Vous n&apos;avez pas les permissions pour accéder à cette page.
            </p>
            <Link href="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à l&apos;accueil
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
            <p className="text-gray-600">Gestion des comptes utilisateurs</p>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à l&apos;app
              </Button>
            </Link>
            <Button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center space-x-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>Créer un utilisateur</span>
            </Button>
          </div>
        </div>

        {/* Formulaire de création */}
        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Créer un nouvel utilisateur</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      placeholder="utilisateur@exemple.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Nom d&apos;utilisateur</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      required
                      placeholder="nom_utilisateur"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fullName">Nom complet</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      required
                      placeholder="Prénom Nom"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      placeholder="Mot de passe sécurisé"
                      minLength={6}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isAdmin"
                    checked={formData.isAdmin}
                    onChange={(e) => setFormData(prev => ({ ...prev, isAdmin: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="isAdmin">Administrateur</Label>
                </div>
                <div className="flex space-x-4">
                  <Button type="submit" disabled={creating}>
                    {creating ? 'Création...' : 'Créer l\'utilisateur'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateForm(false)}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Liste des utilisateurs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Utilisateurs ({users.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Chargement...</p>
              </div>
            ) : users.length === 0 ? (
              <Alert>
                <AlertDescription>
                  Aucun utilisateur trouvé.
                </AlertDescription>
              </Alert>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Nom d&apos;utilisateur</TableHead>
                    <TableHead>Nom complet</TableHead>
                    <TableHead>Date de création</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((userData) => (
                    <TableRow key={userData.id}>
                      <TableCell className="font-medium">{userData.email}</TableCell>
                      <TableCell>{userData.username}</TableCell>
                      <TableCell>{userData.fullName}</TableCell>
                      <TableCell>
                        {new Date(userData.createdAt).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={userData.isAdmin ? 'default' : 'secondary'}>
                          {userData.isAdmin ? 'Admin' : 'Utilisateur'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  );
}
