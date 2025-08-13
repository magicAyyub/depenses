# 💰 Application de Gestion des Dépenses Familiales

Une application web moderne développée avec **Next.js** pour gérer les dépenses familiales et éviter les disputes liées aux calculs manuels.

## 🌟 Fonctionnalités

- ✅ **Saisie intuitive** : Interface avec ajout automatique de lignes
- ✅ **Calculs en temps réel** : Total affiché instantanément
- ✅ **Authentification** : Système de connexion sécurisé
- ✅ **Traçabilité complète** : Suivi des modifications avec horodatage
- ✅ **Export PDF** : Rapports professionnels formatés
- ✅ **Interface moderne** : UI/UX optimisée et responsive
- ✅ **Sauvegarde locale** : Fichiers JSON (migration Supabase prévue)

## 🚀 Technologies Utilisées

- **Next.js 14+** (App Router)
- **TypeScript** pour la sécurité du code
- **Tailwind CSS** pour le style moderne
- **Heroicons** pour les icônes
- **jsPDF** pour l'export PDF
- **date-fns** pour la gestion des dates
- **bcryptjs & jsonwebtoken** pour l'authentification

## 🏃‍♂️ Démarrage Rapide

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Installation

1. **Lancer le serveur de développement :**
```bash
npm run dev
```

2. **Ouvrir l'application :**
Rendez-vous sur [http://localhost:3000](http://localhost:3000)

## 👥 Comptes de Test

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| `pere@famille.com` | `password123` | Admin |
| `mere@famille.com` | `password123` | Utilisateur |
| `enfant@famille.com` | `password123` | Utilisateur |

## 📖 Guide d'Utilisation

### 1. Connexion
- Utilisez un des comptes de test ci-dessus
- Cliquez sur "Se connecter"

### 2. Saisie des Dépenses
- Entrez le montant et la description
- Une nouvelle ligne s'ajoute automatiquement
- Cliquez sur "Calculer et Valider" pour voir le résumé

### 3. Validation et Sauvegarde
- Vérifiez le récapitulatif détaillé
- Cliquez sur "Sauvegarder" pour enregistrer

### 4. Consultation de l'Historique
- Onglet "Historique" pour voir toutes les dépenses
- Cliquez sur un mois pour développer les détails
- Modifiez ou supprimez des dépenses individuelles

### 5. Export PDF
- Exportez un mois spécifique ou l'ensemble
- Format professionnel avec tous les détails

## 📁 Structure du Projet

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── api/               # Routes API
│   │   ├── auth/          # Authentification
│   │   └── expenses/      # Gestion des dépenses
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Page d'accueil
├── components/            # Composants React
│   ├── ExpenseInput.tsx   # Saisie des dépenses
│   ├── ExpenseSummary.tsx # Récapitulatif
│   ├── ExpenseList.tsx    # Liste/historique
│   ├── LoginForm.tsx      # Formulaire de connexion
│   └── Loading.tsx        # Composant de chargement
├── contexts/              # Contextes React
│   └── AuthContext.tsx    # Gestion de l'authentification
├── lib/                   # Utilitaires
│   ├── auth.ts           # Fonctions d'authentification
│   ├── expenses.ts       # Gestion des dépenses
│   └── pdf.ts            # Export PDF
└── types/                 # Types TypeScript
    └── index.ts           # Définitions des interfaces
```

## 🔧 Scripts Disponibles

```bash
# Développement
npm run dev

# Build de production
npm run build

# Démarrer en production
npm start

# Linting
npm run lint
```

---

**Développé avec ❤️ pour simplifier la gestion des dépenses familiales**
