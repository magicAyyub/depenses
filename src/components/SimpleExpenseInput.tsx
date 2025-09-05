'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Trash2, Save, Check, Plus } from 'lucide-react';
import { parseUserNumber, formatCurrency } from '@/lib/utils';

interface ExpenseItem {
  amount: string;
  description: string;
  isComplete: boolean; // Nouveau : pour distinguer les lignes complètes
}

interface ExpenseInputProps {
  onSave?: () => void;
}

export default function SimpleExpenseInput({ onSave }: ExpenseInputProps) {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    { amount: '', description: '', isComplete: false }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Ajouter automatiquement une nouvelle ligne quand la dernière est complète
  useEffect(() => {
    const lastExpense = expenses[expenses.length - 1];
    if (lastExpense && lastExpense.amount && lastExpense.description && !lastExpense.isComplete) {
      // Marquer la ligne comme complète et ajouter une nouvelle
      const newExpenses = [...expenses];
      newExpenses[newExpenses.length - 1] = { ...lastExpense, isComplete: true };
      newExpenses.push({ amount: '', description: '', isComplete: false });
      setExpenses(newExpenses);
      
      // Smooth scroll vers le bas pour montrer la nouvelle ligne
      setTimeout(() => {
        if (scrollAreaRef.current) {
          const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
          if (scrollContainer) {
            scrollContainer.scrollTo({
              top: scrollContainer.scrollHeight,
              behavior: 'smooth'
            });
          }
        }
      }, 150);
    }
  }, [expenses]);

  const removeExpense = (index: number) => {
    if (expenses.length > 1) {
      setExpenses(expenses.filter((_, i) => i !== index));
    }
  };

  const updateExpense = (index: number, field: keyof ExpenseItem, value: string) => {
    const newExpenses = [...expenses];
    newExpenses[index] = { ...newExpenses[index], [field]: value };
    setExpenses(newExpenses);
  };

  const getValidExpenses = () => {
    return expenses.filter(exp => exp.amount && exp.description && parseUserNumber(exp.amount) > 0);
  };

  const getTotal = () => {
    return getValidExpenses().reduce((sum, exp) => sum + parseUserNumber(exp.amount), 0);
  };

  const handlePreview = () => {
    const validExpenses = getValidExpenses();
    if (validExpenses.length === 0) {
      toast.error('Ajoutez au moins une dépense');
      return;
    }
    setShowSummary(true);
  };

  const handleSave = async () => {
    const validExpenses = getValidExpenses();

    if (validExpenses.length === 0) {
      toast.error('Veuillez saisir au moins une dépense');
      return;
    }

    setIsSaving(true);
    try {
      // Traiter les dépenses une par une avec le nouveau format API
      const results = await Promise.all(
        validExpenses.map(async (exp) => {
          const response = await fetch('/api/expenses', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: parseUserNumber(exp.amount), // Utiliser parseUserNumber pour normaliser
              description: exp.description,
              date: new Date().toISOString()
            }),
          });
          return response.json();
        })
      );

      const successCount = results.filter(r => r.success).length;
      
      if (successCount > 0) {
        toast.success(`${successCount} dépense(s) enregistrée(s)`);
        setExpenses([{ amount: '', description: '', isComplete: false }]);
        setShowSummary(false);
        
        // Rediriger vers la liste si une callback est fournie
        if (onSave) {
          setTimeout(() => onSave(), 1000); // Délai pour voir le message de succès
        }
      } else {
        toast.error('Erreur lors de l\'enregistrement des dépenses');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {!showSummary ? (
        // Mode saisie
        <div className="space-y-6">
          {/* Zone de saisie avec scroll */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <ScrollArea className="h-96" ref={scrollAreaRef}>
              <div className="p-1">
                {expenses.map((expense, index) => (
                  <div 
                    key={index} 
                    className={`p-4 m-2 rounded-lg transition-all duration-300 ${
                      expense.isComplete 
                        ? 'bg-green-50 border border-green-200 shadow-sm' 
                        : expense.amount || expense.description
                        ? 'bg-gray-50 border border-gray-200 border-dashed'
                        : 'bg-blue-50 border border-blue-200 border-dashed'
                    }`}
                  >
                    {/* Version mobile : layout vertical */}
                    <div className="block sm:hidden space-y-3">
                      {/* État d'attente user-friendly pour la première ligne vide */}
                      {index === 0 && !expense.amount && !expense.description && (
                        <div className="text-center py-8 text-gray-500">
                          <Plus className="h-8 w-8 mx-auto mb-3 text-gray-400" />
                          <p className="text-sm">Les dépenses saisies apparaîtront ici</p>
                        </div>
                      )}
                      
                      <div>
                        <Input
                          type="number"
                          step="1"
                          min="0"
                          placeholder="Montant en F CFA"
                          value={expense.amount}
                          onChange={(e) => updateExpense(index, 'amount', e.target.value)}
                          className={`w-full transition-all duration-200 ${
                            expense.isComplete 
                              ? 'bg-white border-green-300' 
                              : !expense.amount && !expense.description && index === 0
                              ? 'border-blue-300 bg-blue-50 focus:bg-white'
                              : 'border-gray-300'
                          } focus:border-blue-500 focus:ring-blue-500`}
                          autoFocus={index === 0 && !expense.amount}
                        />
                      </div>
                      <div>
                        <Input
                          placeholder="Qu'avez-vous acheté ?"
                          value={expense.description}
                          onChange={(e) => updateExpense(index, 'description', e.target.value)}
                          className={`w-full transition-all duration-200 ${
                            expense.isComplete 
                              ? 'bg-white border-green-300' 
                              : !expense.amount && !expense.description && index === 0
                              ? 'border-blue-300 bg-blue-50 focus:bg-white'
                              : 'border-gray-300'
                          } focus:border-blue-500 focus:ring-blue-500`}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        {expense.isComplete && (
                          <div className="flex items-center space-x-2 text-green-600 text-sm">
                            <Check className="h-4 w-4" />
                            <span>Ajouté</span>
                          </div>
                        )}
                        {expenses.length > 1 && expense.isComplete && (
                          <button
                            type="button"
                            onClick={() => removeExpense(index)}
                            className="flex items-center space-x-2 px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors text-sm"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Supprimer</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Version desktop : layout horizontal */}
                    <div className="hidden sm:block">
                      {/* État d'attente user-friendly pour la première ligne vide */}
                      {index === 0 && !expense.amount && !expense.description && (
                        <div className="text-center py-12 text-gray-500">
                          <Plus className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p className="text-lg font-medium mb-2">Saisie des dépenses</p>
                          <p className="text-sm">Les dépenses saisies apparaîtront dans cette zone</p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-3">
                          <Input
                            type="number"
                            step="1"
                            min="0"
                            placeholder="Montant"
                            value={expense.amount}
                            onChange={(e) => updateExpense(index, 'amount', e.target.value)}
                            className={`transition-all duration-200 ${
                              expense.isComplete 
                                ? 'bg-white border-green-300' 
                                : !expense.amount && !expense.description && index === 0
                                ? 'border-blue-300 bg-blue-50 focus:bg-white'
                                : 'border-gray-300'
                            } focus:border-blue-500 focus:ring-blue-500`}
                            autoFocus={index === 0 && !expense.amount}
                          />
                        </div>
                        <div className="col-span-7">
                          <Input
                            placeholder="Qu'avez-vous acheté ?"
                            value={expense.description}
                            onChange={(e) => updateExpense(index, 'description', e.target.value)}
                            className={`transition-all duration-200 ${
                              expense.isComplete 
                                ? 'bg-white border-green-300' 
                                : !expense.amount && !expense.description && index === 0
                                ? 'border-blue-300 bg-blue-50 focus:bg-white'
                                : 'border-gray-300'
                            } focus:border-blue-500 focus:ring-blue-500`}
                          />
                        </div>
                        <div className="col-span-2 flex justify-end items-center space-x-2">
                          {expense.isComplete && (
                            <div className="flex items-center text-green-600">
                              <Check className="h-4 w-4" />
                            </div>
                          )}
                          {expenses.length > 1 && expense.isComplete && (
                            <button
                              type="button"
                              onClick={() => removeExpense(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            {/* Actions de saisie */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex justify-center">
                <button
                  onClick={handlePreview}
                  disabled={getValidExpenses().length === 0}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all w-full sm:w-auto justify-center ${
                    getValidExpenses().length === 0
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                  }`}
                >
                  <span>Voir le résumé ({getValidExpenses().length} article{getValidExpenses().length > 1 ? 's' : ''})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Mode résumé/validation
        <div className="space-y-4">
          {/* En-tête du résumé */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Résumé de vos achats</h3>
                <p className="text-sm text-gray-500">{getValidExpenses().length} article{getValidExpenses().length > 1 ? 's' : ''} à enregistrer</p>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-3xl font-bold text-green-600">{formatCurrency(getTotal())}</div>
                <div className="text-sm text-gray-500">F CFA</div>
              </div>
            </div>
          </div>

          {/* Liste des dépenses à valider */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <ScrollArea className="max-h-80">
              <div className="divide-y divide-gray-100">
                {getValidExpenses().map((expense, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{expense.description}</div>
                      </div>
                      <div className="text-lg font-semibold text-gray-900 ml-4">
                        {formatCurrency(parseUserNumber(expense.amount))} F CFA
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            {/* Actions de validation */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowSummary(false)}
                  className="flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all border border-gray-300 bg-white hover:bg-gray-50 w-full sm:w-auto"
                >
                  <span>Modifier</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all w-full sm:flex-1 ${
                    isSaving
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Enregistrer définitivement</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
