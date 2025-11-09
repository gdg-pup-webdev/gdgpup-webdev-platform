export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export type ApiRequestBody<T = any> = {
  payload: T;
};
