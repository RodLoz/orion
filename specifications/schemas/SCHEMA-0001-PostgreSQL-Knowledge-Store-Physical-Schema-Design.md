# PostgreSQL Knowledge Store Physical Schema Design

| Field          | Value                                                          |
| -------------- | -------------------------------------------------------------- |
| **Status**     | Draft                                                          |
| **Version**    | 0.3.0                                                          |
| **Owner**      | Project Maintainers                                            |
| **Created**    | 2026-08-22                                                     |
| **Updated**    | 2026-08-22                                                     |
| **Applies To** | First PostgreSQL physical schema for `KnowledgeLifecycleStore` |

---

## Purpose

This document proposes the first concrete PostgreSQL physical schema for the
durable Knowledge Store. It is a non-authoritative review artifact. It does not
create a migration, implement an adapter, change a Core Contract, or change
Knowledge Engine behavior.

The design implements the governed physical model:

```text
immutable accepted Knowledge record
+ separate Knowledge-owned lifecycle metadata
```

## Governing authority and scope

This design is governed by:

- [ADR-0023 — Durable Knowledge Lifecycle Persistence and Store Boundary](../../docs/adr/ADR-0023-Durable-Knowledge-Lifecycle-Persistence-and-Store-Boundary.md);
- [ADR-0024 — Durable Knowledge Physical Store Architecture](../../docs/adr/ADR-0024-Durable-Knowledge-Physical-Store-Architecture.md);
- [ADR-0025 — Knowledge Store Database Product Selection](../../docs/adr/ADR-0025-Knowledge-Store-Database-Product-Selection.md);
- [Knowledge Engine 2.0.0](../engines/knowledge/ENGINE-0005-Knowledge-Engine-Revision-2.0.0.md);
- [Knowledge Concept Model](../concepts/CONCEPT-0002-Knowledge-Model.md);
- the approved executable `KnowledgeLifecycleStore` Core surface; and
- OES-0007, OES-0008, and OES-0010.

The schema preserves Knowledge semantics but does not own acceptance, truth,
version adjacency, graph meaning, projection authority, source authority, or
Context incorporation.

## Design decisions

### PostgreSQL namespace

`knowledge` is the proposed dedicated PostgreSQL schema. It isolates the
Knowledge Store's tables, migration privileges, and future physical evolution
without creating a generic cross-Engine persistence namespace. `public` remains
unnecessary for this bounded Store.

### Relation model

The minimum Knowledge semantic model has two relations:

1. `knowledge.knowledge_record` contains the complete immutable accepted
   `KnowledgeRecord` representation. Optional structured proposition fields are
   nullable columns with closed combination checks. The immutable
   `supersedes_knowledge_identity` correspondence is stored here once.
2. `knowledge.knowledge_lifecycle` contains the one-to-one, mutable lifecycle
   standing and two distinct ordering values. Snapshot predecessor identity and
   version are derived by joining the immutable record.

No event, audit, materialized snapshot, lineage-root, projection, Context,
Reasoning, Planning, or Brain relation is introduced.
`knowledge.schema_migration` is a separate physical migration-governance table
and is not a third Knowledge semantic relation.

### Identity and version

`KnowledgeIdentity` maps to `bytea`. Core permits a trimmed, non-empty opaque
JavaScript string up to 128 iterated code points; it does not exclude U+0000 or
lone UTF-16 surrogates and does not define UUID syntax. PostgreSQL character
types cannot represent that complete domain because they reject U+0000 and the
database encoding need not round-trip lone surrogates. The adapter therefore
encodes the exact JavaScript UTF-16 code-unit sequence using the binary encoding
defined below. PostgreSQL must not allocate this Engine-owned identity. A `bytea`
primary key provides bytewise exact uniqueness and PK/FK lookup.

`KnowledgeVersion` maps to `bigint` with `CHECK (version BETWEEN 1 AND
9007199254740991)`. This exactly covers the positive JavaScript safe-integer
domain. PostgreSQL does not allocate or infer versions.

### Immutable record mapping

| Core field                               | PostgreSQL column(s)                | Type                         | Reason                                                                                                |
| ---------------------------------------- | ----------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------- |
| `knowledgeIdentity`                      | `knowledge_identity`                | `bytea`                      | Exact encoded Engine identity; PK.                                                                    |
| `claim`                                  | `claim`                             | `bytea`                      | Exact encoded bounded claim; not decomposed.                                                          |
| `provenance.sourceType`                  | `provenance_source_type`            | `text COLLATE "C"` + `CHECK` | Closed ASCII Core set.                                                                                |
| `provenance.originatingCapability`       | `provenance_originating_capability` | `bytea`                      | Exact encoded opaque, bounded correspondence.                                                         |
| `provenance.observedAt`                  | `provenance_observed_at`            | `text COLLATE "C"`           | Exact restricted ASCII timestamp.                                                                     |
| `provenance.sourceReference`             | `provenance_source_reference`       | `bytea NULL`                 | Optional exact encoded opaque, bounded reference.                                                     |
| `acceptanceEvidence.method`              | `acceptance_method`                 | `text COLLATE "C"` + `CHECK` | Closed ASCII value `explicit-authority-review`.                                                       |
| `acceptanceEvidence.authorityIdentifier` | `acceptance_authority_identifier`   | `bytea`                      | Exact encoded private accepted evidence.                                                              |
| `acceptanceEvidence.decision`            | not stored                          | —                            | A durable record can only contain `accept`; the relation and method constraint encode this invariant. |
| `acceptanceEvidence.reason`              | `acceptance_reason`                 | `bytea`                      | Exact encoded private accepted evidence.                                                              |
| `validationState`                        | not stored                          | —                            | Every row is an accepted record; reconstruct as the constant `accepted`.                              |
| `acceptedAt`                             | `accepted_at`                       | `text COLLATE "C"`           | Exact restricted ASCII timestamp; never used for ordering.                                            |
| `version`                                | `version`                           | `bigint`                     | Exact positive safe-integer domain.                                                                   |
| `supersedesKnowledgeIdentity`            | `supersedes_knowledge_identity`     | `bytea NULL`                 | Exact encoded immutable predecessor correspondence and self-FK.                                       |

