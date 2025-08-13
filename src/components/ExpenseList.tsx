'use client';

import { useState, useEffect } from 'react';
import { ExpenseMonth, Expense } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { exportToPDF, exportAllExpensesToPDF } from '@/lib/pdf';
import { 
  DocumentArrowDownIcon, 
  PencilIcon, 
  TrashIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CurrencyEuroIcon
} from '@heroicons/react/24/outline';
import Cookies from 'js-cookie';

export default function ExpenseList() {
  const { user } = useAuth();
  const [expenseMonths, setExpenseMonths] = useState<ExpenseMonth[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const [editingExpense, setEditingExpense] = useState<{ id: string; amount: string; description: string } | null>(null);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const token = Cookies.get('auth-token');
      const response = await fetch('/api/expenses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setExpenseMonths(data.expenseMonths);
      } else {
        console.error('Erreur lors du chargement:', data.message);
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMonth = (monthId: string) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(monthId)) {
      newExpanded.delete(monthId);
    } else {
      newExpanded.add(monthId);
    }
    setExpandedMonths(newExpanded);
  };

  const startEdit = (expense: Expense) => {
    setEditingExpense({
      id: expense.id,
      amount: expense.amount.toString(),
      description: expense.description
    });
  };

  const cancelEdit = () => {
    setEditingExpense(null);
  };

  const saveEdit = async () => {
    if (!editingExpense || !user) return;

    try {
      const token = Cookies.get('auth-token');
      const response = await fetch(`/api/expenses/${editingExpense.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(editingExpense.amount),
          description: editingExpense.description
        }),
      });

      const data = await response.json();

      if (data.success) {
        await loadExpenses(); // Recharger la liste
        setEditingExpense(null);
        alert('Dépense modifiée avec succès !');
      } else {
        alert(`Erreur: ${data.message}`);
      }
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      alert('Erreur lors de la modification');
    }
  };

  const deleteExpense = async (expenseId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
      return;
    }

    try {
      const token = Cookies.get('auth-token');
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        await loadExpenses(); // Recharger la liste
        alert('Dépense supprimée avec succès !');
      } else {
        alert(`Erreur: ${data.message}`);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const exportMonthToPDF = (expenseMonth: ExpenseMonth) => {
    exportToPDF(expenseMonth);
  };

  const exportAllToPDF = () => {
    exportAllExpensesToPDF(expenseMonths);
  };

  const getTotalGeneral = () => {
    return expenseMonths.reduce((sum, month) => sum + month.total, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Chargement des dépenses...</span>
      </div>
    );
  }

  if (expenseMonths.length === 0) {
    return (
      <div className="text-center py-12">
        <CurrencyEuroIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune dépense</h3>
        <p className="mt-1 text-sm text-gray-500">
          Commencez par saisir vos premières dépenses.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Historique des Dépenses</h2>
            <p className="text-gray-600 mt-1">
              {expenseMonths.length} mois • Total général: {getTotalGeneral().toFixed(2)} €
            </p>
          </div>
          <button
            onClick={exportAllToPDF}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <DocumentArrowDownIcon className="h-5 w-5" />
            <span>Exporter Tout</span>
          </button>
        </div>
      </div>

      {/* Liste des mois */}
      <div className="space-y-4">
        {expenseMonths.map((expenseMonth) => (
          <div key={expenseMonth.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* En-tête du mois */}
            <div className="px-6 py-4 bg-gray-50 border-b">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => toggleMonth(expenseMonth.id)}
                  className="flex items-center space-x-3 text-left"
                >
                  <div className="flex-shrink-0">
                    {expandedMonths.has(expenseMonth.id) ? (
                      <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronRightIcon className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {format(new Date(`${expenseMonth.month}-01`), 'MMMM yyyy', { locale: fr })}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {expenseMonth.expenses.length} dépense{expenseMonth.expenses.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </button>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900">
                      {expenseMonth.total.toFixed(2)} €
                    </div>
                    {expenseMonth.lastModifiedAt && (
                      <div className="text-xs text-gray-500">
                        Modifié le {format(new Date(expenseMonth.lastModifiedAt), 'dd/MM/yyyy')} par {expenseMonth.lastModifiedBy}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => exportMonthToPDF(expenseMonth)}
                    className="flex items-center space-x-1 px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                    title="Exporter ce mois en PDF"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4" />
                    <span className="text-sm">PDF</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Détail des dépenses (collapsible) */}
            {expandedMonths.has(expenseMonth.id) && (
              <div className="px-6 py-4">
                <div className="space-y-3">
                  {expenseMonth.expenses.map((expense) => (
                    <div 
                      key={expense.id} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      {editingExpense?.id === expense.id ? (
                        // Mode édition
                        <div className="flex items-center space-x-3 flex-1">
                          <input
                            type="number"
                            step="0.01"
                            value={editingExpense.amount}
                            onChange={(e) => setEditingExpense({
                              ...editingExpense,
                              amount: e.target.value
                            })}
                            className="w-24 px-2 py-1 border border-gray-300 rounded"
                          />
                          <input
                            type="text"
                            value={editingExpense.description}
                            onChange={(e) => setEditingExpense({
                              ...editingExpense,
                              description: e.target.value
                            })}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded"
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={saveEdit}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                            >
                              Sauver
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Mode affichage
                        <>
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <div className="font-semibold text-gray-900">
                                {expense.amount.toFixed(2)} €
                              </div>
                              <div className="text-gray-700">
                                {expense.description}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {format(new Date(expense.date), 'dd/MM/yyyy')} • 
                              Saisi par {expense.createdBy}
                              {expense.lastModifiedBy && expense.lastModifiedAt && (
                                <> • Modifié par {expense.lastModifiedBy} le {format(new Date(expense.lastModifiedAt), 'dd/MM/yyyy')}</>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => startEdit(expense)}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                              title="Modifier"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteExpense(expense.id)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                              title="Supprimer"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
