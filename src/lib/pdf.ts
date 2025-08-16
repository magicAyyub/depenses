import jsPDF from 'jspdf';
import { ExpenseMonth, OldExpense } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function exportToPDF(expenseMonth: ExpenseMonth): void {
  const doc = new jsPDF();
  
  // Configuration et couleurs
  const margin = 20;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let currentY = margin;
  
  // Couleurs
  const primaryColor = [41, 128, 185]; // Bleu moderne
  const secondaryColor = [52, 73, 94]; // Gris foncé
  const accentColor = [231, 76, 60]; // Rouge pour les montants
  const lightGray = [245, 245, 245];
  const darkGray = [149, 165, 166];
  
  // Arrière-plan avec dégradé subtil
  doc.setFillColor(248, 249, 250);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // En-tête avec bande colorée
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 25, 'F');
  
  // Titre principal
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('💰 RELEVÉ DES DÉPENSES', pageWidth / 2, 17, { align: 'center' });
  currentY = 40;
  
  // Card pour la période et le total
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.setDrawColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, currentY, pageWidth - 2 * margin, 35, 3, 3, 'FD');
  
  // Période
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  const monthName = format(new Date(`${expenseMonth.month}-01`), 'MMMM yyyy', { locale: fr });
  doc.text(`📅 Période: ${monthName}`, pageWidth / 2, currentY + 12, { align: 'center' });
  
  // Total avec style
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  const formattedTotal = new Intl.NumberFormat('fr-FR', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: true 
  }).format(expenseMonth.total).replace(/\s/g, ' ');
  doc.text(`💳 Total: ${formattedTotal} F CFA`, pageWidth / 2, currentY + 28, { align: 'center' });
  currentY += 50;
  
  // Titre du tableau
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('📋 Détail des dépenses', margin, currentY);
  currentY += 15;
  
  // En-tête du tableau stylé
  const rowHeight = 12;
  
  // Arrière-plan de l'en-tête
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(margin, currentY - 2, pageWidth - 2 * margin, rowHeight, 'F');
  
  // Bordures du tableau
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(1);
  doc.rect(margin, currentY - 2, pageWidth - 2 * margin, rowHeight);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  
  const headers = ['📅 Date', '📝 Description', '💰 Montant (F CFA)', '👤 Saisi par'];
  const colWidths = [35, 70, 45, 30];
  let currentX = margin + 5;
  
  // Dessiner les en-têtes
  headers.forEach((header, index) => {
    doc.text(header, currentX, currentY + 7);
    currentX += colWidths[index];
  });
  
  currentY += rowHeight;
  
  // Contenu du tableau avec alternance de couleurs
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  expenseMonth.expenses.forEach((expense: OldExpense, index) => {
    // Vérifier si on a besoin d'une nouvelle page
    if (currentY > pageHeight - 40) {
      doc.addPage();
      doc.setFillColor(248, 249, 250);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      currentY = margin;
    }
    
    // Alternance de couleurs pour les lignes
    if (index % 2 === 0) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 249, 250);
    }
    doc.rect(margin, currentY - 2, pageWidth - 2 * margin, rowHeight, 'F');
    
    // Bordures latérales
    doc.setDrawColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, currentY - 2, margin, currentY + rowHeight - 2);
    doc.line(pageWidth - margin, currentY - 2, pageWidth - margin, currentY + rowHeight - 2);
    
    currentX = margin + 5;
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    
    // Date
    const formattedDate = format(new Date(expense.date), 'dd/MM/yyyy');
    doc.text(formattedDate, currentX, currentY + 7);
    currentX += colWidths[0];
    
    // Description (tronquer si trop long)
    let description = expense.description;
    if (description.length > 32) {
      description = description.substring(0, 29) + '...';
    }
    doc.text(description, currentX, currentY + 7);
    currentX += colWidths[1];
    
    // Montant en rouge
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setFont('helvetica', 'bold');
    const formattedAmount = new Intl.NumberFormat('fr-FR', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      useGrouping: true 
    }).format(expense.amount).replace(/\s/g, ' ');
    doc.text(`${formattedAmount}`, currentX, currentY + 7);
    currentX += colWidths[2];
    
    // Saisi par
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont('helvetica', 'normal');
    doc.text(expense.createdBy, currentX, currentY + 7);
    
    currentY += rowHeight;
  });
  
  // Bordure finale du tableau
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(1);
  doc.line(margin, currentY - 2, pageWidth - margin, currentY - 2);
  
  // Section total final avec style
  currentY += 10;
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.roundedRect(pageWidth - margin - 100, currentY, 95, 20, 3, 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  const formattedFinalTotal = new Intl.NumberFormat('fr-FR', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: true 
  }).format(expenseMonth.total).replace(/\s/g, ' ');
  doc.text(`TOTAL: ${formattedFinalTotal} F CFA`, pageWidth - margin - 52, currentY + 13, { align: 'center' });
  
  // Pied de page avec style
  currentY = pageHeight - 35;
  
  // Ligne de séparation
  doc.setDrawColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 8;
  
  // Informations de génération
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`🕒 Généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm')}`, margin, currentY);
  
  if (expenseMonth.lastModifiedAt) {
    const lastModified = format(new Date(expenseMonth.lastModifiedAt), 'dd/MM/yyyy à HH:mm');
    doc.text(`✏️ Dernière modification: ${lastModified} par ${expenseMonth.lastModifiedBy}`, margin, currentY + 8);
  }
  
  // Logo ou watermark subtle
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(8);
  doc.text('💼 Gestionnaire de Dépenses', pageWidth - margin - 40, currentY + 8);
  
  // Télécharger le PDF
  const fileName = `depenses-${expenseMonth.month}.pdf`;
  doc.save(fileName);
}