Timestamp text is intentional. `KnowledgeTimestamp` is an exact validated UTC
string and accepts both `...Z` and `...000Z`. `timestamptz` would preserve the
instant but not necessarily the accepted lexical representation. The adapter
revalidates through Core constructors when reconstructing a record.

### Core string-domain inventory and binary encoding

Persisted string fields are classified as follows:

| Category                                                          | Fields                                                                                                                                                                                                                         | Physical representation                             |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| A — governed textual domain excluding U+0000                      | none beyond the more specific closed/timestamp categories below                                                                                                                                                                | —                                                   |
| B — Core string domain permitting U+0000 and code-unit edge cases | Knowledge identity, claim, originating capability, optional source reference, authority identifier, acceptance reason, proposition identity, subject key, predicate key, textual scalar, applicable owner, source relationship | `bytea`                                             |
| C — closed ASCII enum/constant                                    | provenance source type, acceptance method, proposition currentness owner, lifecycle standing                                                                                                                                   | `text COLLATE "C"` + closed `CHECK`                 |
| D — exact-format ASCII UTC timestamp                              | observed-at, accepted-at                                                                                                                                                                                                       | `text COLLATE "C"` + lexical-shape `CHECK`          |
| E — Store-generated restricted ASCII token                        | Knowledge acceptance order                                                                                                                                                                                                     | `text COLLATE "C"` + uniqueness/prefix-shape checks |

For every category-B field, the adapter uses `ORION_JS_UTF16BE_V1`: iterate the
JavaScript string by UTF-16 code-unit index (`charCodeAt`, not code points) and
emit exactly two bytes per code unit, most-significant byte first. Decoding reads
each two-byte unsigned value and reconstructs the same ordered UTF-16 code units.
The encoding has no byte-order marker, terminator, normalization, replacement,
case conversion, or Unicode scalar-value validation. Therefore U+0000 is `00
00`, an empty string is zero bytes, a surrogate pair is four bytes, and a lone
surrogate is preserved as its two-byte code unit. The fixed endianness and
versioned algorithm are platform- and restart-stable.

Every stored category-B value is non-empty under the current Core domains, so
its column check requires positive, even `octet_length`. Semantic trim and
code-point bounds remain enforced by Core before persistence and again after
decode. PostgreSQL byte length is not used as a substitute for Core's iterated
code-point length because surrogate pairs make those units different. Optional
fields use SQL `NULL` for absence; zero bytes remain distinct from encoded U+0000.

`bytea` equality is exact byte equality and is independent of database
collation. PostgreSQL B-tree primary keys, unique indexes, and foreign keys
support `bytea`, so the encoded identity requires no hash index or semantic
normalization. The current Core bounds keep encoded index keys small enough for
the identity PK/FKs. Every remaining `text` column explicitly uses the built-in,
deterministic `C` collation. No column inherits database-default or
nondeterministic ICU equality; no comparison performs case, accent, punctuation,
or Unicode-normalization folding.

### Structured proposition mapping

The optional `AcceptedStructuredKnowledgeProposition` is stored in relational
columns on `knowledge_record`:

| Core field                                                    | Column                            | Type                                   |
| ------------------------------------------------------------- | --------------------------------- | -------------------------------------- |
| `propositionIdentity`                                         | `proposition_identity`            | `bytea NULL`                           |
| `semanticValue.subjectKey`                                    | `proposition_subject_key`         | `bytea NULL`                           |
| `semanticValue.predicateKey`                                  | `proposition_predicate_key`       | `bytea NULL`                           |
| `semanticValue.textualScalar`                                 | `proposition_textual_scalar`      | `bytea NULL`                           |
| `sourceOwnershipCorrespondence.currentnessOwner`              | `proposition_currentness_owner`   | `text COLLATE "C" NULL` + closed check |
| `sourceOwnershipCorrespondence.applicableOwner`               | `proposition_applicable_owner`    | `bytea NULL`                           |
| `sourceOwnershipCorrespondence.propositionSourceRelationship` | `proposition_source_relationship` | `bytea NULL`                           |

All base proposition columns must be either present together or absent together.
For `knowledge-owned-currentness`, the two external correspondence columns must
be null. For `external-source-currentness`, both must be non-null. These fields
remain private accepted Knowledge state; SQL storage does not make them public or
Reasoning-visible. No uniqueness is imposed on `proposition_identity` because
the current Core type validates identity shape but does not establish global
database uniqueness independently of Knowledge records.

### Provenance and evidence

Active `KnowledgeRecord` includes provenance and accepted evidence, so both are
durable. They are explicit scalar columns because their shapes are small, closed,
and queried only as part of exact record reconstruction. They are protected
payload and must not be placed in routine SQL, error, or observability logs.
Rejected evidence, contradiction proposals/reasons, and projection authority are
not part of an accepted `KnowledgeRecord` and are not persisted.

### Standing

Standing uses `text COLLATE "C"` plus `CHECK (standing IN ('current',
'superseded'))`. This closes the state set while keeping schema evolution a
transactional table migration. A PostgreSQL enum would create a separately
managed schema object and make removal/renaming more operationally rigid without
adding integrity.

### Acceptance order and private canonical order

`acceptance_order` is `text COLLATE "C" NOT NULL UNIQUE`. The adapter generates
only the ASCII alphabet `[a-z0-9:-]` in the exact form
`knowledge-acceptance-v1:<positive-decimal>`, so U+0000 and encoding edge cases
cannot occur in this Store-owned value. The `C` collation makes equality
deterministic and bytewise, with no folding or normalization. The token has no
comparison, numeric, timestamp, or public semantics in Core.

The adapter allocates the token from a dedicated PostgreSQL sequence and encodes
that separate allocation as `knowledge-acceptance-v1:<decimal>`. Encoding a
private allocator is compatible with opacity because Core only validates a
nonblank string and never compares it. The prefix versions the physical encoding.
The token sequence is not the canonical-order sequence, and its value is never
used in `ORDER BY`.

`canonical_order` is `bigint GENERATED ALWAYS AS IDENTITY`, `NOT NULL`, and
`UNIQUE`. PostgreSQL allocates it while inserting the lifecycle row in the same
transaction as successful acceptance. Sequence gaps caused by rollback are
permitted: total order requires uniqueness and stable ordering, not contiguity.
The adapter never maps, returns, logs as semantic data, or exposes this column.

