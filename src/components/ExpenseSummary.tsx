'use client';

import { useState } from 'react';
import { Expense } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  CheckCircleIcon, 
  XMarkIcon, 
  CurrencyEuroIcon,
  CalendarIcon,
  UserIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline';

interface ExpenseSummaryProps {
  expenses: Expense[];
  onSave: () => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

export default function ExpenseSummary({ 
  expenses, 
  onSave, 
  onCancel, 
  isSaving 
}: ExpenseSummaryProps) {
  const { user } = useAuth();
  const [showDetails, setShowDetails] = useState(true);

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const currentDate = new Date();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      {/* En-tête avec total */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Récapitulatif des Dépenses
        </h2>
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <CurrencyEuroIcon className="h-8 w-8" />
            <span className="text-4xl font-bold">
              {total.toFixed(2)} €
            </span>
          </div>
          <p className="text-blue-100">
            {expenses.length} dépense{expenses.length > 1 ? 's' : ''} • 
            {format(currentDate, 'EEEE d MMMM yyyy', { locale: fr })}
          </p>
        </div>
      </div>

      {/* Informations de contexte */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <UserIcon className="h-5 w-5" />
            <span className="font-medium">Saisi par</span>
          </div>
          <p className="text-lg font-semibold text-gray-900 mt-1">{user?.name}</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <CalendarIcon className="h-5 w-5" />
            <span className="font-medium">Date</span>
          </div>
          <p className="text-lg font-semibold text-gray-900 mt-1">
            {format(currentDate, 'dd/MM/yyyy')}
          </p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <ListBulletIcon className="h-5 w-5" />
            <span className="font-medium">Nombre</span>
          </div>
          <p className="text-lg font-semibold text-gray-900 mt-1">
            {expenses.length} dépense{expenses.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Toggle des détails */}
      <div className="mb-4">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
        >
          <span>{showDetails ? 'Masquer' : 'Afficher'} les détails</span>
          <div className={`transform transition-transform ${showDetails ? 'rotate-180' : ''}`}>
            ↓
          </div>
        </button>
      </div>

      {/* Détail des dépenses */}
      {showDetails && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Détail des Dépenses</h3>
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expenses.map((expense, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {expense.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          {expense.amount.toFixed(2)} €
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-blue-50 border-t-2 border-blue-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-base font-bold text-blue-900">
                        TOTAL
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-base font-bold text-blue-900">
                        {total.toFixed(2)} €
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 sm:space-x-4">
        <button
          onClick={onCancel}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
        >
          <XMarkIcon className="h-5 w-5" />
          <span>Modifier</span>
        </button>

        <div className="flex space-x-3 w-full sm:w-auto">
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <CheckCircleIcon className="h-5 w-5" />
            )}
            <span>{isSaving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
          </button>
        </div>
      </div>

      {/* Note informative */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>ℹ️ Information :</strong> Une fois sauvegardées, vos dépenses seront ajoutées à la liste mensuelle 
          et pourront être consultées, modifiées ou exportées en PDF.
        </p>
      </div>
    </div>
  );
}
