-- =============================================================
-- Script de seed : 100 médecins de test
-- Insère 100 lignes dans users + medecins (+ 1 cursus chacun
-- dans medecin_education pour que la spécialité s'affiche).
--
-- Compte de test : medecin001@onmm-test.mr ... medecin100@onmm-test.mr
-- Mot de passe (identique pour les 100 comptes) : Password123!
-- =============================================================

BEGIN;

WITH params AS (
    SELECT
        n,
        'medecin' || lpad(n::text, 3, '0') || '@onmm-test.mr' AS email,
        (ARRAY[
            'Mohamed', 'Ahmed', 'Sidi', 'Abdellahi', 'Mohamedou', 'Yacoub', 'Brahim', 'Moussa', 'Cheikh', 'Mahmoud',
            'Aicha', 'Mariem', 'Fatimetou', 'Khadijetou', 'Zeinabou', 'Mariam', 'Aminata', 'Salka', 'Khady', 'Coumba'
        ])[1 + ((n - 1) % 20)] AS prenom,
        (ARRAY[
            'Ould Ahmed', 'Ould Mohamed', 'Ould Sidi', 'Ould Brahim', 'Mint Ahmed', 'Diallo', 'Ba', 'Sow', 'Kane', 'Diop',
            'Toure', 'Cisse', 'Sy', 'Fall', 'Ndiaye', 'Camara', 'Bah', 'Niang', 'Sarr'
        ])[1 + ((n - 1) % 19)] AS nom,
        CASE WHEN ((n - 1) % 20) < 10 THEN 'MALE' ELSE 'FEMALE' END AS sexe,
        (ARRAY['Nouakchott', 'Nouadhibou', 'Rosso', 'Kaédi', 'Aleg', 'Atar', 'Néma', 'Sélibaby', 'Kiffa', 'Akjoujt'])[1 + ((n - 1) % 10)] AS ville,
        (ARRAY['Nouakchott', 'Dakhlet Nouadhibou', 'Trarza', 'Gorgol', 'Brakna', 'Adrar', 'Hodh Ech Chargui', 'Guidimaka', 'Assaba', 'Inchiri'])[1 + ((n - 1) % 10)] AS wilaya,
        (ARRAY['GENERALISTE', 'SPECIALISTE', 'GENERALISTE', 'SPECIALISTE', 'ENSEIGNANT_CHERCHEUR'])[1 + ((n - 1) % 5)] AS section_ordre,
        '1960-01-01'::date + ((n * 137) % 12000) AS date_naissance
    FROM generate_series(1, 100) AS n
),
ins_users AS (
    INSERT INTO users (email, enabled, password, role)
    SELECT email, true, '$2a$12$Pquuq3MLaP0ilGJ2ORnzke7IOH9aKFGgIul/x.mt.dKHpHzR9Bmva', 'MEDECIN'
    FROM params
    RETURNING id, email
)
INSERT INTO medecins (
    user_id, nom, prenom, telephone, nni, numero_inscription, sexe, nationalite,
    adresse, date_naissance, ville_exercice, wilaya_exercice, structure_exercice,
    statut, section_ordre, date_approuvement
)
SELECT
    u.id,
    p.nom,
    p.prenom,
    '+222' || (20000000 + p.n),
    to_char(2000000000 + p.n, 'FM0000000000'),
    'OM-' || lpad(p.n::text, 5, '0'),
    p.sexe,
    'Mauritanienne',
    'Quartier ' || p.n || ', ' || p.ville,
    p.date_naissance,
    p.ville,
    p.wilaya,
    CASE WHEN p.section_ordre = 'GENERALISTE'
         THEN 'Cabinet médical privé'
         ELSE 'Hôpital régional de ' || p.ville
    END,
    'ACTIF',
    p.section_ordre,
    CURRENT_DATE - ((p.n % 365) + 30)
FROM params p
JOIN ins_users u ON u.email = p.email;

-- Cursus universitaire (utilisé pour afficher la spécialité dans les fiches candidat)
WITH spec AS (
    SELECT array_agg(id ORDER BY id) AS ids FROM specialites WHERE id <> 9
)
INSERT INTO medecin_education (medecin_id, diplome, universite, pays, ville, annee_obtention, specialite_id)
SELECT
    m.user_id,
    'Doctorat en Médecine',
    'Université de Nouakchott Al Aasriya - Faculté de Médecine',
    'Mauritanie',
    m.ville_exercice,
    EXTRACT(YEAR FROM m.date_naissance)::int + 25,
    spec.ids[1 + (m.user_id % array_length(spec.ids, 1))]
FROM medecins m
JOIN users u ON u.id = m.user_id
CROSS JOIN spec
WHERE u.email LIKE 'medecin%@onmm-test.mr';

COMMIT;

-- Vérification
SELECT count(*) AS medecins_inseres
FROM medecins m JOIN users u ON u.id = m.user_id
WHERE u.email LIKE 'medecin%@onmm-test.mr';