## Concrete schema catalog

### TABLE: `knowledge.knowledge_record`

**PURPOSE:** Preserve one complete immutable accepted `KnowledgeRecord`.

**COLUMNS:**

| Column                              | PostgreSQL type    | Null | Default |
| ----------------------------------- | ------------------ | ---- | ------- |
| `knowledge_identity`                | `bytea`            | no   | none    |
| `claim`                             | `bytea`            | no   | none    |
| `provenance_source_type`            | `text COLLATE "C"` | no   | none    |
| `provenance_originating_capability` | `bytea`            | no   | none    |
| `provenance_observed_at`            | `text COLLATE "C"` | no   | none    |
| `provenance_source_reference`       | `bytea`            | yes  | none    |
| `acceptance_method`                 | `text COLLATE "C"` | no   | none    |
| `acceptance_authority_identifier`   | `bytea`            | no   | none    |
| `acceptance_reason`                 | `bytea`            | no   | none    |
| `accepted_at`                       | `text COLLATE "C"` | no   | none    |
| `version`                           | `bigint`           | no   | none    |
| `supersedes_knowledge_identity`     | `bytea`            | yes  | none    |
| `proposition_identity`              | `bytea`            | yes  | none    |
| `proposition_subject_key`           | `bytea`            | yes  | none    |
| `proposition_predicate_key`         | `bytea`            | yes  | none    |
| `proposition_textual_scalar`        | `bytea`            | yes  | none    |
| `proposition_currentness_owner`     | `text COLLATE "C"` | yes  | none    |
| `proposition_applicable_owner`      | `bytea`            | yes  | none    |
| `proposition_source_relationship`   | `bytea`            | yes  | none    |

**ENCODING/COLLATION:** Every `bytea` column uses `ORION_JS_UTF16BE_V1`.
Every `text` column explicitly uses deterministic `COLLATE "C"`.

**PRIMARY KEY:** `CONSTRAINT knowledge_record_identity_pk PRIMARY KEY
(knowledge_identity)`.

**FOREIGN KEYS:** `CONSTRAINT knowledge_record_predecessor_fk FOREIGN KEY
(supersedes_knowledge_identity) REFERENCES knowledge.knowledge_record
(knowledge_identity) ON UPDATE RESTRICT ON DELETE RESTRICT`, initially immediate
and not deferrable.

**UNIQUE CONSTRAINTS:** A partial unique index on
`supersedes_knowledge_identity WHERE supersedes_knowledge_identity IS NOT NULL`,
named `knowledge_record_one_successor_uq`, prevents two durable successors from
naming the same predecessor. No other semantic uniqueness is invented.

**CHECK CONSTRAINTS:**

- each required binary string: positive even `octet_length` under
  `knowledge_record_binary_encoding_ck`;
- source type: `manual-assertion` or `approved-internal-source`;
- timestamp text: Core UTC shape (`YYYY-MM-DDTHH:MM:SS[.mmm]Z`); full calendar
  validity remains checked by Core reconstruction;
- acceptance method: exactly `explicit-authority-review`;
- version: 1 through 9,007,199,254,740,991;
- predecessor is null or bytewise differs from own identity under
  `knowledge_record_not_self_predecessor_ck`;
- structured proposition all-or-none and ownership-combination checks;
- optional binary values, when present, have positive even `octet_length`; and
- semantic trim and code-point bounds are validated by Core rather than an
  incorrect byte-length approximation.

**INDEXES:** The PK supports exact `get`, lifecycle join, and predecessor FK
target. `knowledge_record_one_successor_uq` is the unique partial predecessor
index; it supports branch prevention and predecessor-to-successor inspection.
No version, proposition, provenance, evidence, or timestamp index is justified
by governed Store operations.

**MUTABILITY:** No semantic update. Rows are insert-only through the runtime
role. No runtime delete.

**PRIVACY:** Claim, structured proposition, provenance, and acceptance evidence
are protected Store data. Only the adapter reconstructs the governed Core value.

### TABLE: `knowledge.knowledge_lifecycle`

**PURPOSE:** Preserve one-to-one lifecycle standing and distinct opaque/private
ordering correspondence for every accepted record.

**COLUMNS:**

| Column               | PostgreSQL type    | Null | Default                                 |
| -------------------- | ------------------ | ---- | --------------------------------------- |
| `knowledge_identity` | `bytea`            | no   | none                                    |
| `standing`           | `text COLLATE "C"` | no   | none                                    |
| `acceptance_order`   | `text COLLATE "C"` | no   | adapter supplies restricted ASCII token |
| `canonical_order`    | `bigint`           | no   | `GENERATED ALWAYS AS IDENTITY`          |

**ENCODING/COLLATION:** `knowledge_identity` uses `ORION_JS_UTF16BE_V1`.
Both `text` columns explicitly use deterministic `COLLATE "C"`.

**PRIMARY KEY:** `CONSTRAINT knowledge_lifecycle_identity_pk PRIMARY KEY
(knowledge_identity)`. The shared identity is the smallest one-to-one key; no
synthetic lifecycle identity is needed.

**FOREIGN KEYS:** `CONSTRAINT knowledge_lifecycle_record_fk FOREIGN KEY
(knowledge_identity) REFERENCES knowledge.knowledge_record (knowledge_identity)
ON UPDATE RESTRICT ON DELETE RESTRICT`.

**UNIQUE CONSTRAINTS:** `CONSTRAINT knowledge_lifecycle_acceptance_order_uq
UNIQUE (acceptance_order)` and `CONSTRAINT
knowledge_lifecycle_canonical_order_uq UNIQUE (canonical_order)` are independent.

**CHECK CONSTRAINTS:** `CONSTRAINT knowledge_lifecycle_standing_ck CHECK
(standing IN ('current', 'superseded'))` and `CONSTRAINT
knowledge_lifecycle_acceptance_order_format_ck` enforcing the exact restricted
ASCII prefix/positive-decimal token form.

**INDEXES:** The PK supports exact lifecycle lookup and the expected-current
transition. The acceptance-order unique index enforces token correspondence.
The canonical-order unique index provides the ordered snapshot scan. No separate
standing index is justified: snapshots read all rows and supersession targets a
PK. A future current-only workload must provide evidence before adding one.

