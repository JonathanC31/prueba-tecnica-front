import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, finalize, tap, throwError } from 'rxjs';
import { Cliente, ClienteRequest, ClienteUpdateRequest } from '../models/cliente.model';
import { NotificationService } from './notification.service';
import { ErrorResponse } from '../models/error.model';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private http = inject(HttpClient);
  private notify = inject(NotificationService);
  private baseUrl = '/api/clientes';

  clientes = signal<Cliente[]>([]);
  loading = signal<boolean>(false);

  listar(): Observable<Cliente[]> {
    this.loading.set(true);
    return this.http.get<Cliente[]>(this.baseUrl).pipe(
      tap(data => this.clientes.set(data)),
      catchError(err => this.handleError('Error al listar clientes', err)),
      finalize(() => this.loading.set(false))
    );
  }

  buscarPorId(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.baseUrl}/${id}`).pipe(
      catchError(err => this.handleError(`Cliente ${id} no encontrado`, err))
    );
  }

  crear(request: ClienteRequest): Observable<Cliente> {
    this.loading.set(true);
    return this.http.post<Cliente>(this.baseUrl, request).pipe(
      tap(creado => {
        this.clientes.update(list => [...list, creado]);
        this.notify.success('Cliente Creado', `Se registró a ${creado.nombres} ${creado.apellido} exitosamente.`);
      }),
      catchError(err => this.handleError('No se pudo crear el cliente', err)),
      finalize(() => this.loading.set(false))
    );
  }

  actualizar(id: number, request: ClienteUpdateRequest): Observable<Cliente> {
    this.loading.set(true);
    return this.http.put<Cliente>(`${this.baseUrl}/${id}`, request).pipe(
      tap(actualizado => {
        this.clientes.update(list => list.map(c => c.id === id ? actualizado : c));
        this.notify.success('Cliente Actualizado', `Datos de ${actualizado.nombres} actualizados.`);
      }),
      catchError(err => this.handleError('No se pudo actualizar el cliente', err)),
      finalize(() => this.loading.set(false))
    );
  }

  eliminar(id: number): Observable<void> {
    this.loading.set(true);
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        this.clientes.update(list => list.filter(c => c.id !== id));
        this.notify.success('Cliente Eliminado', `El cliente fue eliminado correctamente.`);
      }),
      catchError(err => this.handleError('No se pudo eliminar el cliente', err)),
      finalize(() => this.loading.set(false))
    );
  }

  private handleError(contexto: string, error: HttpErrorResponse): Observable<never> {
    const errorBody = error.error as ErrorResponse;
    let mensaje = 'Ocurrió un error inesperado';

    if (errorBody?.errores && Object.keys(errorBody.errores).length > 0) {
      mensaje = Object.entries(errorBody.errores).map(([c, m]) => `${c}: ${m}`).join(' | ');
    } else if (errorBody?.mensaje) {
      mensaje = errorBody.mensaje;
    } else if (error.status === 0) {
      mensaje = 'No hay conexión con el servidor backend';
    }

    this.notify.error(contexto, mensaje);
    return throwError(() => error);
  }
}
