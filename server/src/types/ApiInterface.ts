export interface ApiResponse<T = any> {
  data: T;
  error: boolean;
}

export type ApiRequestBody<T = any> = {
  payload: T;
};
