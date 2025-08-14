#!/usr/bin/env node

// Charger dotenv en tout premier
import dotenv from 'dotenv';
import { resolve } from 'path';

// Charger les variables d'environnement depuis le fichier .env à la racine
dotenv.config({ path: resolve(process.cwd(), '.env') });

console.log('🔧 Chargement des variables d\'environnement...');
console.log('DATABASE_URL présent:', !!process.env.DATABASE_URL);
console.log('JWT_SECRET présent:', !!process.env.JWT_SECRET);

// Maintenant importer les modules qui dépendent des variables d'environnement
async function main() {
  const { registerUser } = await import('../src/lib/auth.js');

  console.log('🚀 Initialisation de la base de données...');

  try {
    // Créer l'utilisateur admin par défaut
    console.log('📝 Création de l\'utilisateur admin...');
    const adminResult = await registerUser(
      'admin@depenses.com',
      'admin',
      'Administrateur',
      'admin123!',
      true // isAdmin
    );

    if (adminResult.success) {
      console.log('✅ Utilisateur admin créé avec succès :');
      console.log('   Email: admin@depenses.com');
      console.log('   Mot de passe: admin123!');
      console.log('   ID:', adminResult.user?.id);
    } else {
      console.log('❌ Erreur lors de la création de l\'admin:', adminResult.message);
    }

    // Créer un utilisateur normal de test
    console.log('📝 Création de l\'utilisateur test...');
    const userResult = await registerUser(
      'user@depenses.com',
      'user',
      'Utilisateur Test',
      'user123!',
      false // isAdmin
    );

    if (userResult.success) {
      console.log('✅ Utilisateur test créé avec succès :');
      console.log('   Email: user@depenses.com');
      console.log('   Mot de passe: user123!');
      console.log('   ID:', userResult.user?.id);
    } else {
      console.log('❌ Erreur lors de la création de l\'utilisateur test:', userResult.message);
    }

    console.log('🎉 Initialisation terminée !');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
}

// Lancer l'initialisation
main().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Erreur fatale:', error);
  process.exit(1);
});
