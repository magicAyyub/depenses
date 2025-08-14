import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrashIcon, 
  UserIcon, 
  ShieldCheckIcon, 
  ShieldExclamationIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserManagementProps {
  currentUser: User;
}

export default function UserManagement({ currentUser }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // États pour la création d'utilisateur
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    email: '',
    username: '',
    fullName: '',
    password: '',
    isAdmin: false
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      } else {
        setError(data.message || 'Erreur lors du chargement des utilisateurs');
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    try {
      setActionLoading(userId);
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchUsers();
        toast.success(data.message);
      } else {
        toast.error(data.message || 'Erreur lors de la suppression');
      }
    } catch {
      toast.error('Erreur de connexion');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleAdmin = async (userId: string, currentIsAdmin: boolean) => {
    try {
      setActionLoading(userId);
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isAdmin: !currentIsAdmin }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchUsers();
        toast.success(data.message);
      } else {
        toast.error(data.message || 'Erreur lors de la modification');
      }
    } catch {
      toast.error('Erreur de connexion');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createFormData.email || !createFormData.username || !createFormData.fullName || !createFormData.password) {
      toast.error('Tous les champs sont requis');
      return;
    }

    try {
      setActionLoading('create');
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createFormData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchUsers();
        setShowCreateDialog(false);
        setCreateFormData({
          email: '',
          username: '',
          fullName: '',
          password: '',
          isAdmin: false
        });
        toast.success(data.message);
      } else {
        toast.error(data.message || 'Erreur lors de la création');
      }
    } catch {
      toast.error('Erreur de connexion');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <UserIcon className="h-6 w-6 text-blue-600" />
              Gestion des Utilisateurs
            </h2>
            <p className="text-gray-600 mt-1">Gérez les utilisateurs et leurs permissions</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Chargement des utilisateurs...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <UserIcon className="h-6 w-6 text-blue-600" />
              Gestion des Utilisateurs
            </h2>
            <p className="text-gray-600 mt-1">Gérez les utilisateurs et leurs permissions</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <XMarkIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchUsers} variant="outline">
                Réessayer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
              <PlusIcon className="h-4 w-4" />
              Nouveau utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
              <DialogDescription>
                Remplissez les informations pour créer un nouveau compte utilisateur.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={createFormData.email}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="username">Nom d&apos;utilisateur</Label>
                  <Input
                    id="username"
                    value={createFormData.username}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="nom_utilisateur"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="fullName">Nom complet</Label>
                  <Input
                    id="fullName"
                    value={createFormData.fullName}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Nom Prénom"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={createFormData.password}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Mot de passe sécurisé"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="isAdmin"
                  type="checkbox"
                  checked={createFormData.isAdmin}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, isAdmin: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="isAdmin" className="text-sm">Droits d&apos;administrateur</Label>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateDialog(false)}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={actionLoading === 'create'}
                >
                  {actionLoading === 'create' ? 'Création...' : 'Créer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Grid */}
      {users.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun utilisateur</h3>
              <p className="text-gray-600">Commencez par créer votre premier utilisateur.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {users.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-all duration-200 border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-medium text-sm">
                      {getUserInitials(user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900 truncate text-sm">
                        {user.fullName}
                      </h3>
                      {user.id === currentUser.id && (
                        <Badge variant="outline" className="border-blue-200 text-blue-700 text-xs px-1.5 py-0.5">
                          Vous
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                  </div>

                  <div className="flex flex-col items-end space-y-1">
                    {user.isAdmin ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs px-2 py-0.5">
                        <ShieldCheckIcon className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600">
                        Utilisateur
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm text-gray-600 truncate">{user.email}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Créé le {formatDate(user.createdAt)}
                  </p>
                </div>

                {user.id !== currentUser.id && (
                  <div className="flex space-x-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={actionLoading === user.id}
                          className="flex-1 h-8 text-xs"
                        >
                          {user.isAdmin ? (
                            <>
                              <ShieldExclamationIcon className="h-3 w-3 mr-1" />
                              Retirer
                            </>
                          ) : (
                            <>
                              <ShieldCheckIcon className="h-3 w-3 mr-1" />
                              Promouvoir
                            </>
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {user.isAdmin ? 'Retirer les droits admin' : 'Accorder les droits admin'}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {user.isAdmin 
                              ? `Retirer les droits administrateur de ${user.fullName} ?`
                              : `Accorder les droits administrateur à ${user.fullName} ?`
                            }
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleToggleAdmin(user.id, user.isAdmin)}
                            className={user.isAdmin ? "bg-orange-600 hover:bg-orange-700" : "bg-emerald-600 hover:bg-emerald-700"}
                          >
                            {user.isAdmin ? 'Retirer' : 'Promouvoir'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={actionLoading === user.id}
                          className="h-8 px-3"
                        >
                          <TrashIcon className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer l&apos;utilisateur</AlertDialogTitle>
                          <AlertDialogDescription>
                            Supprimer définitivement {user.fullName} ? Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteUser(user.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}

                {actionLoading === user.id && (
                  <div className="flex items-center justify-center mt-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
