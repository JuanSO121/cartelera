/** Formato de error que devuelve el backend (RFC 9457). */
export interface ProblemDetail {
  title?: string;
  detail?: string;
  status?: number;
  errors?: Record<string, string>;
}