**MUTABILITY:** Only `standing: current -> superseded` is permitted, and only in
the atomic supersession transaction. Identity, both orders, and all other fields
are immutable. No runtime delete.

**PRIVACY:** `acceptance_order` is Knowledge-internal. `canonical_order` is
adapter-private and excluded from all Core values.

### TABLE: `knowledge.schema_migration`

**PURPOSE:** Preserve the append-only, checksummed application history for the
Knowledge physical Store schema. This is migration-governance metadata, not
Knowledge semantic or lifecycle state.

**COLUMNS:**

| Column         | PostgreSQL type    | Null | Default             |
| -------------- | ------------------ | ---- | ------------------- |
| `migration_id` | `text COLLATE "C"` | no   | none                |
| `checksum`     | `bytea`            | no   | none                |
| `applied_at`   | `timestamptz`      | no   | `CURRENT_TIMESTAMP` |

**PRIMARY KEY:** `CONSTRAINT schema_migration_id_pk PRIMARY KEY
(migration_id)`.

**CHECK CONSTRAINTS:** `CONSTRAINT schema_migration_id_format_ck CHECK
(migration_id ~ '^[0-9]{4}$' AND migration_id <> '0000')` closes the first-slice
identifier format to `0001` through `9999`, and
`CONSTRAINT schema_migration_checksum_nonempty_ck CHECK
(octet_length(checksum) > 0)` rejects an absent checksum representation. The
runner compares checksum bytes exactly; no collation or textual encoding is
involved. `applied_at` is operational metadata and has no Knowledge ordering or
semantic constraint.

**MUTABILITY:** Rows are append-only. Only the migration owner/runner may insert
one governed row after successfully applying its corresponding migration body.
No row may be updated or deleted.

**OWNER:** The migration owner owns the table. The runtime application role has
no privileges on it and does not inspect it during normal startup.

**PRIVACY:** The ledger contains migration identifiers, artifact checksums, and
operational application times only. It contains no Knowledge payload,
provenance, evidence, credentials, or semantic ordering state.

## Keys, references, and structural constraints

The record PK is semantic Knowledge identity. The lifecycle PK is the same value
and establishes at most one lifecycle row per record. Transactional insertion of
both rows establishes exact one-to-one correspondence for runtime writes; the FK
alone cannot require every record to have a lifecycle row, so initialization
detects any orphan record. Using `canonical_order` as an identity or FK is
prohibited.

The predecessor FK points to the immutable record relation, not the mutable
lifecycle relation. Historical records cannot disappear through cascade. All
updates/deletes are restricted, and the runtime role receives no delete grant.

The unique predecessor relationship mechanically prevents a persisted branch
`A -> B` and `A -> C`. It does not assert version adjacency, complete graph
meaning, or which node is current.

## Immutability and update/delete policy

| Relation/column                  | Runtime insert              | Runtime update                           | Runtime delete |
| -------------------------------- | --------------------------- | ---------------------------------------- | -------------- |
| `knowledge_record`               | acceptance transaction only | prohibited                               | prohibited     |
| lifecycle identity/order columns | acceptance transaction only | prohibited                               | prohibited     |
| lifecycle `standing`             | initial `current`           | only conditional `current -> superseded` | prohibited     |

Immutability is enforced by the absence of runtime `UPDATE`/`DELETE` grants on
`knowledge_record`, the adapter's fixed statements, checks/FKs, and transaction
discipline. PostgreSQL column privileges grant the runtime role `UPDATE
(standing)` only on `knowledge_lifecycle`. Triggers are not proposed: permissions
and fixed statements give the required enforcement without installing procedural
semantic authority. Migration owners retain exceptional DDL/DML power and must
use reviewed maintenance procedures.

`KNOWLEDGE_PHYSICAL_DELETE_POLICY` is `PROHIBITED` for the first slice. There is
no adapter delete operation and no retention/purge behavior.

## One-current and branch prevention

A static partial unique index on `standing = 'current'` cannot express one
current terminal per lineage without a durable lineage-root key. This design
does not invent such a key. The unique predecessor index prevents branches, and
the adapter's conditional transition preserves one current terminal for all
valid writes. Knowledge Engine initialization remains responsible for detecting
cycles, invalid adjacency, inconsistent standing, nonterminal-current nodes, and
other semantic graph corruption.

The one-winner strategy is:

```text
UPDATE knowledge.knowledge_lifecycle AS lifecycle
SET standing = 'superseded'
FROM knowledge.knowledge_record AS record
WHERE lifecycle.knowledge_identity = :expected_identity
  AND record.knowledge_identity = lifecycle.knowledge_identity
  AND record.version = :expected_version
  AND lifecycle.standing = 'current';

require affected rows = 1
then insert successor record and lifecycle rows
then commit
```

PostgreSQL row-update locking serializes concurrent attempts against the same
predecessor. Under `READ COMMITTED`, the waiting statement rechecks its predicate
against the committed row version. Exactly one update affects one row; the loser
affects zero rows, classifies the predecessor, rolls back, and writes no successor.
The unique predecessor index is defense in depth.

## Transaction design

### Independent acceptance

```text
validate the Core request before BEGIN
BEGIN ISOLATION LEVEL READ COMMITTED
  reject as invalid-state if record.supersedesKnowledgeIdentity is present
  allocate opaque token from knowledge.knowledge_acceptance_order_seq
  INSERT immutable knowledge_record
  INSERT knowledge_lifecycle(
    knowledge_identity, standing = 'current', acceptance_order
  )
    -- canonical_order is allocated by its distinct identity sequence
COMMIT
return stored with exact opaque acceptance_order
```

Any known failure before successful commit rolls back both inserts. PK/token
uniqueness maps to `duplicate` or `invalid-state` as described below. Sequence
numbers may be consumed on rollback and do not represent accepted counts.

### Expected-current supersession

