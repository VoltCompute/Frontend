/** Forme normalisée d'une erreur d'appel API (voir interceptor dans client.ts). */
export type ApiError = {
  status: number;
  message: string;
};
