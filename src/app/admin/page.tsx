'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNeonAuth } from '@/contexts/NeonAuthContext';
import { Button } from '@/components/ui/button';
import { ShieldCheckIcon, ArrowRightOnRectangleIcon, UserIcon } from '@heroicons/react/24/outline';
import { Toaster } from '@/components/ui/sonner';
import UserManagement from '@/components/UserManagement';
import Loading from '@/components/Loading';
import EditProfileModal from '@/components/EditProfileModal';

export default function AdminPage() {
  const { user, isLoading, logout } = useNeonAuth();
  const router = useRouter();
  const [showProfileDialog, setShowProfileDialog] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || !user.isAdmin) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <ShieldCheckIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Administration</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Gestion des utilisateurs et permissions</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowProfileDialog(true)}
                className="flex items-center gap-2 border-gray-200 hover:bg-gray-50 text-gray-700"
              >
                <UserIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Profil</span>
              </Button>

              <Button variant="outline" onClick={logout} className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Se déconnecter</span>
                <span className="sm:hidden">Déconnexion</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message de bienvenue */}
        <div className="mb-8 text-center lg:text-left">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Bienvenue, {user.fullName}
          </h2>
          <p className="text-gray-600">
            Vous êtes connecté en tant qu&apos;administrateur. Gérez les utilisateurs et leurs permissions.
          </p>
        </div>

        {/* User Management */}
        <UserManagement currentUser={{
          ...user,
          createdAt: typeof user.createdAt === 'string' ? user.createdAt : user.createdAt.toISOString(),
          updatedAt: typeof user.updatedAt === 'string' ? user.updatedAt : user.updatedAt.toISOString()
        }} />
      </main>
      
      <EditProfileModal isOpen={showProfileDialog} onClose={() => setShowProfileDialog(false)} />
      <Toaster />
    </div>
  );
}
