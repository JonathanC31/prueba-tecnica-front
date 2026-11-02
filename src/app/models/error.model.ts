export interface ErrorResponse {
  mensaje: string;
  errores?: Record<string, string>;
  fecha?: string;
}
