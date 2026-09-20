type PreparationAdmissionState = "not-prepared" | "preparing";

// Internal first-slice seam. The package has no public runtime entry point.
export function createPreparationAdmission() {
  let state: PreparationAdmissionState = "not-prepared";

  return {
    get state(): PreparationAdmissionState {
      return state;
    },

    begin(): void {
      if (state !== "not-prepared") {
        throw new Error("Preparation attempt already admitted");
      }

      // Preparing itself records that this instance's sole attempt was consumed.
      state = "preparing";
    },
  };
}
