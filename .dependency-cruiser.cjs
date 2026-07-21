/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "core-must-not-depend-outward",
      comment:
        "Core must remain independent from services, clients, shared implementation packages, and infrastructure.",
      severity: "error",
      from: { path: "^core/(src|architecture-fixtures)" },
      to: {
        path: "^(services|apps|packages|infrastructure|infraestructure)/",
      },
    },
    {
      name: "core-must-not-depend-on-external-packages",
      comment:
        "Core must remain technology-independent and framework-free, so M0 permits no external package imports.",
      severity: "error",
      from: { path: "^core/(src|architecture-fixtures)" },
      to: {
        dependencyTypes: [
          "npm",
          "npm-dev",
          "npm-no-pkg",
          "npm-optional",
          "npm-peer",
          "npm-bundled",
        ],
      },
    },
    {
      name: "identity-engine-must-not-depend-on-concrete-outer-layers",
      comment:
        "Identity Engine owns domain behavior and may depend only inward on Core abstractions.",
      severity: "error",
      from: { path: "^services/identity/(src|architecture-fixtures)" },
      to: {
        path: "^(services/bootstrap|apps|packages|infrastructure|infraestructure)/",
      },
    },
    {
      name: "identity-engine-must-not-depend-on-external-packages",
      comment:
        "Identity Engine is framework-free and M1 permits no external npm package imports.",
      severity: "error",
      from: { path: "^services/identity/(src|architecture-fixtures)" },
      to: {
        dependencyTypes: [
          "npm",
          "npm-dev",
          "npm-no-pkg",
          "npm-optional",
          "npm-peer",
          "npm-bundled",
        ],
        pathNot: "^@orion/core$",
      },
    },
    {
      name: "context-engine-must-not-depend-on-bootstrap-or-infrastructure",
      comment:
        "Context Engine owns domain behavior and cannot depend on Bootstrap or concrete outer layers.",
      severity: "error",
      from: { path: "^services/context/(src|architecture-fixtures)" },
      to: {
        path: "^(services/bootstrap|apps|packages|infrastructure|infraestructure)/",
      },
    },
    {
      name: "context-engine-must-not-depend-on-identity-implementation",
      comment:
        "Context consumes Identity through Core-custodied Contracts, never the Identity Engine implementation.",
      severity: "error",
      from: { path: "^services/context/(src|architecture-fixtures)" },
      to: { path: "^services/identity/" },
    },
    {
      name: "context-engine-must-not-depend-on-external-packages",
      comment:
        "Context Engine is framework-free and M2 permits no external npm package imports.",
      severity: "error",
      from: { path: "^services/context/(src|architecture-fixtures)" },
      to: {
        dependencyTypes: [
          "npm",
          "npm-dev",
          "npm-no-pkg",
          "npm-optional",
          "npm-peer",
          "npm-bundled",
        ],
        pathNot: "^@orion/core$",
      },
    },
    {
      name: "memory-engine-must-not-depend-on-bootstrap-or-infrastructure",
      comment:
        "Memory Engine owns Memory behavior and cannot depend on Bootstrap or concrete outer layers.",
      severity: "error",
      from: { path: "^services/memory/(src|architecture-fixtures)" },
      to: {
        path: "^(services/bootstrap|apps|packages|infrastructure|infraestructure)/",
        pathNot:
          "^services/bootstrap/src/memory/in-memory-memory-store(?:\\.ts)?$",
      },
    },
    {
      name: "memory-engine-must-not-depend-on-concrete-memory-store",
      comment:
        "Memory Engine depends on the Core-custodied Store Contract, never the bootstrap-selected concrete Store.",
      severity: "error",
      from: { path: "^services/memory/(src|architecture-fixtures)" },
      to: {
        path: "^services/bootstrap/src/memory/in-memory-memory-store",
      },
    },
    {
      name: "memory-engine-must-not-depend-on-external-packages",
      comment:
        "Memory Engine is framework-free and M3 permits no external npm package imports.",
      severity: "error",
      from: { path: "^services/memory/(src|architecture-fixtures)" },
      to: {
        dependencyTypes: [
          "npm",
          "npm-dev",
          "npm-no-pkg",
          "npm-optional",
          "npm-peer",
          "npm-bundled",
        ],
        pathNot: "^@orion/core$",
      },
    },
    {
      name: "knowledge-engine-must-not-depend-on-bootstrap-or-infrastructure",
      comment:
        "Knowledge Engine owns Knowledge behavior and cannot depend on Bootstrap or concrete outer layers.",
      severity: "error",
      from: { path: "^services/knowledge/(src|architecture-fixtures)" },
      to: {
        path: "^(services/bootstrap|apps|packages|infrastructure|infraestructure)/",
        pathNot:
          "^services/bootstrap/src/knowledge/in-memory-knowledge-store(?:\\.ts)?$",
      },
    },
    {
      name: "knowledge-engine-must-not-depend-on-concrete-knowledge-store",
      comment:
        "Knowledge Engine depends on the Core-custodied Store Contract, never the bootstrap-selected concrete Store.",
      severity: "error",
      from: { path: "^services/knowledge/(src|architecture-fixtures)" },
      to: {
        path: "^services/bootstrap/src/knowledge/in-memory-knowledge-store",
      },
    },
    {
      name: "knowledge-engine-must-not-depend-on-other-engines",
      comment:
        "Knowledge Engine does not integrate Memory, Context, Identity, or other Engine implementations in M4.",
      severity: "error",
      from: { path: "^services/knowledge/(src|architecture-fixtures)" },
      to: { path: "^services/(identity|context|memory)/" },
    },
    {
      name: "knowledge-engine-must-not-depend-on-external-packages",
      comment:
        "Knowledge Engine is framework-free and M4 permits no external npm package imports.",
      severity: "error",
      from: { path: "^services/knowledge/(src|architecture-fixtures)" },
      to: {
        dependencyTypes: [
          "npm",
          "npm-dev",
          "npm-no-pkg",
          "npm-optional",
          "npm-peer",
          "npm-bundled",
        ],
        pathNot: "^@orion/core$",
      },
    },
    {
      name: "reasoning-engine-must-not-depend-on-bootstrap-or-infrastructure",
      severity: "error",
      from: { path: "^services/reasoning/(src|architecture-fixtures)" },
      to: {
        path: "^(services/bootstrap|apps|packages|infrastructure|infraestructure)/",
      },
    },
    {
      name: "reasoning-engine-must-not-depend-on-other-engines",
      severity: "error",
      from: { path: "^services/reasoning/(src|architecture-fixtures)" },
      to: {
        path: "^services/(identity|context|memory|knowledge|brain|planning|skills?)/",
      },
    },
    {
      name: "reasoning-engine-must-not-depend-on-external-packages",
      severity: "error",
      from: { path: "^services/reasoning/(src|architecture-fixtures)" },
      to: {
        dependencyTypes: [
          "npm",
          "npm-dev",
          "npm-no-pkg",
          "npm-optional",
          "npm-peer",
          "npm-bundled",
        ],
        pathNot: "^@orion/core$",
      },
    },
    {
      name: "bootstrap-must-not-depend-on-outer-layers",
      comment:
        "The M0 composition root may assemble Core and bootstrap implementations but cannot depend on clients or infrastructure.",
      severity: "error",
      from: { path: "^services/bootstrap/src" },
      to: { path: "^(apps|infrastructure|infraestructure)/" },
    },
    {
      name: "no-circular-dependencies",
      severity: "error",
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    enhancedResolveOptions: {
      conditionNames: ["types", "import", "default"],
      exportsFields: ["exports"],
    },
    tsPreCompilationDeps: true,
  },
};
