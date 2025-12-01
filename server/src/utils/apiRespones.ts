
import { ApiResponse } from "../types/ApiInterface.js";

export function createApiResponse<T>(
  success: boolean,
  message: string,
  data?: T
): ApiResponse<T> {
  return {
    success,
    message,
    data,
  };
}
