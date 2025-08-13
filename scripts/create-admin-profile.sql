-- Créer le profil admin pour l'utilisateur connecté
-- Exécuter ce SQL dans la console Supabase : SQL Editor

INSERT INTO profiles (id, email, is_admin, created_at, updated_at)
VALUES (
  'c948c834-e738-4f6c-bd0a-70f00322160e',  -- User ID de vos logs
  'ayoubadoumbia041@gmail.com',             -- Email de vos logs
  true,                                     -- Admin
  NOW(),                                    -- Date création
  NOW()                                     -- Date mise à jour
);

-- Vérifier que le profil a été créé
SELECT * FROM profiles WHERE id = 'c948c834-e738-4f6c-bd0a-70f00322160e';
