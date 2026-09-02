export type CandidatePreparationAssociation = string & {
  readonly __candidatePreparationAssociation: unique symbol;
};

export function candidatePreparationAssociation(
  value: unknown,
): CandidatePreparationAssociation {
  if (typeof value !== "string" || value.length === 0) {
    throw new InvalidCandidatePreparationAssociationValueError();
  }
  return value as CandidatePreparationAssociation;
}

export class InvalidCandidatePreparationAssociationValueError extends Error {
  public constructor() {
    super("Candidate-Preparation Association value is invalid.");
    this.name = "InvalidCandidatePreparationAssociationValueError";
  }
}
