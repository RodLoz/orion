CREATE SCHEMA knowledge;

CREATE TABLE knowledge.schema_migration (
  migration_id text COLLATE "C" NOT NULL,
  checksum bytea NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT schema_migration_id_pk PRIMARY KEY (migration_id),
  CONSTRAINT schema_migration_id_format_ck CHECK (
    octet_length(migration_id) = 4
    AND migration_id ~ '^[0-9]{4}$'
    AND migration_id <> '0000'
  ),
  CONSTRAINT schema_migration_checksum_nonempty_ck CHECK (
    octet_length(checksum) > 0
  )
);

CREATE SEQUENCE knowledge.knowledge_acceptance_order_seq
  AS bigint
  START WITH 1
  INCREMENT BY 1
  NO CYCLE;

CREATE TABLE knowledge.knowledge_record (
  knowledge_identity bytea NOT NULL,
  claim bytea NOT NULL,
  provenance_source_type text COLLATE "C" NOT NULL,
  provenance_originating_capability bytea NOT NULL,
  provenance_observed_at text COLLATE "C" NOT NULL,
  provenance_source_reference bytea,
  acceptance_method text COLLATE "C" NOT NULL,
  acceptance_authority_identifier bytea NOT NULL,
  acceptance_reason bytea NOT NULL,
  accepted_at text COLLATE "C" NOT NULL,
  version bigint NOT NULL,
  supersedes_knowledge_identity bytea,
  proposition_identity bytea,
  proposition_subject_key bytea,
  proposition_predicate_key bytea,
  proposition_textual_scalar bytea,
  proposition_currentness_owner text COLLATE "C",
  proposition_applicable_owner bytea,
  proposition_source_relationship bytea,
  CONSTRAINT knowledge_record_identity_pk PRIMARY KEY (knowledge_identity),
  CONSTRAINT knowledge_record_binary_encoding_ck CHECK (
    octet_length(knowledge_identity) > 0
    AND octet_length(knowledge_identity) % 2 = 0
    AND octet_length(claim) > 0
    AND octet_length(claim) % 2 = 0
    AND octet_length(provenance_originating_capability) > 0
    AND octet_length(provenance_originating_capability) % 2 = 0
    AND octet_length(acceptance_authority_identifier) > 0
    AND octet_length(acceptance_authority_identifier) % 2 = 0
    AND octet_length(acceptance_reason) > 0
    AND octet_length(acceptance_reason) % 2 = 0
    AND (
      provenance_source_reference IS NULL
      OR (
        octet_length(provenance_source_reference) > 0
        AND octet_length(provenance_source_reference) % 2 = 0
      )
    )
    AND (
      supersedes_knowledge_identity IS NULL
      OR (
        octet_length(supersedes_knowledge_identity) > 0
        AND octet_length(supersedes_knowledge_identity) % 2 = 0
      )
    )
    AND (
      proposition_identity IS NULL
      OR (
        octet_length(proposition_identity) > 0
        AND octet_length(proposition_identity) % 2 = 0
      )
    )
    AND (
      proposition_subject_key IS NULL
      OR (
        octet_length(proposition_subject_key) > 0
        AND octet_length(proposition_subject_key) % 2 = 0
      )
    )
    AND (
      proposition_predicate_key IS NULL
      OR (
        octet_length(proposition_predicate_key) > 0
        AND octet_length(proposition_predicate_key) % 2 = 0
      )
    )
    AND (
      proposition_textual_scalar IS NULL
      OR (
        octet_length(proposition_textual_scalar) > 0
        AND octet_length(proposition_textual_scalar) % 2 = 0
      )
    )
    AND (
      proposition_applicable_owner IS NULL
      OR (
        octet_length(proposition_applicable_owner) > 0
        AND octet_length(proposition_applicable_owner) % 2 = 0
      )
    )
    AND (
      proposition_source_relationship IS NULL
      OR (
        octet_length(proposition_source_relationship) > 0
        AND octet_length(proposition_source_relationship) % 2 = 0
      )
    )
  ),
  CONSTRAINT knowledge_record_source_type_ck CHECK (
    provenance_source_type IN ('manual-assertion', 'approved-internal-source')
  ),
  CONSTRAINT knowledge_record_acceptance_method_ck CHECK (
    acceptance_method = 'explicit-authority-review'
  ),
  CONSTRAINT knowledge_record_timestamp_shape_ck CHECK (
    octet_length(provenance_observed_at) IN (20, 24)
    AND provenance_observed_at ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}([.][0-9]{3})?Z$'
    AND octet_length(accepted_at) IN (20, 24)
    AND accepted_at ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}([.][0-9]{3})?Z$'
  ),
  CONSTRAINT knowledge_record_version_range_ck CHECK (
    version BETWEEN 1 AND 9007199254740991
  ),
  CONSTRAINT knowledge_record_not_self_predecessor_ck CHECK (
    supersedes_knowledge_identity IS NULL
    OR supersedes_knowledge_identity <> knowledge_identity
  ),
  CONSTRAINT knowledge_record_proposition_shape_ck CHECK (
    (
      proposition_identity IS NULL
      AND proposition_subject_key IS NULL
      AND proposition_predicate_key IS NULL
      AND proposition_textual_scalar IS NULL
      AND proposition_currentness_owner IS NULL
      AND proposition_applicable_owner IS NULL
      AND proposition_source_relationship IS NULL
    )
    OR (
      proposition_identity IS NOT NULL
      AND proposition_subject_key IS NOT NULL
      AND proposition_predicate_key IS NOT NULL
      AND proposition_textual_scalar IS NOT NULL
      AND proposition_currentness_owner IS NOT NULL
      AND (
        (
          proposition_currentness_owner = 'knowledge-owned-currentness'
          AND proposition_applicable_owner IS NULL
          AND proposition_source_relationship IS NULL
        )
        OR (
          proposition_currentness_owner = 'external-source-currentness'
          AND proposition_applicable_owner IS NOT NULL
          AND proposition_source_relationship IS NOT NULL
        )
      )
    )
  )
);

