import { describe, expect, it } from "vitest";
import { createPreparationAdmission } from "../src/runtime.js";

describe("initial runtime preparation admission", () => {
  it("starts Not Prepared and admits the first explicit attempt into Preparing", () => {
    const admission = createPreparationAdmission();

    expect(admission.state).toBe("not-prepared");

    admission.begin();

    expect(admission.state).toBe("preparing");
  });

  it("rejects a later attempt without changing the admitted state", () => {
    const admission = createPreparationAdmission();
    admission.begin();

    expect(() => admission.begin()).toThrow();
    expect(admission.state).toBe("preparing");
    expect(() => admission.begin()).toThrow();
    expect(admission.state).toBe("preparing");
  });

  it("keeps the single-attempt limit on each runtime instance", () => {
    const first = createPreparationAdmission();
    const second = createPreparationAdmission();

    first.begin();
    expect(() => first.begin()).toThrow();

    expect(second.state).toBe("not-prepared");
    second.begin();
    expect(second.state).toBe("preparing");
  });
});