```text
validate Core request and successor/predecessor correspondence before BEGIN
BEGIN ISOLATION LEVEL READ COMMITTED
  conditionally UPDATE expected predecessor standing using identity,
    expected version, and standing = 'current'
  if affected rows = 0:
    SELECT predecessor record/lifecycle by identity for classification
    ROLLBACK
    return predecessor-not-found or stale-predecessor
  allocate a new opaque acceptance token
  INSERT immutable successor knowledge_record
  INSERT successor knowledge_lifecycle with standing = 'current'
    -- its private canonical order is independently identity-allocated
COMMIT
return superseded with predecessor/successor identities and opaque token
```

If either successor insert violates a constraint, the transaction rolls back the
predecessor update. A successor identity PK violation maps to `duplicate`. Other
constraint or reconstruction failures map to `invalid-state`. Version adjacency
is validated by the Engine, not SQL.

### Isolation and locking

The minimum strategy is PostgreSQL `READ COMMITTED` plus the targeted conditional
`UPDATE`. No preliminary `SELECT FOR UPDATE`, table lock, repeatable-read, or
serializable transaction is required. The conditional update itself obtains the
row lock. Independent identities do not block each other except for ordinary
index/sequence coordination.

## Read design

### Historical get

```text
SELECT all immutable record columns
FROM knowledge.knowledge_record
WHERE knowledge_identity = :identity
```

The adapter reconstructs with `createKnowledgeRecord`. There is no latest,
successor, or current fallback. Superseded history remains retrievable.

### Derived lifecycle snapshot

```text
SELECT
  record.knowledge_identity,
  record.version,
  record.supersedes_knowledge_identity AS predecessor_knowledge_identity,
  lifecycle.standing,
  lifecycle.acceptance_order
FROM knowledge.knowledge_lifecycle AS lifecycle
JOIN knowledge.knowledge_record AS record USING (knowledge_identity)
ORDER BY lifecycle.canonical_order ASC
```

The adapter constructs `KnowledgeLifecycleSnapshotEntry` values in returned
order. It never selects `canonical_order` into a Core object. Initialization also
checks for record rows lacking lifecycle rows because an inner join alone cannot
expose such corruption.

## Index design

| Index                               | Purpose and operation                                 | Unique       | Write cost rationale                                         |
| ----------------------------------- | ----------------------------------------------------- | ------------ | ------------------------------------------------------------ |
| record PK                           | exact `get`, identity uniqueness, FK target           | yes          | Required invariant and primary read.                         |
| `knowledge_record_one_successor_uq` | branch prevention and predecessor lookup              | yes, partial | One entry per non-root record; required concurrency defense. |
| lifecycle PK                        | one-to-one row and conditional predecessor transition | yes          | Required invariant and point mutation.                       |
| lifecycle acceptance order          | exact opaque-token uniqueness                         | yes          | Required by ADR-0024.                                        |
| lifecycle canonical order           | deterministic snapshot order                          | yes          | Required private total order; supplies ordered scan.         |

No speculative current-standing, version, timestamp, proposition, provenance, or
evidence index is proposed.

### Stable constraint and index names

Names marked adapter-inspected are private compatibility surfaces. Applied
migrations must not rename or reuse them without updating and compatibility-
testing the adapter's private error classification.

| Name                                             | Object               | Purpose                                                               | Adapter-inspected? |
| ------------------------------------------------ | -------------------- | --------------------------------------------------------------------- | ------------------ |
| `knowledge_record_identity_pk`                   | PK constraint        | Duplicate Knowledge identity and exact record lookup                  | yes                |
| `knowledge_record_predecessor_fk`                | FK constraint        | Predecessor record existence                                          | no                 |
| `knowledge_record_one_successor_uq`              | unique partial index | Direct-branch prevention                                              | yes                |
| `knowledge_record_not_self_predecessor_ck`       | check constraint     | Reject self-predecessor                                               | no                 |
| `knowledge_record_binary_encoding_ck`            | check constraint     | Required/optional binary values have valid non-empty even byte length | no                 |
| `knowledge_record_source_type_ck`                | check constraint     | Close provenance source type                                          | no                 |
| `knowledge_record_acceptance_method_ck`          | check constraint     | Close acceptance method                                               | no                 |
| `knowledge_record_timestamp_shape_ck`            | check constraint     | Close timestamp lexical shape                                         | no                 |
| `knowledge_record_version_range_ck`              | check constraint     | Preserve KnowledgeVersion range                                       | no                 |
| `knowledge_record_proposition_shape_ck`          | check constraint     | Close proposition all-or-none/owner combinations                      | no                 |
| `knowledge_lifecycle_identity_pk`                | PK constraint        | One lifecycle row per identity                                        | yes                |
| `knowledge_lifecycle_record_fk`                  | FK constraint        | Lifecycle-to-record correspondence                                    | no                 |
| `knowledge_lifecycle_standing_ck`                | check constraint     | Close standing values                                                 | no                 |
| `knowledge_lifecycle_acceptance_order_format_ck` | check constraint     | Restrict adapter-generated token alphabet/form                        | no                 |
| `knowledge_lifecycle_acceptance_order_uq`        | unique constraint    | Opaque order uniqueness                                               | yes                |
| `knowledge_lifecycle_canonical_order_uq`         | unique constraint    | Private total-order uniqueness                                        | yes                |
| `schema_migration_id_pk`                         | PK constraint        | Unique ordered migration identifier                                   | runner             |
| `schema_migration_id_format_ck`                  | check constraint     | Close migration identifiers to `0001` through `9999`                  | runner             |
| `schema_migration_checksum_nonempty_ck`          | check constraint     | Require a non-empty exact checksum representation                     | runner             |

## Structural versus semantic validation

| Invariant/corruption                          | PostgreSQL prevents/detects                     | Engine initialization detects    |
| --------------------------------------------- | ----------------------------------------------- | -------------------------------- |
| duplicate Knowledge identity                  | PK                                              | —                                |
| invalid standing value                        | `CHECK`                                         | malformed result defense         |
| duplicate opaque acceptance order             | unique constraint                               | snapshot duplicate defense       |
| duplicate private canonical order             | identity + unique constraint                    | ordered-result coherence defense |
| missing predecessor record                    | FK                                              | —                                |
| self-predecessor                              | `CHECK`                                         | graph defense                    |
| two direct successors                         | unique partial index                            | branch defense                   |
| lifecycle without record                      | FK                                              | —                                |
| record without lifecycle                      | transaction discipline; startup integrity query | yes                              |
| cycle longer than self-reference              | no static constraint                            | yes                              |
| invalid version adjacency                     | no cross-row check                              | yes                              |
| current nonterminal or superseded terminal    | no safe static constraint without lineage root  | yes                              |
| record/predecessor/version semantic coherence | scalar/relationship structure only              | yes                              |
| invalid timestamp calendar value              | Core validation on write/read                   | yes                              |