ALTER TABLE knowledge.knowledge_record
  ADD CONSTRAINT knowledge_record_predecessor_fk
  FOREIGN KEY (supersedes_knowledge_identity)
  REFERENCES knowledge.knowledge_record (knowledge_identity)
  ON UPDATE RESTRICT
  ON DELETE RESTRICT;

CREATE UNIQUE INDEX knowledge_record_one_successor_uq
  ON knowledge.knowledge_record (supersedes_knowledge_identity)
  WHERE supersedes_knowledge_identity IS NOT NULL;

CREATE TABLE knowledge.knowledge_lifecycle (
  knowledge_identity bytea NOT NULL,
  standing text COLLATE "C" NOT NULL,
  acceptance_order text COLLATE "C" NOT NULL,
  canonical_order bigint GENERATED ALWAYS AS IDENTITY,
  CONSTRAINT knowledge_lifecycle_identity_pk PRIMARY KEY (knowledge_identity),
  CONSTRAINT knowledge_lifecycle_record_fk FOREIGN KEY (knowledge_identity)
    REFERENCES knowledge.knowledge_record (knowledge_identity)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT,
  CONSTRAINT knowledge_lifecycle_standing_ck CHECK (
    standing IN ('current', 'superseded')
  ),
  CONSTRAINT knowledge_lifecycle_acceptance_order_format_ck CHECK (
    acceptance_order ~ '^knowledge-acceptance-v1:[1-9][0-9]*$'
    AND acceptance_order !~ '[^a-z0-9:-]'
  ),
  CONSTRAINT knowledge_lifecycle_acceptance_order_uq UNIQUE (acceptance_order),
  CONSTRAINT knowledge_lifecycle_canonical_order_uq UNIQUE (canonical_order)
);
