export type ApiError = {
  code: string;
  status: number;
  publicMessage: string;
  privateMessage: string;
};


export const ERRORS: Record<string, ApiError> = {
  AUTH_INVALID_TOKEN: {
    code: "000001",
    status: 401,
    publicMessage: "Invalid token",
    privateMessage: "The provided authentication token is invalid or expired.",
  },
  INCOMPLETE_PATH_PARAMETERS: {
    code: "000002",
    status: 400,
    publicMessage: "Incomplete path parameters",
    privateMessage: "Missing required parameters in the request path.",
  },
  UNKNOWN_ERROR: {
    code: "999999",
    status: 500,
    publicMessage: "Internal server error",
    privateMessage: "An unexpected error occurred.",
  },
};
