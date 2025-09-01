import jsPDF from 'jspdf';
import { ExpenseMonth, OldExpense } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Configuration des couleurs et styles
const COLORS = {
  primary: '#1e40af',     // Bleu professionnel
  secondary: '#64748b',   // Gris pour le texte secondaire
  accent: '#f8fafc',      // Gris très clair pour les arrière-plans
  border: '#e2e8f0',     // Gris clair pour les bordures
  success: '#16a34a',     // Vert pour les totaux
  text: '#0f172a'         // Noir pour le texte principal
};

const FONTS = {
  title: { size: 22, weight: 'bold' as const },
  subtitle: { size: 16, weight: 'bold' as const },
  header: { size: 12, weight: 'bold' as const },
  body: { size: 10, weight: 'normal' as const },
  small: { size: 9, weight: 'normal' as const }
};

// Fonction utilitaire pour formater les montants
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: true 
  }).format(amount).replace(/\s/g, ' ') + ' F CFA';
}

// Fonction pour dessiner un rectangle coloré
function drawColoredRect(doc: jsPDF, x: number, y: number, width: number, height: number, color: string): void {
  doc.setFillColor(color);
  doc.rect(x, y, width, height, 'F');
}

// Fonction pour dessiner l'en-tête du document
function drawHeader(doc: jsPDF, title: string, subtitle: string): number {
  const pageWidth = doc.internal.pageSize.width;
  let currentY = 25;
  
  // Bande colorée en haut
  drawColoredRect(doc, 0, 0, pageWidth, 8, COLORS.primary);
  
  // Titre principal
  doc.setTextColor(COLORS.text);
  doc.setFontSize(FONTS.title.size);
  doc.setFont('helvetica', FONTS.title.weight);
  doc.text(title, pageWidth / 2, currentY, { align: 'center' });
  currentY += 12;
  
  // Sous-titre
  doc.setFontSize(FONTS.subtitle.size);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.secondary);
  doc.text(subtitle, pageWidth / 2, currentY, { align: 'center' });
  currentY += 20;
  
  return currentY;
}

// Fonction pour dessiner une section avec titre
function drawSectionHeader(doc: jsPDF, title: string, y: number): number {
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  
  // Rectangle coloré pour la section
  drawColoredRect(doc, margin, y - 2, pageWidth - (2 * margin), 12, COLORS.accent);
  
  // Bordure gauche colorée
  drawColoredRect(doc, margin, y - 2, 3, 12, COLORS.primary);
  
  // Titre de section
  doc.setFontSize(FONTS.subtitle.size);
  doc.setFont('helvetica', FONTS.subtitle.weight);
  doc.setTextColor(COLORS.primary);
  doc.text(title, margin + 8, y + 6);
  
  return y + 20;
}

// Fonction pour dessiner le tableau des dépenses
function drawExpenseTable(doc: jsPDF, expenses: OldExpense[], startY: number): number {
  const margin = 20;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const tableWidth = pageWidth - (2 * margin);
  
  // Configuration des colonnes
  const columns = [
    { header: 'Date', width: 0.2 },
    { header: 'Description', width: 0.4 },
    { header: 'Montant', width: 0.2 },
    { header: 'Saisi par', width: 0.2 }
  ];
  
  let currentY = startY;
  
  // En-tête du tableau
  drawColoredRect(doc, margin, currentY - 2, tableWidth, 12, COLORS.primary);
  
  doc.setTextColor('#ffffff');
  doc.setFontSize(FONTS.header.size);
  doc.setFont('helvetica', FONTS.header.weight);
  
  let currentX = margin + 5;
  columns.forEach((col) => {
    doc.text(col.header, currentX, currentY + 6);
    currentX += tableWidth * col.width;
  });
  
  currentY += 15;
  
  // Lignes du tableau
  expenses.forEach((expense, index) => {
    // Vérifier si on a besoin d'une nouvelle page
    if (currentY > pageHeight - 40) {
      doc.addPage();
      currentY = 30;
      
      // Redessiner l'en-tête du tableau sur la nouvelle page
      drawColoredRect(doc, margin, currentY - 2, tableWidth, 12, COLORS.primary);
      doc.setTextColor('#ffffff');
      doc.setFontSize(FONTS.header.size);
      doc.setFont('helvetica', FONTS.header.weight);
      
      currentX = margin + 5;
      columns.forEach((col) => {
        doc.text(col.header, currentX, currentY + 6);
        currentX += tableWidth * col.width;
      });
      currentY += 15;
    }
    
    // Arrière-plan alterné pour les lignes
    if (index % 2 === 0) {
      drawColoredRect(doc, margin, currentY - 2, tableWidth, 10, COLORS.accent);
    }
    
    // Contenu de la ligne
    doc.setTextColor(COLORS.text);
    doc.setFontSize(FONTS.body.size);
    doc.setFont('helvetica', FONTS.body.weight);
    
    currentX = margin + 5;
    
    // Date
    const formattedDate = format(new Date(expense.date), 'dd/MM/yyyy');
    doc.text(formattedDate, currentX, currentY + 6);
    currentX += tableWidth * columns[0].width;
    
    // Description (avec gestion du texte long)
    let description = expense.description;
    const maxDescLength = 45;
    if (description.length > maxDescLength) {
      description = description.substring(0, maxDescLength - 3) + '...';
    }
    doc.text(description, currentX, currentY + 6);
    currentX += tableWidth * columns[1].width;
    
    // Montant
    const formattedAmount = formatCurrency(expense.amount);
    doc.text(formattedAmount, currentX, currentY + 6);
    currentX += tableWidth * columns[2].width;
    
    // Saisi par
    doc.text(expense.createdBy, currentX, currentY + 6);
    
    currentY += 12;
  });
  
  return currentY;
}

