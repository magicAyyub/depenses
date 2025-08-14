'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { toast } from 'sonner';
import { Trash2, Plus, Save, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string;
  createdBy: string;
  createdAt: string;
}

interface ExpenseMonthEditorProps {
  monthId: string;
  onClose: () => void;
  onUpdate: () => void;
}

export default function ExpenseMonthEditor({ monthId, onClose, onUpdate }: ExpenseMonthEditorProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [monthData, setMonthData] = useState<{ month: string; year: number } | null>(null);
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Nouvel élément à ajouter
  const [newExpense, setNewExpense] = useState({
    amount: '',
    description: '',
    date: ''
  });

  useEffect(() => {
    const loadMonthExpenses = async () => {
      try {
        const response = await fetch('/api/expenses');
        const data = await response.json();

        if (data.success) {
          // Trouver le mois correspondant
          const targetMonth = data.expenseMonths.find((month: { id: string; month: string; year: number; expenses: Expense[] }) => month.id === monthId);
          if (targetMonth) {
            setExpenses(targetMonth.expenses);
            setMonthData({ month: targetMonth.month, year: targetMonth.year });
            
            // Initialiser la date du nouveau expense avec le mois en cours d'édition
            const monthDate = new Date(targetMonth.year, parseInt(targetMonth.month.split('-')[1]) - 1, 1);
            setNewExpense(prev => ({
              ...prev,
              date: format(monthDate, 'yyyy-MM-dd')
            }));
          }
        } else {
          toast.error('Erreur lors du chargement des dépenses');
        }
      } catch (error) {
        console.error('Erreur:', error);
        toast.error('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    loadMonthExpenses();
  }, [monthId]);

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setExpenses(expenses.filter(exp => exp.id !== expenseId));
        toast.success('Dépense supprimée');
      } else {
        toast.error(data.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedExpenses.size === 0) {
      toast.error('Aucune dépense sélectionnée');
      return;
    }

    setIsDeleting(true);
    try {
      const deletePromises = Array.from(selectedExpenses).map(expenseId =>
        fetch(`/api/expenses/${expenseId}`, { method: 'DELETE' })
      );

      const responses = await Promise.all(deletePromises);
      const results = await Promise.all(responses.map(r => r.json()));

      const successCount = results.filter(r => r.success).length;
      
      if (successCount > 0) {
        setExpenses(expenses.filter(exp => !selectedExpenses.has(exp.id)));
        setSelectedExpenses(new Set());
        toast.success(`${successCount} dépense(s) supprimée(s)`);
      }

      const errorCount = results.length - successCount;
      if (errorCount > 0) {
        toast.error(`Erreur lors de la suppression de ${errorCount} dépense(s)`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectExpense = (expenseId: string, checked: boolean) => {
    const newSelected = new Set(selectedExpenses);
    if (checked) {
      newSelected.add(expenseId);
    } else {
      newSelected.delete(expenseId);
    }
    setSelectedExpenses(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedExpenses(new Set(expenses.map(exp => exp.id)));
    } else {
      setSelectedExpenses(new Set());
    }
  };

  const isAllSelected = expenses.length > 0 && selectedExpenses.size === expenses.length;
  const isSomeSelected = selectedExpenses.size > 0 && selectedExpenses.size < expenses.length;

  const handleAddExpense = async () => {
    if (!newExpense.amount || !newExpense.description || !newExpense.date) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    const amount = parseFloat(newExpense.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Le montant doit être un nombre positif');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          description: newExpense.description,
          date: new Date(newExpense.date).toISOString()
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Ajouter la nouvelle dépense à la liste
        const newExp: Expense = {
          id: data.expense.id,
          amount: amount,
          description: newExpense.description,
          date: new Date(newExpense.date).toISOString(),
          createdBy: 'current-user', // À adapter selon votre système d'auth
          createdAt: new Date().toISOString()
        };
        
        setExpenses([...expenses, newExp]);
        setNewExpense({ amount: '', description: '', date: newExpense.date }); // Garder la même date
        toast.success('Dépense ajoutée');
      } else {
        toast.error(data.message || 'Erreur lors de l\'ajout');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'ajout');
    } finally {
      setSaving(false);
    }
  };

  const getTotalAmount = () => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Chargement...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Informations du mois */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>
              {monthData && 
                format(new Date(monthData.year, parseInt(monthData.month.split('-')[1]) - 1), 'MMMM yyyy', { locale: fr })
              }
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            Total: {getTotalAmount().toFixed(2)} €
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {expenses.length} dépense{expenses.length !== 1 ? 's' : ''}
          </div>
        </CardContent>
      </Card>

      {/* Ajouter une nouvelle dépense */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Ajouter une dépense</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="amount">Montant (€)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={newExpense.amount}
                onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Description de la dépense"
                value={newExpense.description}
                onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
          </div>
          <Button onClick={handleAddExpense} disabled={saving} className="w-full md:w-auto">
            {saving ? 'Ajout...' : 'Ajouter la dépense'}
          </Button>
        </CardContent>
      </Card>

      {/* Liste des dépenses existantes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Dépenses existantes</CardTitle>
            {selectedExpenses.size > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={isDeleting}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer ({selectedExpenses.size})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                    <AlertDialogDescription>
                      Êtes-vous sûr de vouloir supprimer {selectedExpenses.size} dépense(s) ? 
                      Cette action est irréversible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteSelected} disabled={isDeleting}>
                      {isDeleting ? 'Suppression...' : 'Supprimer'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <Alert>
              <AlertDescription>
                Aucune dépense pour ce mois. Ajoutez-en une ci-dessus.
              </AlertDescription>
            </Alert>
          ) : (
            <ScrollArea className="h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                        className={isSomeSelected ? "data-[state=checked]:bg-orange-500" : ""}
                      />
                    </TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedExpenses.has(expense.id)}
                          onCheckedChange={(checked) => handleSelectExpense(expense.id, Boolean(checked))}
                        />
                      </TableCell>
                      <TableCell>
                        {format(new Date(expense.date), 'dd/MM/yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell className="text-right font-medium">
                        {expense.amount.toFixed(2)} €
                      </TableCell>
                      <TableCell className="text-center">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer cette dépense &ldquo;{expense.description}&rdquo; 
                                de {expense.amount.toFixed(2)} € ? Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteExpense(expense.id)}>
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button onClick={() => { onUpdate(); onClose(); }}>
          <Save className="h-4 w-4 mr-2" />
          Terminer
        </Button>
      </div>
    </div>
  );
}
