'use client';

import { useState, useEffect } from 'react';
import { ExpenseMonth } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  Download, 
  FileText, 
  TrendingUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { exportToPDF } from '@/lib/pdf';
import { authenticatedFetch } from '@/lib/neonAuthHelpers';

export default function ExpenseHistory() {
  const [expenseMonths, setExpenseMonths] = useState<ExpenseMonth[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const response = await authenticatedFetch('/api/expenses');
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

  const getAvailableYears = () => {
    const years = new Set<number>();
    expenseMonths.forEach(month => {
      years.add(month.year);
    });
    return Array.from(years).sort((a, b) => b - a);
  };

  const getMonthsForYear = (year: number) => {
    return expenseMonths.filter(month => month.year === year)
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const getTotalForYear = (year: number) => {
    return getMonthsForYear(year).reduce((sum, month) => sum + month.total, 0);
  };

  const handleExportPeriod = (months: ExpenseMonth[]) => {
    if (months.length === 0) {
      toast.error('Aucune donnée à exporter pour cette période');
      return;
    }

    try {
      // Créer un objet combiné pour l'export
      const combinedData: ExpenseMonth = {
        id: `export-${Date.now()}`,
        month: months.length === 1 ? months[0].month : `${months[0].month}_${months[months.length - 1].month}`,
        year: selectedYear,
        expenses: months.flatMap(m => m.expenses),
        total: months.reduce((sum, m) => sum + m.total, 0),
        createdAt: new Date().toISOString(),
        lastModifiedAt: new Date().toISOString(),
        lastModifiedBy: 'Export'
      };

      exportToPDF(combinedData);
      toast.success('PDF généré avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      toast.error('Erreur lors de l\'export PDF');
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-3">Chargement de l&apos;historique...</span>
        </CardContent>
      </Card>
    );
  }

  const availableYears = getAvailableYears();
  const yearMonths = getMonthsForYear(selectedYear);

  return (
    <div className="space-y-4">
      {/* En-tête mobile optimisé */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Historique des dépenses</h3>
          </div>
          
          {/* Navigation par année - Mobile optimisée */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={() => setSelectedYear(selectedYear - 1)}
                disabled={!availableYears.includes(selectedYear - 1)}
                className="p-2 hover:bg-gray-100 rounded-lg border border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <Select value={selectedYear.toString()} onValueChange={(value: string) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="w-20 border-0 bg-transparent p-0 h-auto font-semibold text-blue-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <button
                onClick={() => setSelectedYear(selectedYear + 1)}
                disabled={!availableYears.includes(selectedYear + 1)}
                className="p-2 hover:bg-gray-100 rounded-lg border border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Export année complète */}
            {yearMonths.length > 0 && (
              <button
                onClick={() => handleExportPeriod(yearMonths)}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors w-full sm:w-auto"
              >
                <Download className="h-4 w-4" />
                <span>Export {selectedYear}</span>
              </button>
            )}
          </div>
          
          {/* Statistiques année */}
          {yearMonths.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">
                {yearMonths.length} mois avec dépenses en {selectedYear}
              </div>
              <div className="flex items-center space-x-2 text-lg font-bold text-gray-900">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span>{getTotalForYear(selectedYear).toLocaleString()} F CFA</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Liste des mois */}
      {yearMonths.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <FileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Aucune dépense en {selectedYear}
          </h3>
          <p className="text-gray-500">
            Sélectionnez une autre année ou ajoutez des dépenses.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {yearMonths.map((expenseMonth) => (
            <div key={expenseMonth.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* Mobile Layout */}
              <div className="block sm:hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {format(new Date(`${expenseMonth.month}-01`), 'MMMM', { locale: fr })}
                    </h4>
                    <div className="text-lg font-bold text-gray-900">
                      {expenseMonth.total.toLocaleString()} F CFA
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-4">
                    {expenseMonth.expenses.length} dépense{expenseMonth.expenses.length > 1 ? 's' : ''}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleExportPeriod([expenseMonth])}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span>Export PDF</span>
                    </button>
                  </div>
                  
                  {expenseMonth.lastModifiedAt && (
                    <div className="text-xs text-gray-500 mt-3 pt-3 border-t">
                      Modifié le {format(new Date(expenseMonth.lastModifiedAt), 'dd/MM')} 
                      {' '} par {expenseMonth.lastModifiedBy}
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden sm:block p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {format(new Date(`${expenseMonth.month}-01`), 'MMMM', { locale: fr })}
                    </h4>
                    <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {expenseMonth.total.toLocaleString()} F CFA
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-sm text-gray-600">
                      {expenseMonth.expenses.length} dépense{expenseMonth.expenses.length > 1 ? 's' : ''}
                    </div>
                    <button
                      onClick={() => handleExportPeriod([expenseMonth])}
                      className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors text-sm"
                    >
                      <Download className="h-3 w-3" />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
                
                {expenseMonth.lastModifiedAt && (
                  <div className="text-xs text-gray-500 mt-3 pt-3 border-t">
                    Modifié le {format(new Date(expenseMonth.lastModifiedAt), 'dd/MM')} 
                    {' '} par {expenseMonth.lastModifiedBy}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
