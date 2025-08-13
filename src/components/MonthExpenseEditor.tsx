'use client';

import { useState, useEffect } from 'react';
import { Expense, ExpenseMonth } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { toast } from 'sonner';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import Cookies from 'js-cookie';

interface MonthExpenseEditorProps {
  monthId: string;
  onClose: () => void;
  onSave: () => void;
}

export default function MonthExpenseEditor({ monthId, onClose, onSave }: MonthExpenseEditorProps) {
  const [expenseMonth, setExpenseMonth] = useState<ExpenseMonth | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMonthData();
  }, [monthId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMonthData = async () => {
    try {
      const token = Cookies.get('auth-token');
      const response = await fetch('/api/expenses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        const month = data.expenseMonths.find((m: ExpenseMonth) => m.id === monthId);
        if (month) {
          setExpenseMonth(month);
          setExpenses([...month.expenses]);
        }
      } else {
        toast.error('Erreur lors du chargement');
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const updateExpense = (index: number, field: keyof Expense, value: string | number) => {
    const newExpenses = [...expenses];
    newExpenses[index] = { ...newExpenses[index], [field]: value };
    setExpenses(newExpenses);
  };

  const addExpense = () => {
    const newExpense: Expense = {
      id: `temp-${Date.now()}`,
      amount: 0,
      description: '',
      date: new Date().toISOString(),
      createdBy: 'Nouveau',
      createdAt: new Date().toISOString()
    };
    setExpenses([...expenses, newExpense]);
  };

  const removeExpense = (index: number) => {
    const newExpenses = expenses.filter((_, i) => i !== index);
    setExpenses(newExpenses);
  };

  const calculateTotal = () => {
    return expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  };

  const handleSave = async () => {
    if (!expenseMonth) return;

    // Valider les dépenses
    const validExpenses = expenses.filter(exp => 
      exp.description.trim() && exp.amount > 0
    );

    if (validExpenses.length === 0) {
      toast.error('Ajoutez au moins une dépense valide');
      return;
    }

    setSaving(true);
    try {
      const token = Cookies.get('auth-token');
      
      // Mettre à jour chaque dépense individuellement
      for (const expense of validExpenses) {
        if (expense.id.startsWith('temp-')) {
          // Nouvelle dépense
          const response = await fetch('/api/expenses', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
              expenses: [{
                ...expense,
                date: expenseMonth.month + '-01' // Garder la date du mois
              }]
            }),
          });

          if (!response.ok) {
            throw new Error('Erreur lors de la sauvegarde');
          }
        } else {
          // Dépense existante - mise à jour
          const response = await fetch(`/api/expenses/${expense.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(expense),
          });

          if (!response.ok) {
            throw new Error('Erreur lors de la mise à jour');
          }
        }
      }

      // Supprimer les dépenses qui ont été retirées
      const originalIds = expenseMonth.expenses.map(e => e.id);
      const currentIds = validExpenses.map(e => e.id).filter(id => !id.startsWith('temp-'));
      const deletedIds = originalIds.filter(id => !currentIds.includes(id));

      for (const deletedId of deletedIds) {
        await fetch(`/api/expenses/${deletedId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }

      toast.success('Modifications sauvegardées avec succès');
      onSave();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !expenseMonth) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-3">Chargement...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* En-tête avec navigation claire */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Modifier - {format(new Date(`${expenseMonth.month}-01`), 'MMMM yyyy', { locale: fr })}
              </h2>
              <p className="text-sm text-gray-600">
                {expenses.length} dépense{expenses.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{calculateTotal().toLocaleString()}</div>
            <div className="text-sm text-gray-500">F CFA</div>
          </div>
        </div>
      </div>

      {/* Table d'édition */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Dépenses du mois</h3>
              <Button
                onClick={addExpense}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter une ligne</span>
              </Button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-32">Montant (F CFA)</TableHead>
                    <TableHead className="w-32">Date</TableHead>
                    <TableHead className="w-16">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense, index) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        <Input
                          value={expense.description}
                          onChange={(e) => updateExpense(index, 'description', e.target.value)}
                          placeholder="Description de la dépense"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={expense.amount}
                          onChange={(e) => updateExpense(index, 'amount', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          min="0"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={format(new Date(expense.date), 'yyyy-MM-dd')}
                          onChange={(e) => updateExpense(index, 'date', new Date(e.target.value).toISOString())}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeExpense(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-lg font-semibold">
                Total: {calculateTotal().toLocaleString()} F CFA
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={saving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
                
                <button
                  onClick={handleSave}
                  disabled={saving || expenses.length === 0}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white hover:bg-green-700 rounded-lg font-medium shadow-md hover:shadow-lg transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sauvegarde...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Sauvegarder</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
