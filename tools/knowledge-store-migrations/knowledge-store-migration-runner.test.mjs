import { createHash } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import {
  InvalidMigrationStateError,
  MIGRATION_CHECKSUM_ALGORITHM,
  loadKnowledgeStoreMigrations,
  runKnowledgeStoreMigrations,
} from "./knowledge-store-migration-runner.mjs";

const temporaryDirectories = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

describe("Knowledge Store migration artifacts", () => {
  it("loads migration 0001 and freezes SHA-256 over its exact bytes", async () => {
    const [migration] = await loadKnowledgeStoreMigrations();

    expect(MIGRATION_CHECKSUM_ALGORITHM).toBe("sha256");
    expect(migration.identifier).toBe("0001");
    expect(migration.name).toBe("0001_initial_knowledge_store.sql");
    expect(migration.transactionMode).toBe("transactional");
    expect(migration.checksum).toEqual(
      createHash("sha256").update(migration.artifact).digest(),
    );
    expect(migration.sql).toContain("CREATE SCHEMA knowledge");
    expect(migration.sql).not.toMatch(/\bBEGIN\b|\bCOMMIT\b/);
  });

  it("fails closed for a non-contiguous artifact inventory", async () => {
    const directory = await temporaryDirectory();
    await writeFile(join(directory, "0002_gap.sql"), "SELECT 1;\n");

    await expect(
      loadKnowledgeStoreMigrations(directory),
    ).rejects.toBeInstanceOf(InvalidMigrationStateError);
  });

  it("fails closed for migration 0000", async () => {
    const directory = await temporaryDirectory();
    await writeFile(
      join(directory, "0000_hidden_bootstrap.sql"),
      "SELECT 1;\n",
    );

    await expect(
      loadKnowledgeStoreMigrations(directory),
    ).rejects.toBeInstanceOf(InvalidMigrationStateError);
  });

  it("rejects an unsafe deployment role identifier before connecting", async () => {
    let connected = false;

    await expect(
      runKnowledgeStoreMigrations({
        pool: {
          connect() {
            connected = true;
          },
        },
        runtimeRole: 'runtime"; DROP SCHEMA knowledge; --',
      }),
    ).rejects.toBeInstanceOf(TypeError);
    expect(connected).toBe(false);
  });
});

async function temporaryDirectory() {
  const directory = await mkdtemp(join(tmpdir(), "orion-kstore-migration-"));
  temporaryDirectories.push(directory);
  return directory;
}
