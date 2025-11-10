export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export type ApiRequestBody<T = unknown> = {
  payload: T;
};
