'use client';

import { useState, useEffect } from 'react';
import { ExpenseMonth } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { toast } from 'sonner';
import { 
  Download, Calendar, Edit, Plus, History } from 'lucide-react';
import { exportToPDF } from '@/lib/pdf';

interface SimpleExpenseListProps {
  onEditMonth?: (monthId: string) => void;
  onNavigate?: (view: 'input' | 'history') => void;
}

export default function SimpleExpenseList({ 
  onEditMonth,
  onNavigate 
}: SimpleExpenseListProps) {
  const [expenseMonths, setExpenseMonths] = useState<ExpenseMonth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const response = await fetch('/api/expenses');
      const data = await response.json();

      if (data.success) {
        setExpenseMonths(data.expenseMonths);
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

  const getTotalGeneral = () => {
    return expenseMonths.reduce((sum, month) => sum + month.total, 0);
  };

  const handleExportPDF = (expenseMonth: ExpenseMonth) => {
    try {
      exportToPDF(expenseMonth);
      toast.success('PDF généré avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      toast.error('Erreur lors de l\'export PDF');
    }
  };

  if (loading) {
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
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Résumé général */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Liste des dépenses</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {getTotalGeneral().toLocaleString()} F CFA
              </div>
              <div className="text-sm text-gray-500 font-normal">
                Total général
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600">
            {expenseMonths.length} mois enregistré{expenseMonths.length > 1 ? 's' : ''}
          </div>
        </CardContent>
      </Card>

      {/* Accès rapides - Outils compacts */}
      <h2 className="text-lg font-semibold">Accès rapides</h2>
    <div className="flex gap-3">
      <Card className="hover:shadow-md transition-shadow cursor-pointer group w-48" onClick={() => onNavigate?.('input')}>
        <CardContent className="p-4 text-center">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-200 transition-colors">
          <Plus className="h-4 w-4 text-blue-600" />
        </div>
        <h4 className="font-medium text-sm">Nouvelle dépense</h4>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow cursor-pointer group w-48" onClick={() => onNavigate?.('history')}>
        <CardContent className="p-4 text-center">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-green-200 transition-colors">
          <History className="h-4 w-4 text-green-600" />
        </div>
        <h4 className="font-medium text-sm">Historique</h4>
        </CardContent>
      </Card>
    </div>

      {/* Liste des mois */}
      <h2 className="text-lg font-semibold">Liste des mois</h2>
      {expenseMonths.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="mx-auto h-16 w-16 text-gray-300 mb-6" />
            <h3 className="text-xl font-medium text-gray-900 mb-3">
              Aucun mois enregistré
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Commencez par ajouter vos premières dépenses pour pouvoir les consulter et les organiser par mois.
            </p>
          </CardContent>
        </Card>
      ) : (
        expenseMonths.map((expenseMonth) => (
        <Card key={expenseMonth.id}>
          <CardHeader>
            <CardTitle>
              {/* Version desktop */}
              <div className="hidden sm:flex sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {format(new Date(`${expenseMonth.month}-01`), 'MMMM yyyy', { locale: fr })}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {expenseMonth.expenses.length} dépense{expenseMonth.expenses.length > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-xl font-bold text-blue-600">
                      {expenseMonth.total.toLocaleString()} F CFA
                    </div>
                    <div className="text-xs text-gray-500">
                      Total du mois
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportPDF(expenseMonth)}
                    className="flex items-center space-x-1 cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span>PDF</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditMonth?.(expenseMonth.id)}
                    className="h-8 w-8 p-0 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    <Edit className="h-4 w-4 text-gray-700" />
                  </Button>
                </div>
              </div>

              {/* Version mobile optimisée */}
              <div className="block sm:hidden space-y-3">
                <div>
                  <h3 className="text-lg font-semibold">
                    {format(new Date(`${expenseMonth.month}-01`), 'MMMM yyyy', { locale: fr })}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {expenseMonth.expenses.length} dépense{expenseMonth.expenses.length > 1 ? 's' : ''}
                  </p>
                  {/* Prix en dessous sur mobile avec mise en valeur */}
                  <div className="bg-blue-50 px-3 py-2 rounded-lg inline-block">
                    <div className="text-xl font-bold text-blue-600">
                      {expenseMonth.total.toLocaleString()} F CFA
                    </div>
                    <div className="text-xs text-blue-500">
                      Total du mois
                    </div>
                  </div>
                </div>
                
                {/* Actions mobiles */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleExportPDF(expenseMonth)}
                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors text-sm"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export PDF</span>
                  </button>
                  <button
                    onClick={() => onEditMonth?.(expenseMonth.id)}
                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-gray-600 text-white hover:bg-gray-700 rounded-lg transition-colors text-sm"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Modifier</span>
                  </button>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expenseMonth.expenses.length > 0 ? (
              <div>
                {/* Version desktop - Table avec ScrollArea */}
                <div className="hidden md:block">
                  <ScrollArea className="h-64">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Montant (F CFA)</TableHead>
                          <TableHead>Saisi par</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {expenseMonth.expenses.map((expense) => (
                          <TableRow key={expense.id}>
                            <TableCell>
                              {format(new Date(expense.date), 'dd/MM/yyyy')}
                            </TableCell>
                            <TableCell className="font-medium">
                              {expense.description}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {expense.amount.toLocaleString()} F CFA
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{expense.createdBy}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-gray-50">
                          <TableCell colSpan={2} className="font-semibold">
                            TOTAL
                          </TableCell>
                          <TableCell className="text-right font-bold text-lg">
                            {expenseMonth.total.toLocaleString()} F CFA
                          </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  </ScrollArea>
                </div>

                {/* Version mobile - Cards avec ScrollArea et indicateurs */}
                <div className="md:hidden">
                  <div className="relative">
                    <ScrollArea className="h-64 border rounded-lg">
                      <div className="space-y-3 p-3">
                        {expenseMonth.expenses.map((expense) => (
                          <div key={expense.id} className="bg-gray-50 rounded-lg p-3 border">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{expense.description}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {format(new Date(expense.date), 'dd/MM/yyyy')}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-sm">
                                  {expense.amount.toLocaleString()} F CFA
                                </p>
                                <Badge variant="outline" className="text-xs mt-1">
                                  {expense.createdBy}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {/* Total mobile */}
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 sticky bottom-0">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-sm">TOTAL</span>
                            <span className="font-bold text-lg text-blue-700">
                              {expenseMonth.total.toLocaleString()} F CFA
                            </span>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                    
                    {/* Indicateur de scroll - gradient fade en bas */}
                    {expenseMonth.expenses.length > 3 && (
                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none rounded-b-lg" />
                    )}
                    
                    {/* Indicateur textuel de scroll */}
                    {expenseMonth.expenses.length > 3 && (
                      <div className="text-center text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
                        <span>↕</span>
                        <span>Faites défiler pour voir plus</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <Alert>
                <AlertDescription>
                  Aucune dépense pour ce mois.
                </AlertDescription>
              </Alert>
            )}
            
            {expenseMonth.lastModifiedAt && (
              <div className="mt-4 text-xs text-gray-500 border-t pt-2">
                Dernière modification le {format(new Date(expenseMonth.lastModifiedAt), 'dd/MM/yyyy à HH:mm')}
                {' '}par {expenseMonth.lastModifiedBy}
              </div>
            )}
          </CardContent>
        </Card>
      )))}
    </div>
  );
}
