-- =============================================================
-- Script à exécuter UNE SEULE FOIS avec le compte postgres
-- Crée un compte applicatif restreint pour l'application ONMM
-- =============================================================

-- 1. Créer l'utilisateur applicatif avec un mot de passe sécurisé
--    IMPORTANT : Remplacer 'onmm_dev_local' par un mot de passe fort en production
CREATE USER onmm_app WITH PASSWORD 'onmm_dev_local';

-- 2. Autoriser la connexion à la base de données applicative
GRANT CONNECT ON DATABASE onmm_db TO onmm_app;

-- 3. Autoriser l'accès au schéma public
GRANT USAGE ON SCHEMA public TO onmm_app;

-- 4. Droits DDL nécessaires pour spring.jpa.hibernate.ddl-auto=update (développement)
--    En production avec ddl-auto=validate ou none, cette ligne peut être supprimée
GRANT CREATE ON SCHEMA public TO onmm_app;

-- 5. Droits DML sur toutes les tables existantes
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO onmm_app;

-- 6. Droits sur les séquences (nécessaire pour les ID auto-générés)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO onmm_app;

-- 7. Appliquer les mêmes droits aux nouvelles tables créées ultérieurement
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO onmm_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO onmm_app;

-- =============================================================
-- Vérification (optionnel) : lister les droits accordés
-- =============================================================
-- \du onmm_app
-- SELECT grantee, privilege_type, table_name
-- FROM information_schema.role_table_grants
-- WHERE grantee = 'onmm_app';