// Fonction pour dessiner le pied de page
function drawFooter(doc: jsPDF, expenseMonth: ExpenseMonth): void {
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const footerY = pageHeight - 25;
  
  // Ligne de séparation
  doc.setDrawColor(COLORS.border);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  
  // Informations de génération
  doc.setFontSize(FONTS.small.size);
  doc.setFont('helvetica', FONTS.small.weight);
  doc.setTextColor(COLORS.secondary);
  
  const generatedAt = format(new Date(), 'dd/MM/yyyy à HH:mm');
  doc.text(`Document généré le ${generatedAt}`, margin, footerY);
  
  if (expenseMonth.lastModifiedAt) {
    const lastModified = format(new Date(expenseMonth.lastModifiedAt), 'dd/MM/yyyy à HH:mm');
    doc.text(`Dernière modification: ${lastModified} par ${expenseMonth.lastModifiedBy}`, margin, footerY + 8);
  }
}

export function exportToPDF(expenseMonth: ExpenseMonth): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  
  // En-tête du document
  const monthName = format(new Date(`${expenseMonth.month}-01`), 'MMMM yyyy', { locale: fr });
  let currentY = drawHeader(doc, 'Relevé des Dépenses', `Période: ${monthName}`);
  
  // Section du total principal
  currentY = drawSectionHeader(doc, 'Total des Dépenses', currentY);
  
  // Encadré du total
  const totalBoxWidth = 120;
  const totalBoxHeight = 25;
  const totalBoxX = (pageWidth - totalBoxWidth) / 2;
  
  drawColoredRect(doc, totalBoxX, currentY - 5, totalBoxWidth, totalBoxHeight, COLORS.success);
  
  doc.setTextColor('#ffffff');
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  const formattedTotal = formatCurrency(expenseMonth.total);
  doc.text(formattedTotal, pageWidth / 2, currentY + 8, { align: 'center' });
  
  currentY += 35;
  
  // Section des détails
  currentY = drawSectionHeader(doc, `Détail des Dépenses (${expenseMonth.expenses.length} entrées)`, currentY);
  
  // Tableau des dépenses
  currentY = drawExpenseTable(doc, expenseMonth.expenses, currentY);
  
  // Ligne de total final
  currentY += 10;
  doc.setDrawColor(COLORS.primary);
  doc.setLineWidth(1);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 8;
  
  // Total final en gras
  doc.setFontSize(FONTS.subtitle.size);
  doc.setFont('helvetica', FONTS.subtitle.weight);
  doc.setTextColor(COLORS.success);
  doc.text(`TOTAL: ${formattedTotal}`, pageWidth - margin - 60, currentY, { align: 'right' });
  
  // Pied de page
  drawFooter(doc, expenseMonth);
  
  // Télécharger le PDF
  const fileName = `depenses-${expenseMonth.month}.pdf`;
  doc.save(fileName);
}

