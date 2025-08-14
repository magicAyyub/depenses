'use client';

import { useState } from 'react';
import { useNeonAuth } from '@/contexts/NeonAuthContext';
import NeonLoginForm from '@/components/NeonLoginForm';
import Loading from '@/components/Loading';
import SimpleExpenseInput from '@/components/SimpleExpenseInput';
import SimpleExpenseList from '@/components/SimpleExpenseList';
import ExpenseHistory from '@/components/ExpenseHistory';
import { Toaster } from '@/components/ui/sonner';
import { LogOut, Wallet, ArrowLeft, Settings } from 'lucide-react';
import Link from 'next/link';

type ViewMode = 'input' | 'list' | 'history' | 'edit';

export default function Home() {
  const { user, isLoading, logout } = useNeonAuth();
  const [currentView, setCurrentView] = useState<ViewMode>('list'); // Commencer par la liste
  const [editingMonthId, setEditingMonthId] = useState<string | null>(null);

  const handleEditMonth = (monthId: string) => {
    setEditingMonthId(monthId);
    setCurrentView('edit');
  };

  const handleCloseEdit = () => {
    setEditingMonthId(null);
    setCurrentView('list');
  };

  const handleNavigate = (view: 'input' | 'history') => {
    setCurrentView(view);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md">
          <NeonLoginForm onSuccess={() => window.location.reload()} />
        </div>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header simplifié */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wallet className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Dépenses</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 hidden sm:block">
                {user.fullName}
              </span>
              {user.isAdmin && (
                <Link href="/admin">
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Administration">
                    <Settings className="h-5 w-5 text-gray-600" />
                  </button>
                </Link>
              )}              
              <button
                onClick={logout}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Déconnexion"
              >
                <LogOut className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-4xl mx-auto p-6">
        {/* Menu principal - Vue d'accueil */}
        {currentView === 'list' && (
          <div className="space-y-6">
            {/* Liste des dépenses */}
            <SimpleExpenseList 
              onEditMonth={handleEditMonth} 
              onNavigate={handleNavigate}
            />
          </div>
        )}

        {/* Vue saisie avec navigation mobile optimisée */}
        {currentView === 'input' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <button
                onClick={() => setCurrentView('list')}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-300 w-fit"
                title="Retour à l'accueil"
              >
                <ArrowLeft className="h-4 w-4 text-gray-700" />
                <span className="text-gray-700 font-medium">Retour</span>
              </button>
              <h2 className="text-xl font-semibold text-gray-900">Ajouter des dépenses</h2>
            </div>
            <SimpleExpenseInput onSave={() => setCurrentView('list')} />
          </div>
        )}

        {/* Vue historique avec navigation mobile optimisée */}
        {currentView === 'history' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <button
                onClick={() => setCurrentView('list')}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-300 w-fit"
                title="Retour à l'accueil"
              >
                <ArrowLeft className="h-4 w-4 text-gray-700" />
                <span className="text-gray-700 font-medium">Retour</span>
              </button>
              <h2 className="text-xl font-semibold text-gray-900">Historique</h2>
            </div>
            <ExpenseHistory />
          </div>
        )}

        {/* Vue édition avec navigation mobile optimisée */}
        {currentView === 'edit' && editingMonthId && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <button
                onClick={handleCloseEdit}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-300 w-fit"
                title="Retour à l'accueil"
              >
                <ArrowLeft className="h-4 w-4 text-gray-700" />
                <span className="text-gray-700 font-medium">Retour</span>
              </button>
              <h2 className="text-xl font-semibold text-gray-900">Modifier les dépenses</h2>
            </div>
            <div className="text-center py-8">
              <p className="text-gray-600">Fonctionnalité d&apos;édition en cours de développement</p>
              <button 
                onClick={() => setCurrentView('list')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retour à la liste
              </button>
            </div>
          </div>
        )}
      </main>
      
      <Toaster />
    </div>
  );
}
