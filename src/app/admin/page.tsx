'use client';

import { useNeonAuth } from '@/contexts/NeonAuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeftIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { Toaster } from '@/components/ui/sonner';
import Link from 'next/link';
import UserManagement from '@/components/UserManagement';

export default function AdminPage() {
  const { user } = useNeonAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="p-3 bg-red-100 rounded-full w-fit mx-auto mb-4">
                  <ShieldCheckIcon className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès restreint</h2>
                <Alert>
                  <AlertDescription>
                    Vous devez être connecté pour accéder à cette page.
                  </AlertDescription>
                </Alert>
                <Link href="/login" className="block mt-6">
                  <Button className="w-full">Se connecter</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="p-3 bg-orange-100 rounded-full w-fit mx-auto mb-4">
                  <ShieldCheckIcon className="h-8 w-8 text-orange-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Droits insuffisants</h2>
                <Alert>
                  <AlertDescription>
                    Vous n&apos;avez pas les droits d&apos;administrateur pour accéder à cette page.
                  </AlertDescription>
                </Alert>
                <Link href="/" className="block mt-6">
                  <Button className="w-full">Retour à l&apos;accueil</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
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
            
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeftIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Retour à l&apos;accueil</span>
                <span className="sm:hidden">Retour</span>
              </Button>
            </Link>
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
      
      <Toaster />
    </div>
  );
}
