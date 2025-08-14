import { config } from 'dotenv';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Charger les variables d'environnement depuis le fichier .env à la racine
dotenv.config({ path: resolve(__dirname, '../.env') });

import { registerUser } from '../src/lib/auth';

// Charger les variables d'environnement
config();

async function initializeDatabase() {
  console.log('🚀 Initialisation de la base de données...');

  try {
    // Créer l'utilisateur admin par défaut
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
  }
}

// Lancer l'initialisation
initializeDatabase().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Erreur fatale:', error);
  process.exit(1);
});
