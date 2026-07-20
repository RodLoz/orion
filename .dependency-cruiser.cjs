/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "core-must-not-depend-outward",
      comment:
        "Core must remain independent from services, clients, shared implementation packages, and infrastructure.",
      severity: "error",
      from: { path: "^core/src" },
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
