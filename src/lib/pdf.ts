import jsPDF from 'jspdf';
import { ExpenseMonth, OldExpense } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function exportToPDF(expenseMonth: ExpenseMonth): void {
  const doc = new jsPDF();
  
  // Configuration
  const margin = 20;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let currentY = margin;
  
  // Titre
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Relevé des Dépenses Familiales', pageWidth / 2, currentY, { align: 'center' });
  currentY += 15;
  
  // Période
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  const monthName = format(new Date(`${expenseMonth.month}-01`), 'MMMM yyyy', { locale: fr });
  doc.text(`Période: ${monthName}`, pageWidth / 2, currentY, { align: 'center' });
  currentY += 20;
  
  // Total
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total: ${expenseMonth.total.toLocaleString()} F CFA`, pageWidth / 2, currentY, { align: 'center' });
  currentY += 25;
  
  // En-têtes du tableau
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  
  const headers = ['Date', 'Description', 'Montant (F CFA)', 'Saisi par'];
  const colWidths = [35, 70, 40, 35];
  let currentX = margin;
  
  // Dessiner les en-têtes
  headers.forEach((header, index) => {
    doc.text(header, currentX, currentY);
    currentX += colWidths[index];
  });
  
  currentY += 5;
  
  // Ligne sous les en-têtes
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 10;
  
  // Contenu du tableau
  doc.setFont('helvetica', 'normal');
  
  expenseMonth.expenses.forEach((expense: OldExpense) => {
    // Vérifier si on a besoin d'une nouvelle page
    if (currentY > pageHeight - 30) {
      doc.addPage();
      currentY = margin;
    }
    
    currentX = margin;
    
    // Date
    const formattedDate = format(new Date(expense.date), 'dd/MM/yyyy');
    doc.text(formattedDate, currentX, currentY);
    currentX += colWidths[0];
    
    // Description (tronquer si trop long)
    let description = expense.description;
    if (description.length > 35) {
      description = description.substring(0, 32) + '...';
    }
    doc.text(description, currentX, currentY);
    currentX += colWidths[1];
    
    // Montant
    doc.text(`${expense.amount.toLocaleString()} F CFA`, currentX, currentY);
    currentX += colWidths[2];
    
    // Saisi par
    doc.text(expense.createdBy, currentX, currentY);
    
    currentY += 8;
  });
  
  // Ligne de séparation avant le total
  currentY += 5;
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 10;
  
  // Total final
  doc.setFont('helvetica', 'bold');
  doc.text(`TOTAL: ${expenseMonth.total.toLocaleString()} F CFA`, pageWidth - margin - 60, currentY);
  
  // Informations de bas de page
  currentY = pageHeight - 30;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm')}`, margin, currentY);
  
  if (expenseMonth.lastModifiedAt) {
    const lastModified = format(new Date(expenseMonth.lastModifiedAt), 'dd/MM/yyyy à HH:mm');
    doc.text(`Dernière modification: ${lastModified} par ${expenseMonth.lastModifiedBy}`, margin, currentY + 10);
  }
  
  // Télécharger le PDF
  const fileName = `depenses-${expenseMonth.month}.pdf`;
  doc.save(fileName);
}

export function exportAllExpensesToPDF(expenseMonths: ExpenseMonth[]): void {
  const doc = new jsPDF();
  
  // Configuration
  const margin = 20;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let currentY = margin;
  
  // Titre principal
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Récapitulatif Complet des Dépenses', pageWidth / 2, currentY, { align: 'center' });
  currentY += 20;
  
  // Total général
  const totalGeneral = expenseMonths.reduce((sum, month) => sum + month.total, 0);
  doc.setFontSize(16);
  doc.text(`Total Général: ${totalGeneral.toFixed(2)} €`, pageWidth / 2, currentY, { align: 'center' });
  currentY += 25;
  
  // Résumé par mois
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Résumé par Mois:', margin, currentY);
  currentY += 15;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  expenseMonths.forEach((month) => {
    if (currentY > pageHeight - 30) {
      doc.addPage();
      currentY = margin;
    }
    
    const monthName = format(new Date(`${month.month}-01`), 'MMMM yyyy', { locale: fr });
    doc.text(`${monthName}: ${month.total.toFixed(2)} € (${month.expenses.length} dépenses)`, margin + 10, currentY);
    currentY += 8;
  });
  
  // Télécharger le PDF
  const fileName = `recap-depenses-${format(new Date(), 'yyyy-MM')}.pdf`;
  doc.save(fileName);
}
