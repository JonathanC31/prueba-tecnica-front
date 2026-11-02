import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransaccionService } from '../../services/transaccion.service';
import { CuentaService } from '../../services/cuenta.service';
import { ClienteService } from '../../services/cliente.service';
import { TipoTransaccion, TransaccionRequest } from '../../models/transaccion.model';
import { Cuenta } from '../../models/cuenta.model';

@Component({
  selector: 'app-transacciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="page-header">
        <div>
          <h1>Operaciones Financieras</h1>
          <p class="subtitle">Consignaciones, retiros y transferencias en tiempo real</p>
        </div>
      </div>

      <div class="transactions-layout">
        <!-- Formulario de Ejecución -->
        <div class="card operation-card">
          <h2>Ejecutar Transacción</h2>

          <!-- Selector de Tipo de Operación -->
          <div class="type-selector">
            <button
              type="button"
              class="type-btn"
              [class.active]="tipo() === 'CONSIGNACION'"
              (click)="tipo.set('CONSIGNACION')">
              📥 Consignación
            </button>
            <button
              type="button"
              class="type-btn"
              [class.active]="tipo() === 'RETIRO'"
              (click)="tipo.set('RETIRO')">
              📤 Retiro
            </button>
            <button
              type="button"
              class="type-btn"
              [class.active]="tipo() === 'TRANSFERENCIA'"
              (click)="tipo.set('TRANSFERENCIA')">
              🔄 Transferencia
            </button>
          </div>

          <form (ngSubmit)="ejecutar()">
            <!-- Cuenta Origen (Retiro / Transferencia) -->
            @if (tipo() === 'RETIRO' || tipo() === 'TRANSFERENCIA') {
              <div class="form-group">
                <label>Cuenta Origen (Débito) *</label>
                <select [(ngModel)]="cuentaOrigenId" name="cuentaOrigenId" required>
                  <option [ngValue]="null">-- Seleccionar cuenta origen --</option>
                  @for (c of todasLasCuentas(); track c.id) {
                    <option [ngValue]="c.id" [disabled]="c.estado !== 'ACTIVA'">
                      N° {{ c.numeroCuenta }} ({{ c.tipo }}) - Saldo: $ {{ c.saldo | number:'1.2-2' }} [{{ c.estado }}]
                    </option>
                  }
                </select>
              </div>
            }

            <!-- Cuenta Destino (Consignación / Transferencia) -->
            @if (tipo() === 'CONSIGNACION' || tipo() === 'TRANSFERENCIA') {
              <div class="form-group">
                <label>Cuenta Destino (Crédito) *</label>
                <select [(ngModel)]="cuentaDestinoId" name="cuentaDestinoId" required>
                  <option [ngValue]="null">-- Seleccionar cuenta destino --</option>
                  @for (c of todasLasCuentas(); track c.id) {
                    <option [ngValue]="c.id" [disabled]="c.id === cuentaOrigenId || c.estado !== 'ACTIVA'">
                      N° {{ c.numeroCuenta }} ({{ c.tipo }}) - Saldo: $ {{ c.saldo | number:'1.2-2' }} [{{ c.estado }}]
                    </option>
                  }
                </select>
              </div>
            }

            <!-- Monto -->
            <div class="form-group">
              <label>Monto de la Operación ($ COP) *</label>
              <input
                type="number"
                min="1"
                step="any"
                placeholder="Ej. 150000"
                [(ngModel)]="monto"
                name="monto"
                required
              />
            </div>

            <button
              type="submit"
              class="btn btn-primary btn-block"
              [disabled]="transaccionService.loading() || !monto || monto <= 0">
              @if (transaccionService.loading()) { <span class="spinner"></span> }
              Confirmar {{ tipo() }}
            </button>
          </form>
        </div>

        <!-- Consulta de Historial de Movimientos -->
        <div class="card history-card">
          <div class="card-header-flex">
            <h2>Historial de Movimientos</h2>
          </div>

          <div class="form-group">
            <label>Seleccionar cuenta para consultar:</label>
            <select [ngModel]="cuentaConsultaId()" (ngModelChange)="consultarMovimientos($event)">
              <option [ngValue]="null">-- Seleccione una cuenta --</option>
              @for (c of todasLasCuentas(); track c.id) {
                <option [ngValue]="c.id">
                  Cuenta N° {{ c.numeroCuenta }} ({{ c.tipo }}) - Saldo: $ {{ c.saldo | number:'1.2-2' }}
                </option>
              }
            </select>
          </div>

          @if (transaccionService.loading()) {
            <div class="loading-state">
              <span class="spinner"></span>
              <span>Cargando movimientos...</span>
            </div>
          } @else if (!cuentaConsultaId()) {
            <div class="empty-state">
              <div class="empty-icon">📊</div>
              <p>Seleccione una cuenta arriba para ver su extracto de movimientos.</p>
            </div>
          } @else if (transaccionService.historial().length === 0) {
            <div class="empty-state">
              <div class="empty-icon">📂</div>
              <p>Esta cuenta no registra movimientos aún.</p>
            </div>
          } @else {
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Fecha y Hora</th>
                    <th>Tipo</th>
                    <th>Monto</th>
                    <th>Origen</th>
                    <th>Destino</th>
                  </tr>
                </thead>
                <tbody>
                  @for (t of transaccionService.historial(); track t.id) {
                    <tr>
                      <td>{{ t.fecha | date:'medium' }}</td>
                      <td>
                        <span class="badge" [ngClass]="{
                          'badge-active': t.tipo === 'CONSIGNACION',
                          'badge-canceled': t.tipo === 'RETIRO',
                          'badge-blue': t.tipo === 'TRANSFERENCIA'
                        }">
                          {{ t.tipo }}
                        </span>
                      </td>
                      <td>
                        <strong [class.monto-positivo]="t.tipo === 'CONSIGNACION' || (t.tipo === 'TRANSFERENCIA' && t.cuentaDestinoId === cuentaConsultaId())"
                                [class.monto-negativo]="t.tipo === 'RETIRO' || (t.tipo === 'TRANSFERENCIA' && t.cuentaOrigenId === cuentaConsultaId())">
                          $ {{ t.monto | number:'1.2-2' }}
                        </strong>
                      </td>
                      <td>{{ t.cuentaOrigenId ? '#' + t.cuentaOrigenId : '—' }}</td>
                      <td>{{ t.cuentaDestinoId ? '#' + t.cuentaDestinoId : '—' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 24px; }
    .subtitle { color: var(--text-secondary); font-size: 0.9rem; }
    .transactions-layout { display: grid; grid-template-columns: 1fr 1.3fr; gap: 24px; }
    .type-selector { display: flex; gap: 8px; margin-bottom: 20px; background-color: var(--bg-input); padding: 4px; border-radius: var(--radius-md); border: 1px solid var(--border-color); }
    .type-btn { flex: 1; padding: 10px 8px; border: none; background: transparent; color: var(--text-secondary); font-size: 0.85rem; font-weight: 600; border-radius: var(--radius-sm); cursor: pointer; transition: all 0.2s; }
    .type-btn.active { background: linear-gradient(135deg, var(--accent-indigo), #4f46e5); color: #fff; box-shadow: var(--shadow-sm); }
    .btn-block { width: 100%; margin-top: 12px; }
    .card-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .monto-positivo { color: #34d399; }
    .monto-negativo { color: #fb7185; }
    .loading-state, .empty-state { padding: 48px; text-align: center; color: var(--text-secondary); display: flex; flex-direction: column; align-items: center; gap: 12px; }
    .empty-icon { font-size: 2.5rem; opacity: 0.6; }
    @media (max-width: 900px) {
      .transactions-layout { grid-template-columns: 1fr; }
    }
  `]
})
export class TransaccionesComponent implements OnInit {
  transaccionService = inject(TransaccionService);
  cuentaService = inject(CuentaService);
  clienteService = inject(ClienteService);

  tipo = signal<TipoTransaccion>('CONSIGNACION');
  cuentaOrigenId: number | null = null;
  cuentaDestinoId: number | null = null;
  monto: number | null = null;

  cuentaConsultaId = signal<number | null>(null);
  todasLasCuentas = signal<Cuenta[]>([]);

  ngOnInit() {
    this.cargarCuentas();
  }

  cargarCuentas() {
    this.clienteService.listar().subscribe(clientes => {
      const cuentasAcumuladas: Cuenta[] = [];
      clientes.forEach(cliente => {
        this.cuentaService.listarPorCliente(cliente.id).subscribe(cuentas => {
          cuentasAcumuladas.push(...cuentas);
          this.todasLasCuentas.set([...cuentasAcumuladas]);
          if (!this.cuentaConsultaId() && cuentasAcumuladas.length > 0) {
            this.consultarMovimientos(cuentasAcumuladas[0].id);
          }
        });
      });
    });
  }

  consultarMovimientos(cuentaId: number | null) {
    this.cuentaConsultaId.set(cuentaId);
    if (cuentaId) {
      this.transaccionService.listarPorCuenta(cuentaId).subscribe();
    }
  }

  ejecutar() {
    if (!this.monto || this.monto <= 0) return;

    const request: TransaccionRequest = {
      tipo: this.tipo(),
      monto: this.monto,
      cuentaOrigenId: (this.tipo() === 'RETIRO' || this.tipo() === 'TRANSFERENCIA') ? this.cuentaOrigenId : null,
      cuentaDestinoId: (this.tipo() === 'CONSIGNACION' || this.tipo() === 'TRANSFERENCIA') ? this.cuentaDestinoId : null
    };

    this.transaccionService.ejecutar(request).subscribe({
      next: () => {
        this.monto = null;
        this.cargarCuentas();
        if (this.cuentaConsultaId()) {
          this.consultarMovimientos(this.cuentaConsultaId());
        }
      }
    });
  }
}
