package com.onmm.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class ElectionSchemaInitializer {

    // PostgreSQL ne considere jamais deux valeurs NULL comme egales dans une contrainte
    // UNIQUE : la contrainte uk_vote_election_position_voter (election_id, position_id,
    // voter_token) ne protege donc pas contre le double vote quand position_id IS NULL
    // (elections sans postes). Cet index partiel comble ce trou cote base de donnees.
    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public CommandLineRunner createVoteIntegrityIndexes(JdbcTemplate jdbcTemplate) {
        return args -> {
            relaxLegacyVoteColumns(jdbcTemplate);
            jdbcTemplate.execute(
                    "CREATE UNIQUE INDEX IF NOT EXISTS uk_vote_election_voter_no_position " +
                    "ON votes_election (election_id, voter_token) WHERE position_id IS NULL"
            );
        };
    }

    private void relaxLegacyVoteColumns(JdbcTemplate jdbcTemplate) {
        jdbcTemplate.execute("""
                DO $$
                DECLARE
                    legacy_column record;
                BEGIN
                    IF to_regclass('public.votes_election') IS NULL THEN
                        RETURN;
                    END IF;

                    FOR legacy_column IN
                        SELECT column_name
                        FROM information_schema.columns
                        WHERE table_schema = 'public'
                          AND table_name = 'votes_election'
                          AND is_nullable = 'NO'
                          AND column_name NOT IN (
                              'id',
                              'election_id',
                              'position_id',
                              'encrypted_choice',
                              'voter_token',
                              'vote_hash',
                              'ballot_signature',
                              'date_vote'
                          )
                    LOOP
                        EXECUTE format(
                            'ALTER TABLE votes_election ALTER COLUMN %I DROP NOT NULL',
                            legacy_column.column_name
                        );
                    END LOOP;
                END $$;
                """);
    }
}