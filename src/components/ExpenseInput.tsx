'use client';

import { useState, useEffect } from 'react';
import { Expense, ExpenseForm } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { PlusIcon, TrashIcon, CalculatorIcon } from '@heroicons/react/24/outline';

interface ExpenseInputProps {
  onExpensesChange: (expenses: Expense[]) => void;
}

export default function ExpenseInput({ onExpensesChange }: ExpenseInputProps) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<ExpenseForm[]>([
    { amount: '', description: '' }
  ]);
  const [isCalculating, setIsCalculating] = useState(false);

  // Ajouter automatiquement une nouvelle ligne quand la dernière est remplie
  useEffect(() => {
    const lastExpense = expenses[expenses.length - 1];
    if (lastExpense && lastExpense.amount && lastExpense.description) {
      setExpenses(prev => [...prev, { amount: '', description: '' }]);
    }
  }, [expenses]);

  const updateExpense = (index: number, field: keyof ExpenseForm, value: string) => {
    setExpenses(prev => {
      const newExpenses = [...prev];
      newExpenses[index] = { ...newExpenses[index], [field]: value };
      return newExpenses;
    });
  };

  const removeExpense = (index: number) => {
    if (expenses.length > 1) {
      setExpenses(prev => prev.filter((_, i) => i !== index));
    }
  };

  const addExpense = () => {
    setExpenses(prev => [...prev, { amount: '', description: '' }]);
  };

  const calculateTotal = async () => {
    if (!user) return;

    setIsCalculating(true);
    
    // Filtrer les dépenses valides
    const validExpenses = expenses.filter(exp => 
      exp.amount && exp.description && parseFloat(exp.amount) > 0
    );

    if (validExpenses.length === 0) {
      alert('Veuillez saisir au moins une dépense valide');
      setIsCalculating(false);
      return;
    }

    try {
      // Convertir en format Expense
      const processedExpenses: Expense[] = validExpenses.map(exp => ({
        id: '', // Sera généré par l'API
        amount: parseFloat(exp.amount),
        description: exp.description,
        date: new Date().toISOString(),
        createdBy: user.name,
        createdAt: new Date().toISOString()
      }));

      onExpensesChange(processedExpenses);
    } catch (error) {
      console.error('Erreur lors du calcul:', error);
      alert('Erreur lors du calcul des dépenses');
    } finally {
      setIsCalculating(false);
    }
  };

  const getTotalAmount = () => {
    return expenses
      .filter(exp => exp.amount && parseFloat(exp.amount) > 0)
      .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  };

  const getValidExpensesCount = () => {
    return expenses.filter(exp => 
      exp.amount && exp.description && parseFloat(exp.amount) > 0
    ).length;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Saisie des Dépenses</h2>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total en cours</p>
          <p className="text-2xl font-bold text-blue-600">
            {getTotalAmount().toFixed(2)} €
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {expenses.map((expense, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Montant (€)"
                value={expense.amount}
                onChange={(e) => updateExpense(index, 'amount', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex-2">
              <input
                type="text"
                placeholder="Description de la dépense"
                value={expense.description}
                onChange={(e) => updateExpense(index, 'description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex space-x-2">
              {expenses.length > 1 && (
                <button
                  onClick={() => removeExpense(index)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                  title="Supprimer cette ligne"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
              {index === expenses.length - 1 && (
                <button
                  onClick={addExpense}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                  title="Ajouter une ligne"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {getValidExpensesCount()} dépense(s) valide(s) • Total: {getTotalAmount().toFixed(2)} €
        </div>
        
        <button
          onClick={calculateTotal}
          disabled={isCalculating || getValidExpensesCount() === 0}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isCalculating ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <CalculatorIcon className="h-5 w-5" />
          )}
          <span>{isCalculating ? 'Calcul...' : 'Calculer et Valider'}</span>
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        💡 Une nouvelle ligne s&apos;ajoute automatiquement quand vous remplissez la dernière
      </div>
    </div>
  );
}
