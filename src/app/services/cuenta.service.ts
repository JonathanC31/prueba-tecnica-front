import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, finalize, tap, throwError } from 'rxjs';
import { Cuenta, CuentaRequest } from '../models/cuenta.model';
import { NotificationService } from './notification.service';
import { ErrorResponse } from '../models/error.model';

@Injectable({
  providedIn: 'root'
})
export class CuentaService {
  private http = inject(HttpClient);
  private notify = inject(NotificationService);
  private baseUrl = '/api/cuentas';

  cuentas = signal<Cuenta[]>([]);
  loading = signal<boolean>(false);

  listarPorCliente(clienteId: number): Observable<Cuenta[]> {
    this.loading.set(true);
    return this.http.get<Cuenta[]>(`${this.baseUrl}?clienteId=${clienteId}`).pipe(
      tap(data => this.cuentas.set(data)),
      catchError(err => this.handleError('Error al listar cuentas', err)),
      finalize(() => this.loading.set(false))
    );
  }

  buscarPorId(id: number): Observable<Cuenta> {
    return this.http.get<Cuenta>(`${this.baseUrl}/${id}`).pipe(
      catchError(err => this.handleError(`Cuenta ${id} no encontrada`, err))
    );
  }

  crear(request: CuentaRequest): Observable<Cuenta> {
    this.loading.set(true);
    return this.http.post<Cuenta>(this.baseUrl, request).pipe(
      tap(creada => {
        this.cuentas.update(list => [...list, creada]);
        this.notify.success('Cuenta Creada', `Cuenta ${creada.tipo} N° ${creada.numeroCuenta} creada.`);
      }),
      catchError(err => this.handleError('No se pudo crear la cuenta', err)),
      finalize(() => this.loading.set(false))
    );
  }

  activar(id: number): Observable<Cuenta> {
    return this.actualizarEstado(id, 'activar', 'Cuenta Activada');
  }

  inactivar(id: number): Observable<Cuenta> {
    return this.actualizarEstado(id, 'inactivar', 'Cuenta Inactivada');
  }

  cancelar(id: number): Observable<Cuenta> {
    return this.actualizarEstado(id, 'cancelar', 'Cuenta Cancelada');
  }

  private actualizarEstado(id: number, accion: string, tituloExito: string): Observable<Cuenta> {
    this.loading.set(true);
    return this.http.patch<Cuenta>(`${this.baseUrl}/${id}/${accion}`, {}).pipe(
      tap(actualizada => {
        this.cuentas.update(list => list.map(c => c.id === id ? actualizada : c));
        this.notify.success(tituloExito, `La cuenta N° ${actualizada.numeroCuenta} ahora está ${actualizada.estado}.`);
      }),
      catchError(err => this.handleError(`No se pudo cambiar estado a ${accion}`, err)),
      finalize(() => this.loading.set(false))
    );
  }

  private handleError(contexto: string, error: HttpErrorResponse): Observable<never> {
    const errorBody = error.error as ErrorResponse;
    const mensaje = errorBody?.mensaje || (error.status === 0 ? 'Sin conexión con el backend' : 'Error en la operación');
    this.notify.error(contexto, mensaje);
    return throwError(() => error);
  }
}
