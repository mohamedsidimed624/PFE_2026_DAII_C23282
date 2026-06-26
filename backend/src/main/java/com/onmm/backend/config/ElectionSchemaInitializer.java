package com.onmm.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class ElectionSchemaInitializer {

    // PostgreSQL ne considère jamais deux valeurs NULL comme égales dans une contrainte
    // UNIQUE : la contrainte uk_vote_election_position_voter (election_id, position_id,
    // voter_key_hash) ne protège donc pas contre le double vote quand position_id IS NULL
    // (élections sans postes). Cet index partiel comble ce trou côté base de données.
    @Bean
    public CommandLineRunner createVoteIntegrityIndexes(JdbcTemplate jdbcTemplate) {
        return args -> jdbcTemplate.execute(
                "CREATE UNIQUE INDEX IF NOT EXISTS uk_vote_election_voter_no_position " +
                "ON votes_election (election_id, voter_key_hash) WHERE position_id IS NULL"
        );
    }
}
