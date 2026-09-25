import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ProblemDetail } from '../models/problem-detail';
import { Notifier } from '../notifications/notifier';

/**
 * Muestra un mensaje para cualquier error HTTP, usando el ProblemDetail del backend.
 * Los componentes solo necesitan reaccionar al error (por ejemplo, quitar un indicador de carga).
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifier = inject(Notifier);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        notifier.error(toMessage(error));
      }
      return throwError(() => error);
    }),
  );
};

function toMessage(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'No se pudo conectar con el servidor. Revisa que el backend esté en ejecución.';
  }

  const problem: ProblemDetail | null =
    error.error && typeof error.error === 'object' ? (error.error as ProblemDetail) : null;

  const fieldErrors = problem?.errors ? Object.values(problem.errors) : [];
  if (fieldErrors.length > 0) {
    return fieldErrors.join('. ');
  }
  if (problem?.detail) {
    return problem.detail;
  }
  return error.status >= 500
    ? 'El servidor no está disponible en este momento. Intenta de nuevo.'
    : `La solicitud no se pudo completar (error ${error.status}).`;
}