Database constraints are mechanical integrity. They do not make PostgreSQL the
owner of Knowledge semantics.

## Adapter operation and error mapping

| Core operation                    | PostgreSQL operation                                   | Core result                                                                                                |
| --------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `putIndependentAcceptedKnowledge` | two inserts in one transaction                         | `stored`, `duplicate`, `invalid-state`, or `unavailable`                                                   |
| `supersedeCurrentKnowledge`       | conditional update plus two inserts in one transaction | `superseded`, `predecessor-not-found`, `stale-predecessor`, `duplicate`, `invalid-state`, or `unavailable` |
| `get`                             | exact PK select and Core reconstruction                | `found`, `not-found`, or `unavailable`; malformed durable value is internal invalid state                  |
| `loadKnowledgeLifecycleSnapshot`  | integrity probes plus ordered join                     | `loaded`, `invalid-state`, or `unavailable`                                                                |

The adapter keeps PostgreSQL SQLSTATE and constraint names private:

| Physical/internal condition                                              | Adapter classification                               |
| ------------------------------------------------------------------------ | ---------------------------------------------------- |
| successor/independent record PK violation                                | `duplicate`                                          |
| conditional update zero rows and identity absent                         | `predecessor-not-found`                              |
| conditional update zero rows and identity present                        | `stale-predecessor`                                  |
| connection/pool/database unavailable before known commit                 | `unavailable`                                        |
| non-duplicate constraint violation, malformed row, incoherent row counts | `invalid-state`                                      |
| confirmed commit                                                         | operation success                                    |
| connection loss around commit with unknown outcome                       | ambiguous operational handling; never claim rollback |

Constraint-name-based classification remains inside the adapter so neither Core
nor Engine depends on PostgreSQL codes.

For category-B fields, the future adapter mapping is:

```text
validated Core JavaScript string
-> ORION_JS_UTF16BE_V1 bytes
-> pg binary parameter
-> PostgreSQL bytea column/index/FK
-> retrieved bytes
-> exact JavaScript UTF-16 code-unit reconstruction
-> Core constructor validation
```

Binary storage is physical representation only. It is not a semantic identity,
encryption mechanism, normalization step, or privacy boundary.

## Ambiguous completion

If communication fails while or after sending `COMMIT` and the driver cannot
prove the outcome, the adapter must not issue a success or known-rollback claim.
It reports the governed unavailable/ambiguous operational condition at the
existing boundary. The Engine must leave normal write progression and reconstruct
or read the authoritative Store before deciding whether any retry is valid. No
idempotency key is added. A sequence gap is not evidence of commit or rollback.

## Database roles and permissions

The conceptual role split is:

- **migration owner:** owns the `knowledge` schema, relations, sequences, and
  migrations; can perform reviewed DDL and grants; is not the runtime identity;
- **runtime application role:** has `USAGE` on `knowledge`, `SELECT` and `INSERT`
  on both tables, `UPDATE (standing)` on `knowledge_lifecycle`, and required
  sequence usage; it has no schema creation, DDL, truncate, delete, record update,
  role-management, or ownership privileges; and
- **operational read role, if deployment needs one:** receives explicit protected
  read access only and is not required by the first adapter.

No credentials, provider IAM, or deployment topology are defined here.

## Migration tooling and versioning

Use raw, ordered PostgreSQL SQL migrations with a small repository-owned Node.js
runner built on the selected direct `pg` driver. This avoids adopting an ORM or
general schema DSL, keeps PostgreSQL features reviewable as SQL, runs identically
in CI and local development, and minimizes dependencies. `node-pg-migrate` is
capable but adds a migration DSL/framework where the repository currently has no
migration framework convention and the first schema is small.

The versioning model is immutable, zero-padded, forward-only migration files plus
the `knowledge.schema_migration` ledger catalogued above. Migration identifiers
are exactly four ASCII decimal digits (`0001`, `0002`, and so on) in the first
slice and sort in application order under `COLLATE "C"`. The runner implementation
must select and freeze one checksum algorithm before migration `0001` is ever
applied. It computes checksum bytes over the immutable migration artifact before
execution, never from database state after execution. Applied files are never
edited. Production rollback uses a reviewed forward corrective migration or
restore procedure; transactional down migrations are optional for disposable
test databases and are not the production recovery strategy.

Each migration runs in one PostgreSQL transaction by default:

```text
BEGIN
  apply exactly one migration
  insert its migration-identifier, checksum, and successful-application-time row
COMMIT
```

Any DDL or ledger failure causes `ROLLBACK`; both schema and ledger remain at the
previous version. A migration must never mark itself applied before every one of
its transactional operations succeeds.

An operation PostgreSQL cannot execute in a transaction block is exceptional. A
migration using one must be explicitly marked non-transactional, independently
reviewed with a documented recovery procedure, and executed only through a
runner path that refuses silent transaction opt-out. Its ledger entry may be
written only after the runner verifies complete success; failure must leave the
migration unapplied in the ledger and invoke the documented recovery path.
Migration `0001` contains no such operation and remains fully transactional.

### Migration-ledger self-bootstrap

Migration `0001` self-bootstraps the ledger. There is no separate bootstrap DDL
and no migration object outside the numbered, checksummed lifecycle.

Before opening its transaction, the runner inspects the exact governed object
identities. If `knowledge.schema_migration` is absent and every governed
Knowledge Store object is absent, including the `knowledge` schema, both
relations, their sequences, constraints, and indexes, the database is pristine
for this migration system and `0001` may run. If the ledger is absent while any
of those objects exists, the runner fails closed as an invalid migration state
and requires operator recovery. It must not adopt, drop, repair, or continue over
unknown objects automatically.

For a pristine database, migration `0001` executes this conceptual sequence:

