import "server-only";

export type SubscriptionErrorCode =
  | "INVALID_INPUT"
  | "NOT_CONFIGURED"
  | "NOT_FOUND"
  | "ACCESS_DENIED"
  | "PROVIDER_UNAUTHORIZED"
  | "PROVIDER_REJECTED"
  | "PROVIDER_UNAVAILABLE"
  | "INTERNAL_ERROR";

export class SubscriptionError extends Error {
  constructor(
    message: string,
    public readonly code: SubscriptionErrorCode,
    public readonly status: number,
    public readonly detail = "",
  ) {
    super(message);
    this.name = "SubscriptionError";
  }
}

export const normalizeSubscriptionError = (error: unknown) => {
  if (error instanceof SubscriptionError) return error;
  if (error instanceof Error) {
    return new SubscriptionError(
      "Não foi possível concluir a assinatura.",
      "INTERNAL_ERROR",
      500,
      error.message,
    );
  }
  return new SubscriptionError(
    "Não foi possível concluir a assinatura.",
    "INTERNAL_ERROR",
    500,
  );
};