export function exportAllExpensesToPDF(expenseMonths: ExpenseMonth[]): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  
  // En-tête du document
  let currentY = drawHeader(doc, 'Récapitulatif Complet des Dépenses', 
    `Période d'analyse: ${expenseMonths.length} mois`);
  
  // Section du total général
  currentY = drawSectionHeader(doc, 'Total Général', currentY);
  
  const totalGeneral = expenseMonths.reduce((sum, month) => sum + month.total, 0);
  const totalExpenses = expenseMonths.reduce((sum, month) => sum + month.expenses.length, 0);
  
  // Encadré du total général
  const totalBoxWidth = 140;
  const totalBoxHeight = 30;
  const totalBoxX = (pageWidth - totalBoxWidth) / 2;
  
  drawColoredRect(doc, totalBoxX, currentY - 5, totalBoxWidth, totalBoxHeight, COLORS.success);
  
  doc.setTextColor('#ffffff');
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  const formattedTotalGeneral = formatCurrency(totalGeneral);
  doc.text(formattedTotalGeneral, pageWidth / 2, currentY + 8, { align: 'center' });
  
  doc.setFontSize(FONTS.body.size);
  doc.setFont('helvetica', 'normal');
  doc.text(`${totalExpenses} dépenses au total`, pageWidth / 2, currentY + 18, { align: 'center' });
  
  currentY += 45;
  
  // Section résumé par mois
  currentY = drawSectionHeader(doc, 'Résumé Mensuel', currentY);
  
  // Tableau des résumés mensuels
  const summaryTableWidth = pageWidth - (2 * margin);
  const summaryColumns = [
    { header: 'Mois', width: 0.4 },
    { header: 'Nombre de Dépenses', width: 0.3 },
    { header: 'Montant Total', width: 0.3 }
  ];
  
  // En-tête du tableau résumé
  drawColoredRect(doc, margin, currentY - 2, summaryTableWidth, 12, COLORS.primary);
  
  doc.setTextColor('#ffffff');
  doc.setFontSize(FONTS.header.size);
  doc.setFont('helvetica', FONTS.header.weight);
  
  let currentX = margin + 5;
  summaryColumns.forEach((col) => {
    doc.text(col.header, currentX, currentY + 6);
    currentX += summaryTableWidth * col.width;
  });
  
  currentY += 15;
  
  // Lignes du tableau résumé
  expenseMonths.forEach((month, index) => {
    // Vérifier si on a besoin d'une nouvelle page
    if (currentY > pageHeight - 50) {
      doc.addPage();
      currentY = 30;
      
      // Redessiner l'en-tête sur la nouvelle page
      drawColoredRect(doc, margin, currentY - 2, summaryTableWidth, 12, COLORS.primary);
      doc.setTextColor('#ffffff');
      doc.setFontSize(FONTS.header.size);
      doc.setFont('helvetica', FONTS.header.weight);
      
      currentX = margin + 5;
      summaryColumns.forEach((col) => {
        doc.text(col.header, currentX, currentY + 6);
        currentX += summaryTableWidth * col.width;
      });
      currentY += 15;
    }
    
    // Arrière-plan alterné
    if (index % 2 === 0) {
      drawColoredRect(doc, margin, currentY - 2, summaryTableWidth, 10, COLORS.accent);
    }
    
    // Contenu de la ligne
    doc.setTextColor(COLORS.text);
    doc.setFontSize(FONTS.body.size);
    doc.setFont('helvetica', FONTS.body.weight);
    
    currentX = margin + 5;
    
    // Mois
    const monthName = format(new Date(`${month.month}-01`), 'MMMM yyyy', { locale: fr });
    doc.text(monthName, currentX, currentY + 6);
    currentX += summaryTableWidth * summaryColumns[0].width;
    
    // Nombre de dépenses
    doc.text(month.expenses.length.toString(), currentX, currentY + 6);
    currentX += summaryTableWidth * summaryColumns[1].width;
    
    // Montant
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.success);
    const formattedAmount = formatCurrency(month.total);
    doc.text(formattedAmount, currentX, currentY + 6);
    
    currentY += 12;
  });
  
  // Ligne de total final
  currentY += 10;
  doc.setDrawColor(COLORS.primary);
  doc.setLineWidth(2);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 8;
  
  // Total final
  doc.setFontSize(FONTS.subtitle.size);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.success);
  doc.text(`TOTAL GÉNÉRAL: ${formattedTotalGeneral}`, pageWidth / 2, currentY, { align: 'center' });
  
  // Pied de page simple
  const footerY = pageHeight - 20;
  doc.setFontSize(FONTS.small.size);
  doc.setFont('helvetica', FONTS.small.weight);
  doc.setTextColor(COLORS.secondary);
  
  const generatedAt = format(new Date(), 'dd/MM/yyyy à HH:mm');
  doc.text(`Document généré le ${generatedAt}`, pageWidth / 2, footerY, { align: 'center' });
  
  // Télécharger le PDF
  const fileName = `recap-depenses-${format(new Date(), 'yyyy-MM')}.pdf`;
  doc.save(fileName);
}