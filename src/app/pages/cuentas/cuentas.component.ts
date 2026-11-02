import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CuentaService } from '../../services/cuenta.service';
import { ClienteService } from '../../services/cliente.service';
import { Cuenta, CuentaRequest, TipoCuenta } from '../../models/cuenta.model';

@Component({
  selector: 'app-cuentas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="page-header">
        <div>
          <h1>Gestión de Cuentas Bancarias</h1>
          <p class="subtitle">Apertura y control de estado de cuentas de ahorros y corrientes</p>
        </div>
        <button class="btn btn-primary" [disabled]="!clienteSeleccionadoId()" (click)="abrirModalCrear()">
          <span>+</span> Nueva Cuenta
        </button>
      </div>

      <!-- Selector de Cliente -->
      <div class="card selector-card">
        <label>Seleccionar Cliente para gestionar sus productos:</label>
        <select [ngModel]="clienteSeleccionadoId()" (ngModelChange)="cambiarCliente($event)">
          <option [ngValue]="null">-- Seleccione un cliente --</option>
          @for (c of clienteService.clientes(); track c.id) {
            <option [ngValue]="c.id">
              #{{ c.id }} - {{ c.nombres }} {{ c.apellido }} ({{ c.tipoIdentificacion }} {{ c.numeroIdentificacion }})
            </option>
          }
        </select>
      </div>

      <!-- Lista de Cuentas -->
      @if (clienteSeleccionadoId()) {
        <div class="card">
          <div class="card-header-flex">
            <h2>Productos Financieros</h2>
            <span class="count-badge">{{ cuentaService.cuentas().length }} cuenta(s)</span>
          </div>

          @if (cuentaService.loading()) {
            <div class="loading-state">
              <span class="spinner"></span>
              <span>Consultando cuentas...</span>
            </div>
          } @else if (cuentaService.cuentas().length === 0) {
            <div class="empty-state">
              <div class="empty-icon">💳</div>
              <p>Este cliente aún no tiene cuentas asociadas.</p>
              <button class="btn btn-primary btn-sm" (click)="abrirModalCrear()">Crear primera cuenta</button>
            </div>
          } @else {
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Número de Cuenta</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Saldo Disponible</th>
                    <th>GMF (4x1000)</th>
                    <th>Fecha Creación</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (c of cuentaService.cuentas(); track c.id) {
                    <tr>
                      <td><strong class="mono">{{ c.numeroCuenta }}</strong></td>
                      <td>
                        <span class="badge" [ngClass]="c.tipo === 'AHORROS' ? 'badge-blue' : 'badge-inactive'">
                          {{ c.tipo }}
                        </span>
                      </td>
                      <td>
                        <span class="badge" [ngClass]="{
                          'badge-active': c.estado === 'ACTIVA',
                          'badge-inactive': c.estado === 'INACTIVA',
                          'badge-canceled': c.estado === 'CANCELADA'
                        }">
                          {{ c.estado }}
                        </span>
                      </td>
                      <td><strong class="saldo">$ {{ c.saldo | number:'1.2-2' }}</strong></td>
                      <td>{{ c.exentaGmf ? 'Exenta' : 'Aplica' }}</td>
                      <td>{{ c.fechaCreacion | date:'mediumDate' }}</td>
                      <td>
                        <div class="action-buttons">
                          @if (c.estado === 'ACTIVA') {
                            <button class="btn btn-secondary btn-sm" (click)="inactivar(c)">Inactivar</button>
                            <button class="btn btn-danger btn-sm" (click)="cancelar(c)">Cancelar</button>
                          } @else if (c.estado === 'INACTIVA') {
                            <button class="btn btn-success btn-sm" (click)="activar(c)">Activar</button>
                            <button class="btn btn-danger btn-sm" (click)="cancelar(c)">Cancelar</button>
                          } @else {
                            <span class="text-muted">Cancelada</span>
                          }
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }

      <!-- Modal Apertura de Cuenta -->
      @if (mostrarModal()) {
        <div class="modal-overlay" (click)="cerrarModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Apertura de Cuenta</h2>
              <button class="close-btn" (click)="cerrarModal()">×</button>
            </div>

            <form (ngSubmit)="crearCuenta()">
              <div class="form-group">
                <label>Tipo de Cuenta *</label>
                <select [(ngModel)]="tipoCuenta" name="tipoCuenta" required>
                  <option value="AHORROS">Cuenta de Ahorros (Prefijo 53)</option>
                  <option value="CORRIENTE">Cuenta Corriente (Prefijo 33)</option>
                </select>
                <small class="help-text">El número de 10 dígitos se generará automáticamente según las reglas de negocio.</small>
              </div>

              <div class="form-group checkbox-group">
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="exentaGmf" name="exentaGmf" />
                  <span>Exenta de Gravamen a los Movimientos Financieros (GMF)</span>
                </label>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="cerrarModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary" [disabled]="cuentaService.loading()">
                  @if (cuentaService.loading()) { <span class="spinner"></span> }
                  Crear Cuenta
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .subtitle { color: var(--text-secondary); font-size: 0.9rem; }
    .selector-card { margin-bottom: 20px; }
    .card-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .count-badge { font-size: 0.8rem; background-color: var(--border-color); padding: 4px 10px; border-radius: 9999px; }
    .mono { font-family: monospace; font-size: 1rem; color: var(--accent-blue); }
    .saldo { color: #34d399; font-size: 1rem; }
    .text-muted { color: var(--text-muted); font-size: 0.85rem; }
    .action-buttons { display: flex; gap: 6px; }
    .loading-state, .empty-state { padding: 48px; text-align: center; color: var(--text-secondary); display: flex; flex-direction: column; align-items: center; gap: 12px; }
    .empty-icon { font-size: 2.5rem; opacity: 0.6; }
    .close-btn { background: none; border: none; font-size: 1.5rem; color: var(--text-secondary); cursor: pointer; }
    .checkbox-group { margin-top: 16px; }
    .checkbox-label { display: flex; align-items: center; gap: 10px; cursor: pointer; color: var(--text-primary); font-size: 0.9rem; }
    .checkbox-label input { width: auto; margin: 0; }
    .help-text { display: block; margin-top: 4px; font-size: 0.78rem; color: var(--text-muted); }
  `]
})
export class CuentasComponent implements OnInit {
  cuentaService = inject(CuentaService);
  clienteService = inject(ClienteService);

  clienteSeleccionadoId = signal<number | null>(null);
  mostrarModal = signal<boolean>(false);

  tipoCuenta: TipoCuenta = 'AHORROS';
  exentaGmf = false;

  ngOnInit() {
    this.clienteService.listar().subscribe(clientes => {
      if (clientes.length > 0 && !this.clienteSeleccionadoId()) {
        this.cambiarCliente(clientes[0].id);
      }
    });
  }

  cambiarCliente(id: number | null) {
    this.clienteSeleccionadoId.set(id);
    if (id) {
      this.cuentaService.listarPorCliente(id).subscribe();
    }
  }

  abrirModalCrear() {
    this.tipoCuenta = 'AHORROS';
    this.exentaGmf = false;
    this.mostrarModal.set(true);
  }

  cerrarModal() {
    this.mostrarModal.set(false);
  }

  crearCuenta() {
    const clienteId = this.clienteSeleccionadoId();
    if (!clienteId) return;

    const request: CuentaRequest = {
      tipo: this.tipoCuenta,
      clienteId: clienteId,
      exentaGmf: this.exentaGmf
    };

    this.cuentaService.crear(request).subscribe({
      next: () => this.cerrarModal()
    });
  }

  activar(c: Cuenta) {
    this.cuentaService.activar(c.id).subscribe();
  }

  inactivar(c: Cuenta) {
    this.cuentaService.inactivar(c.id).subscribe();
  }

  cancelar(c: Cuenta) {
    if (c.saldo > 0) {
      alert(`No es posible cancelar la cuenta N° ${c.numeroCuenta} porque su saldo es de $${c.saldo}. Debe estar en saldo 0.`);
      return;
    }
    if (confirm(`¿Confirma cancelar definitivamente la cuenta N° ${c.numeroCuenta}?`)) {
      this.cuentaService.cancelar(c.id).subscribe();
    }
  }
}
