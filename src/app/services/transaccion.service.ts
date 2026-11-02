import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, finalize, tap, throwError } from 'rxjs';
import { Transaccion, TransaccionRequest } from '../models/transaccion.model';
import { NotificationService } from './notification.service';
import { ErrorResponse } from '../models/error.model';

@Injectable({
  providedIn: 'root'
})
export class TransaccionService {
  private http = inject(HttpClient);
  private notify = inject(NotificationService);
  private baseUrl = '/api/transacciones';

  historial = signal<Transaccion[]>([]);
  loading = signal<boolean>(false);

  ejecutar(request: TransaccionRequest): Observable<Transaccion> {
    this.loading.set(true);
    return this.http.post<Transaccion>(this.baseUrl, request).pipe(
      tap(t => {
        this.notify.success('Transacción Exitosa', `${t.tipo} por $${t.monto.toLocaleString()} ejecutada.`);
      }),
      catchError(err => this.handleError('Error en Transacción', err)),
      finalize(() => this.loading.set(false))
    );
  }

  listarPorCuenta(cuentaId: number): Observable<Transaccion[]> {
    this.loading.set(true);
    return this.http.get<Transaccion[]>(`${this.baseUrl}?cuentaId=${cuentaId}`).pipe(
      tap(data => this.historial.set(data)),
      catchError(err => this.handleError('Error al cargar movimientos', err)),
      finalize(() => this.loading.set(false))
    );
  }

  private handleError(contexto: string, error: HttpErrorResponse): Observable<never> {
    const errorBody = error.error as ErrorResponse;
    let mensaje = 'Ocurrió un error inesperado';

    if (error.status === 409) {
      mensaje = errorBody?.mensaje || 'Conflicto de concurrencia: la cuenta fue modificada simultáneamente. Intente de nuevo.';
    } else if (errorBody?.mensaje) {
      mensaje = errorBody.mensaje;
    } else if (errorBody?.errores) {
      mensaje = Object.entries(errorBody.errores).map(([c, m]) => `${c}: ${m}`).join(' | ');
    }

    this.notify.error(contexto, mensaje);
    return throwError(() => error);
  }
}