1. `BEGIN`;
2. create the `knowledge` schema under the migration owner;
3. create `knowledge.schema_migration` with its exact columns and named
   constraints;
4. create the dedicated opaque acceptance-order sequence;
5. create `knowledge_record`, including its encoded columns and named checks;
6. create the predecessor FK and named unique partial branch-prevention index;
7. create `knowledge_lifecycle`, including identity-backed canonical allocation;
8. create every remaining exact constraint and index;
9. grant the catalogued migration-owner/runtime permissions without credentials;
10. insert the `0001` ledger row using the checksum computed before execution;
11. `COMMIT`.

Every operation in migration `0001` is a PostgreSQL operation permitted in a
transaction block. The ledger creation, its `0001` row, namespace, relations,
allocators, constraints, indexes, and transactional grants therefore commit or
roll back together. Any failure leaves neither the ledger nor a partial
Knowledge schema visible and returns the database to the pristine migration
state. Migration `0001` must never use the non-transactional exception path.

If the connection or process fails around `COMMIT`, the runner does not retry
blindly. After reconnecting, it inspects authoritative database state:

- a structurally valid ledger containing `0001` with the expected checksum means
  the migration committed;
- an absent ledger together with absent governed Knowledge objects means the
  migration did not commit and may be attempted again; and
- any partial, incompatible, or contradictory visible state fails closed for
  operator recovery.

When the ledger exists, the runner verifies its exact schema, table, columns,
types, collations, nullability, defaults, and named constraints before trusting
it. It then reads entries in migration-ID order, validates the identifier format,
requires a contiguous history from `0001`, and compares every applied checksum
with the corresponding immutable artifact. An incompatible ledger object,
checksum mismatch, missing previous migration, duplicate/out-of-order entry, or
ledger/schema disagreement fails closed. The runner never mutates, recreates, or
destructively repairs the ledger opportunistically.

For migration `0002` and later, the runner verifies the ledger and all previous
checksums before executing one migration as `BEGIN` -> migration body -> append
its ledger row -> `COMMIT`. Ledger rows remain append-only. Only the migration
owner/runner may append them; the runtime role has no ledger privileges or
startup dependency. Deployment/migration tooling establishes schema
compatibility before application startup. The PostgreSQL adapter assumes the
required schema already exists and must not execute implicit DDL or migrations.

The first migration contains no seed Knowledge, adapter code, provider
configuration, projection data, or non-transactional operation. Its operational
documentation also records backup verification and safe reseeding requirements
for both allocators.

## Backup and recovery

A backup must preserve the schema, both relations, both sequence states,
constraints, and migration ledger consistently. After restore, a new
`KnowledgeEngine.initialize()` loads the derived ordered snapshot, performs
semantic validation, reconstructs confirmed/current/order indexes, and only then
becomes Ready. Restore does not recreate projection authority, Context,
Reasoning, Planning, Brain, preparation associations, or source authority.

Before runtime writes resume after restore, operations must verify that both
restored sequence states are beyond every corresponding durable allocation or
safely advance them beyond those allocations. The acceptance-token sequence is
checked against decoded positive-decimal token suffixes; the canonical-order
identity sequence is checked against durable `canonical_order` values. Neither
next value is inferred from transaction count, row count, or absence of gaps.
Sequence allocation is non-transactional, so a gap is neither corruption nor
evidence of a committed acceptance.

The backup and restore consistency set also includes
`knowledge.schema_migration`. Before migration continuation or runtime startup,
deployment tooling must fail closed if the restored ledger history, immutable
migration checksums, required schema objects, or allocator state disagree. No
automatic destructive repair is permitted.

The first-slice migration recovery matrix is:

| Observed state                                      | Required behavior                                       |
| --------------------------------------------------- | ------------------------------------------------------- |
| ledger absent; governed Knowledge objects absent    | pristine; migration `0001` may run                      |
| ledger present; valid contiguous history/checksums  | continue with the first unapplied migration             |
| ledger absent; any governed Knowledge object exists | fail closed; manual/operator recovery                   |
| ledger present; incompatible ledger shape           | fail closed; do not drop or recreate                    |
| ledger present; checksum mismatch                   | fail closed; do not edit the artifact or ledger         |
| ledger present; previous migration missing          | fail closed; do not infer or synthesize history         |
| ledger and schema/allocator state disagree          | fail closed before migration continuation/runtime write |

## Integration-test schema strategy

Physical adapter tests use an ephemeral PostgreSQL 16-or-newer instance. The test
harness applies the real ordered migrations once per isolated database or unique
test schema, uses a unique database/schema boundary per parallel worker, and
drops only that verified ephemeral boundary during cleanup. Tests do not disable
constraints to reset state.

The adapter-independent semantic Store conformance suite is reused. PostgreSQL
tests add duplicate/constraint mapping, atomic rollback, concurrent `A -> B` and
`A -> C`, deterministic snapshot ordering, record/lifecycle corruption probes,
unavailability, and ambiguous-completion simulation. Restart tests create new
connection/pool and Engine instances against the same migrated database. The CI
service/container product remains a later implementation choice.

Representation conformance tests additionally cover U+0000 round-trip; empty
bytes versus encoded U+0000; combining sequences; precomposed versus decomposed
forms; case-, accent-, and punctuation-distinct values; lone high/low surrogates;
the maximum bounded Core string; binary identity PK/FK matching; opaque-order
uniqueness; and deterministic `C`-collation behavior for remaining text fields.
Migration tests prove DDL failure rolls back the ledger and schema, ledger failure
rolls back DDL, checksum mismatch is rejected, and non-transactional execution
requires its explicit reviewed path. Database-level isolation is used for
encoding/collation and role tests; schema-level isolation remains sufficient for
ordinary Store semantics.

## Provider neutrality, extensions, and privacy

The design uses PostgreSQL core schemas, tables, sequences/identity, constraints,
indexes, transactions, and row locking available in PostgreSQL 16 and later. It
requires no extension and no managed-provider construct.

JSONB is not used. All current accepted record structures are small and map
without over-normalization to scalar `bytea` or deterministic `text` columns. A
future genuinely opaque or evolving private structure may justify JSONB only
after its semantic and migration consequences are reviewed; the complete record
must not be collapsed into JSONB for convenience.

