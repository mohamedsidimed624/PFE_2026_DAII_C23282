-- =============================================================
-- Script de seed : élection du Bureau Exécutif en cours de vote
-- Crée 1 élection (type BUREAU_EXECUTIF, statut VOTE_EN_COURS),
-- son état d'intégrité (election_integrity_state, requis pour
-- pouvoir voter), 8 postes (un par fonction du bureau) et
-- 3 candidatures VALIDEE par poste (24 au total).
--
-- Prérequis : avoir exécuté seed-100-medecins.sql au préalable
-- (les 24 candidats sont pris parmi les médecins
-- medecin001..medecin024@onmm-test.mr).
-- =============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

BEGIN;

WITH new_election AS (
    INSERT INTO elections (
        titre, description, type, statut, niveau, region,
        seats_count, max_votes_par_electeur,
        candidature_start_date, candidature_end_date,
        vote_start_date, vote_end_date,
        date_creation, resultats_publies, corps_electoral,
        quorum_pourcentage, preset_code, cree_par_id
    ) VALUES (
        'Élection du Bureau Exécutif National 2026-2029',
        'Élection des membres du Bureau Exécutif National de l''Ordre National des Médecins de Mauritanie pour le mandat 2026-2029. Chaque médecin électeur vote pour un candidat par poste.',
        'BUREAU_EXECUTIF', 'VOTE_EN_COURS', 'NATIONAL', NULL,
        8, 8,
        now() - interval '40 days', now() - interval '20 days',
        now() - interval '3 days', now() + interval '4 days',
        now() - interval '45 days', false, 'TOUS_MEDECINS_ACTIFS',
        50, NULL, NULL
    )
    RETURNING id
),
integrity_state AS (
    INSERT INTO election_integrity_state (election_id, last_hash, vote_count, updated_at)
    SELECT id, encode(digest('genesis:' || id, 'sha256'), 'hex'), 0, now()
    FROM new_election
    RETURNING election_id
),
new_positions AS (
    INSERT INTO positions_electorales (election_id, libelle, ordre, nombre_sieges, max_votes_par_electeur, actif)
    SELECT e.id, p.libelle, p.ordre, 1, 1, true
    FROM new_election e
    CROSS JOIN (VALUES
        ('Président', 1),
        ('Vice-Président', 2),
        ('Secrétaire Général', 3),
        ('Secrétaire Général Adjoint', 4),
        ('Trésorier', 5),
        ('Trésorier Adjoint', 6),
        ('Assesseur 1', 7),
        ('Assesseur 2', 8)
    ) AS p(libelle, ordre)
    RETURNING id, election_id, libelle, ordre
),
candidate_pool AS (
    SELECT m.user_id, row_number() OVER (ORDER BY m.user_id) AS rn
    FROM medecins m
    JOIN users u ON u.id = m.user_id
    WHERE u.email LIKE 'medecin%@onmm-test.mr'
    ORDER BY m.user_id
    LIMIT 24
)
INSERT INTO candidatures_election (
    election_id, medecin_id, position_id, statut,
    declaration_candidature, programme_electoral, date_depot, date_validation
)
SELECT
    np.election_id,
    cp.user_id,
    np.id,
    'VALIDEE',
    'Candidat(e) au poste de ' || np.libelle || ' pour le mandat 2026-2029. Fort(e) de mon expérience au sein de l''Ordre, je m''engage à défendre les intérêts de la profession médicale et à œuvrer pour la modernisation de notre institution.',
    'Axes prioritaires : amélioration de la formation médicale continue, renforcement de la couverture sociale des médecins, modernisation des outils numériques de l''Ordre, et renforcement du dialogue avec les autorités sanitaires.',
    now() - interval '25 days',
    now() - interval '18 days'
FROM new_positions np
JOIN candidate_pool cp ON cp.rn BETWEEN (np.ordre - 1) * 3 + 1 AND np.ordre * 3;

COMMIT;

-- Vérification
SELECT pe.libelle AS poste, count(*) AS nb_candidatures
FROM candidatures_election ce
JOIN positions_electorales pe ON pe.id = ce.position_id
JOIN elections el ON el.id = ce.election_id
WHERE el.titre = 'Élection du Bureau Exécutif National 2026-2029'
GROUP BY pe.libelle, pe.ordre
ORDER BY pe.ordre;
