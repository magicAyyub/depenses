import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fonction pour normaliser la saisie de nombres (accepter virgule et point)
export function normalizeNumberInput(input: string): string {
  if (!input) return '';
  // Remplacer toutes les virgules par des points pour standardiser
  return input.replace(/,/g, '.');
}

// Fonction pour parser un nombre depuis une saisie utilisateur
export function parseUserNumber(input: string): number {
  const normalized = normalizeNumberInput(input);
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

// Fonction pour formater un nombre pour l'affichage (avec espaces)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    useGrouping: true 
  }).format(amount).replace(/\s/g, ' '); // Remplacer les espaces insécables par des espaces normaux
}