Logs must exclude credentials, connection details, claims, structured scalar
values, provenance, evidence, opaque acceptance order, and private canonical
order. Projection authority captures, Context/Reasoning state, authorization
tokens, and provider credentials are excluded from the schema.

`bytea` is not encryption and creates no confidentiality. The same access,
least-privilege, backup protection, and sensitive-log controls apply to binary
and text columns.

## Naming conventions

PostgreSQL identifiers use unquoted lowercase `snake_case`. The dedicated schema
is singular (`knowledge`); tables are singular domain nouns
(`knowledge_record`, `knowledge_lifecycle`); columns spell full semantic names;
constraints and indexes use `<table>_<purpose>_<kind>`. Migration filenames use
zero-padded numeric order and a lowercase descriptive suffix.

## Decision summary

```text
CONCRETE_DATABASE_PRODUCT:
POSTGRESQL

DATABASE_VERSION_POLICY:
MINIMUM_POSTGRESQL_16

POSTGRESQL_NAMESPACE:
knowledge

PHYSICAL_MODEL_FAMILY:
IMMUTABLE_RECORD_PLUS_LIFECYCLE_METADATA

KNOWLEDGE_IDENTITY_POSTGRES_TYPE:
bytea

UNRESTRICTED_CORE_STRING_POSTGRES_REPRESENTATION:
bytea

CORE_STRING_BINARY_ENCODING:
ORION_JS_UTF16BE_V1

POSTGRESQL_TEXT_EQUALITY_POLICY:
EXPLICIT_COLLATE_C_FOR_EVERY_TEXT_COLUMN

KNOWLEDGE_VERSION_POSTGRES_TYPE:
bigint

LIFECYCLE_STANDING_POSTGRES_REPRESENTATION:
TEXT_WITH_CLOSED_CHECK

KNOWLEDGE_ACCEPTANCE_ORDER_POSTGRES_TYPE:
text COLLATE "C"

PRIVATE_CANONICAL_ORDER_POSTGRES_TYPE:
bigint

PRIVATE_CANONICAL_ORDER_ALLOCATION:
GENERATED_ALWAYS_AS_IDENTITY_ON_LIFECYCLE_INSERT

POSTGRESQL_ONE_WINNER_STRATEGY:
READ_COMMITTED_CONDITIONAL_PREDECESSOR_UPDATE_PLUS_UNIQUE_PREDECESSOR_RELATIONSHIP

POSTGRESQL_TRANSACTION_ISOLATION_STRATEGY:
READ_COMMITTED

POSTGRESQL_LOCKING_STRATEGY:
TARGETED_ROW_LOCK_ACQUIRED_BY_CONDITIONAL_UPDATE

KNOWLEDGE_PHYSICAL_DELETE_POLICY:
PROHIBITED

MIGRATION_TOOLING_DECISION:
RAW_ORDERED_POSTGRESQL_SQL_WITH_LIGHTWEIGHT_NODE_PG_RUNNER

SCHEMA_VERSIONING_MODEL:
IMMUTABLE_FORWARD_ONLY_NUMBERED_MIGRATIONS_WITH_CHECKSUMMED_DATABASE_LEDGER

MIGRATION_DEFAULT_TRANSACTION_MODE:
ONE_TRANSACTION_PER_MIGRATION

MIGRATION_LEDGER_ATOMIC_WITH_DDL:
YES

MIGRATION_LEDGER_BOOTSTRAP_MODEL:
MIGRATION_0001_SELF_BOOTSTRAPS_LEDGER

MIGRATION_LEDGER_OBJECT:
knowledge.schema_migration

MIGRATION_IDENTIFIER_FORMAT:
FOUR_ASCII_DECIMAL_DIGITS_STARTING_AT_0001

MIGRATION_0001_TRANSACTIONAL:
YES

MIGRATION_0001_LEDGER_ATOMIC:
YES

INCOMPATIBLE_LEDGER_BEHAVIOR:
FAIL_CLOSED

MIGRATION_LEDGER_MUTABILITY:
APPEND_ONLY

RUNTIME_MIGRATION_LEDGER_DEPENDENCY:
NONE

ADAPTER_AUTO_MIGRATION:
PROHIBITED

JSONB_USAGE_POLICY:
NOT_USED_IN_INITIAL_SCHEMA

POSTGRESQL_EXTENSIONS_REQUIRED:
NONE

SCHEMA_ARTIFACT_MODE:
DESIGN_DOCUMENT_ONLY

NEW_ADR_REQUIRED:
NO

CORE_CHANGE_REQUIRED:
NO

KNOWLEDGE_LIFECYCLE_STORE_CONTRACT:
SUFFICIENT

PHYSICAL_SCHEMA_REVIEW_READY:
YES

POSTGRESQL_ADAPTER_IMPLEMENTATION_READY:
NO

INITIAL_MIGRATION_IMPLEMENTATION_READY:
NO
```

## Review gate

Routine PostgreSQL physical choices in this proposal remain within ADR-0024 and
ADR-0025. No new durable semantic state, Engine responsibility, Core Contract,
generic Store abstraction, trigger authority, provider, or deployment decision
has surfaced. The required next action is an independent PostgreSQL physical
schema review before any migration or adapter implementation.

## Related documents

- [OES-0007 — Adapter Design](../../docs/engineering/OES-0007-Adapter-Design.md)
- [OES-0008 — Documentation Standards](../../docs/engineering/OES-0008-Documentation-Standards.md)
- [OES-0010 — Versioning Standards](../../docs/engineering/OES-0010-Versioning-Standards.md)

## Change history

| Version | Date       | Description                                                                                                           |
| ------- | ---------- | --------------------------------------------------------------------------------------------------------------------- |
| 0.1.0   | 2026-08-22 | Drafted the PostgreSQL Knowledge Store physical schema for independent review.                                        |
| 0.2.0   | 2026-08-22 | Corrected full Core string preservation, deterministic equality, migration transactions, and stable constraint names. |
| 0.3.0   | 2026-08-22 | Closed migration-ledger identity, atomic self-bootstrap, verification, recovery, and ownership semantics.             |

---

> Physical persistence preserves Knowledge; it does not become Knowledge.