export function exportAllExpensesToPDF(expenseMonths: ExpenseMonth[]): void {
  const doc = new jsPDF();
  
  // Configuration et couleurs
  const margin = 20;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let currentY = margin;
  
  // Couleurs
  const primaryColor = [41, 128, 185]; // Bleu moderne
  const secondaryColor = [52, 73, 94]; // Gris foncé
  const accentColor = [231, 76, 60]; // Rouge pour les montants
  const lightGray = [245, 245, 245];
  const darkGray = [149, 165, 166];
  
  // Arrière-plan avec dégradé subtil
  doc.setFillColor(248, 249, 250);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // En-tête avec bande colorée
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 25, 'F');
  
  // Titre principal
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('📊 RÉCAPITULATIF COMPLET DES DÉPENSES', pageWidth / 2, 17, { align: 'center' });
  currentY = 40;
  
  // Total général avec style
  const totalGeneral = expenseMonths.reduce((sum, month) => sum + month.total, 0);
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.roundedRect(margin, currentY, pageWidth - 2 * margin, 25, 3, 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  const formattedTotalGeneral = new Intl.NumberFormat('fr-FR', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: true 
  }).format(totalGeneral).replace(/\s/g, ' ');
  doc.text(`💰 Total Général: ${formattedTotalGeneral} F CFA`, pageWidth / 2, currentY + 16, { align: 'center' });
  currentY += 40;
  
  // Résumé par mois
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('📅 Résumé par Mois:', margin, currentY);
  currentY += 20;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  expenseMonths.forEach((month, index) => {
    if (currentY > pageHeight - 30) {
      doc.addPage();
      doc.setFillColor(248, 249, 250);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      currentY = margin;
    }
    
    // Alternance de couleurs pour les lignes
    if (index % 2 === 0) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    }
    doc.roundedRect(margin, currentY - 3, pageWidth - 2 * margin, 15, 2, 2, 'F');
    
    const monthName = format(new Date(`${month.month}-01`), 'MMMM yyyy', { locale: fr });
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text(`📆 ${monthName}:`, margin + 10, currentY + 7);
    
    const formattedMonthTotal = new Intl.NumberFormat('fr-FR', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      useGrouping: true 
    }).format(month.total).replace(/\s/g, ' ');
    
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(`${formattedMonthTotal} F CFA`, pageWidth - margin - 80, currentY + 7);
    
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFont('helvetica', 'normal');
    doc.text(`(${month.expenses.length} dépenses)`, pageWidth - margin - 40, currentY + 7);
    
    currentY += 18;
  });
  
  // Télécharger le PDF
  const fileName = `recap-depenses-${format(new Date(), 'yyyy-MM')}.pdf`;
  doc.save(fileName);
}
