'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PiggyBank, Edit2, Plus, TrendingDown, TrendingUp, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency, parseUserNumber } from '@/lib/utils';

interface MonthlyBudget {
  id: string;
  month: string;
  year: number;
  initialCapital: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface BudgetManagerProps {
  month: string; // Format YYYY-MM
  year: number;
  totalExpenses: number;
  onBudgetUpdate?: () => void;
}

export default function BudgetManager({ month, year, totalExpenses, onBudgetUpdate }: BudgetManagerProps) {
  const [budget, setBudget] = useState<MonthlyBudget | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const [formData, setFormData] = useState({
    initialCapital: '',
    description: ''
  });

  useEffect(() => {
    const loadBudget = async () => {
      try {
        const response = await fetch(`/api/budgets?month=${month}&year=${year}`);
        const data = await response.json();

        if (data.success) {
          setBudget(data.budget);
          if (data.budget) {
            setFormData({
              initialCapital: parseFloat(data.budget.initialCapital).toString(),
              description: data.budget.description || ''
            });
          }
        } else {
          // Pas de budget trouvé, c'est normal
          setBudget(null);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du budget:', error);
        toast.error('Erreur lors du chargement du budget');
      } finally {
        setLoading(false);
      }
    };

    loadBudget();
  }, [month, year]);

  const handleSave = async () => {
    if (!formData.initialCapital) {
      toast.error('Veuillez saisir un capital initial');
      return;
    }

    const capital = parseUserNumber(formData.initialCapital);
    if (isNaN(capital) || capital <= 0) {
      toast.error('Le capital doit être un nombre positif');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          month,
          year,
          initialCapital: capital,
          description: formData.description
        }),
      });

      const data = await response.json();

      if (data.success) {
        setBudget(data.budget);
        setShowForm(false);
        toast.success(data.message);
        if (onBudgetUpdate) {
          onBudgetUpdate();
        }
      } else {
        toast.error(data.message || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!budget) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/budgets?month=${month}&year=${year}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setBudget(null);
        setShowDeleteConfirm(false);
        setFormData({ initialCapital: '', description: '' });
        toast.success('Budget supprimé avec succès');
        if (onBudgetUpdate) {
          onBudgetUpdate();
        }
      } else {
        toast.error(data.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  const getRemaining = () => {
    if (!budget) return 0;
    return parseFloat(budget.initialCapital) - totalExpenses;
  };

  const getPercentageUsed = () => {
    if (!budget || parseFloat(budget.initialCapital) === 0) return 0;
    return (totalExpenses / parseFloat(budget.initialCapital)) * 100;
  };

  const isOverBudget = () => {
    return getRemaining() < 0;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Chargement du budget...</div>
        </CardContent>
      </Card>
    );
  }

  const monthName = format(new Date(year, parseInt(month.split('-')[1]) - 1), 'MMMM yyyy', { locale: fr });

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PiggyBank className="h-6 w-6 text-blue-600" />
            <span>Budget - {monthName}</span>
          </div>
          
          {budget ? (
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowForm(true)}
                className="flex items-center space-x-1"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:border-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span>Définir</span>
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {budget ? (
          <div className="space-y-4">
            {/* Informations du budget */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(parseFloat(budget.initialCapital))} F CFA
                </div>
                <div className="text-sm text-gray-600">Capital initial</div>
                {budget.description && (
                  <div className="text-xs text-gray-500 mt-1">&ldquo;{budget.description}&rdquo;</div>
                )}
              </div>
              
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(totalExpenses)} F CFA
                </div>
                <div className="text-sm text-gray-600">Dépenses</div>
                <div className="text-xs text-gray-500 mt-1">
                  {getPercentageUsed().toFixed(1)}% utilisé
                </div>
              </div>
              
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className={`text-2xl font-bold ${isOverBudget() ? 'text-red-600' : 'text-green-600'}`}>
                  {isOverBudget() && '-'}{formatCurrency(Math.abs(getRemaining()))} F CFA
                </div>
                <div className="text-sm text-gray-600 flex items-center justify-center space-x-1">
                  {isOverBudget() ? (
                    <>
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      <span>Dépassement</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span>Restant</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Barre de progression */}
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  isOverBudget() ? 'bg-red-500' : getPercentageUsed() > 80 ? 'bg-orange-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(getPercentageUsed(), 100)}%` }}
              ></div>
            </div>

            {isOverBudget() && (
              <Alert variant="destructive">
                <AlertDescription>
                  Attention ! Vous avez dépassé votre budget de {formatCurrency(Math.abs(getRemaining()))} F CFA
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <Alert>
            <AlertDescription>
              Aucun budget défini pour ce mois. Cliquez sur &ldquo;Définir&rdquo; pour ajouter votre capital initial.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      {/* Dialog pour définir/modifier le budget */}
      <AlertDialog open={showForm} onOpenChange={setShowForm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {budget ? 'Modifier le budget' : 'Définir le budget'} - {monthName}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Définissez le capital initial que vous avez reçu pour ce mois.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="capital">Capital initial (F CFA)</Label>
              <Input
                id="capital"
                type="number"
                placeholder="200000"
                value={formData.initialCapital}
                onChange={(e) => setFormData(prev => ({ ...prev, initialCapital: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="description">Description (optionnel)</Label>
              <Input
                id="description"
                placeholder="Capital donné par papa"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleSave} disabled={saving}>
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le budget - {monthName}</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le budget de ce mois ? Cette action est irréversible.
              <br />
              <strong>Capital: {budget && formatCurrency(parseFloat(budget.initialCapital))} F CFA</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
