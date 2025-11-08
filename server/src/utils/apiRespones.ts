export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

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
