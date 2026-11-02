import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../services/cliente.service';
import { Cliente, ClienteRequest, ClienteUpdateRequest, TipoIdentificacion } from '../../models/cliente.model';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="page-header">
        <div>
          <h1>Gestión de Clientes</h1>
          <p class="subtitle">Administración y registro de titulares de cuentas</p>
        </div>
        <button class="btn btn-primary" (click)="abrirModalCrear()">
          <span>+</span> Nuevo Cliente
        </button>
      </div>

      <!-- Barra de búsqueda -->
      <div class="search-bar card">
        <input
          type="text"
          placeholder="Buscar por nombre, apellido o número de identificación..."
          [ngModel]="filtro()"
          (ngModelChange)="filtro.set($event)"
        />
      </div>

      <!-- Tabla de clientes -->
      <div class="card">
        @if (clienteService.loading()) {
          <div class="loading-state">
            <span class="spinner"></span>
            <span>Cargando clientes...</span>
          </div>
        } @else if (clientesFiltrados().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">👥</div>
            <p>No se encontraron clientes registrados.</p>
          </div>
        } @else {
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tipo</th>
                  <th>Identificación</th>
                  <th>Nombre Completo</th>
                  <th>Correo</th>
                  <th>Nacimiento</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (c of clientesFiltrados(); track c.id) {
                  <tr>
                    <td><strong>#{{ c.id }}</strong></td>
                    <td><span class="badge badge-blue">{{ c.tipoIdentificacion }}</span></td>
                    <td>{{ c.numeroIdentificacion }}</td>
                    <td><strong>{{ c.nombres }} {{ c.apellido }}</strong></td>
                    <td>{{ c.correo }}</td>
                    <td>{{ c.fechaNacimiento }}</td>
                    <td>
                      <div class="action-buttons">
                        <button class="btn btn-secondary btn-sm" (click)="abrirModalEditar(c)">Editar</button>
                        <button class="btn btn-danger btn-sm" (click)="confirmarEliminar(c)">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- Modal de Creación / Edición -->
      @if (mostrarModal()) {
        <div class="modal-overlay" (click)="cerrarModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>{{ modoEdicion() ? 'Editar Cliente' : 'Nuevo Cliente' }}</h2>
              <button class="close-btn" (click)="cerrarModal()">×</button>
            </div>

            <form (ngSubmit)="guardar()">
              @if (!modoEdicion()) {
                <div class="form-grid">
                  <div class="form-group">
                    <label>Tipo de Identificación *</label>
                    <select [(ngModel)]="formCrear.tipoIdentificacion" name="tipoIdentificacion" required>
                      <option value="CC">Cédula de Ciudadanía (CC)</option>
                      <option value="CE">Cédula de Extranjería (CE)</option>
                      <option value="TI">Tarjeta de Identidad (TI)</option>
                      <option value="PASAPORTE">Pasaporte</option>
                      <option value="NIT">NIT</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Número de Identificación *</label>
                    <input type="text" [(ngModel)]="formCrear.numeroIdentificacion" name="numeroIdentificacion" required />
                  </div>
                </div>
              }

              <div class="form-grid">
                <div class="form-group">
                  <label>Nombres *</label>
                  <input type="text" [(ngModel)]="nombres" name="nombres" required minlength="2" />
                </div>
                <div class="form-group">
                  <label>Apellido *</label>
                  <input type="text" [(ngModel)]="apellido" name="apellido" required minlength="2" />
                </div>
              </div>

              <div class="form-grid">
                <div class="form-group">
                  <label>Correo Electrónico *</label>
                  <input type="email" [(ngModel)]="correo" name="correo" required />
                </div>
                <div class="form-group">
                  <label>Fecha de Nacimiento (Mayor de 18 años) *</label>
                  <input type="date" [(ngModel)]="fechaNacimiento" name="fechaNacimiento" required />
                </div>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="cerrarModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary" [disabled]="clienteService.loading()">
                  @if (clienteService.loading()) { <span class="spinner"></span> }
                  {{ modoEdicion() ? 'Actualizar' : 'Registrar Cliente' }}
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
    .search-bar { padding: 14px 18px; }
    .action-buttons { display: flex; gap: 6px; }
    .loading-state, .empty-state { padding: 48px; text-align: center; color: var(--text-secondary); display: flex; flex-direction: column; align-items: center; gap: 12px; }
    .empty-icon { font-size: 2.5rem; opacity: 0.6; }
    .close-btn { background: none; border: none; font-size: 1.5rem; color: var(--text-secondary); cursor: pointer; }
  `]
})
export class ClientesComponent implements OnInit {
  clienteService = inject(ClienteService);

  filtro = signal<string>('');
  mostrarModal = signal<boolean>(false);
  modoEdicion = signal<boolean>(false);
  clienteActualId = signal<number | null>(null);

  formCrear: ClienteRequest = {
    tipoIdentificacion: 'CC',
    numeroIdentificacion: '',
    nombres: '',
    apellido: '',
    correo: '',
    fechaNacimiento: '1995-01-01'
  };

  nombres = '';
  apellido = '';
  correo = '';
  fechaNacimiento = '1995-01-01';

  ngOnInit() {
    this.clienteService.listar().subscribe();
  }

  clientesFiltrados() {
    const q = this.filtro().toLowerCase().trim();
    const lista = this.clienteService.clientes();
    if (!q) return lista;
    return lista.filter(c =>
      c.nombres.toLowerCase().includes(q) ||
      c.apellido.toLowerCase().includes(q) ||
      c.numeroIdentificacion.includes(q)
    );
  }

  abrirModalCrear() {
    this.modoEdicion.set(false);
    this.formCrear = {
      tipoIdentificacion: 'CC',
      numeroIdentificacion: '',
      nombres: '',
      apellido: '',
      correo: '',
      fechaNacimiento: '1995-01-01'
    };
    this.nombres = '';
    this.apellido = '';
    this.correo = '';
    this.fechaNacimiento = '1995-01-01';
    this.mostrarModal.set(true);
  }

  abrirModalEditar(c: Cliente) {
    this.modoEdicion.set(true);
    this.clienteActualId.set(c.id);
    this.nombres = c.nombres;
    this.apellido = c.apellido;
    this.correo = c.correo;
    this.fechaNacimiento = c.fechaNacimiento;
    this.mostrarModal.set(true);
  }

  cerrarModal() {
    this.mostrarModal.set(false);
  }

  guardar() {
    if (this.modoEdicion() && this.clienteActualId()) {
      const updateData: ClienteUpdateRequest = {
        nombres: this.nombres,
        apellido: this.apellido,
        correo: this.correo,
        fechaNacimiento: this.fechaNacimiento
      };
      this.clienteService.actualizar(this.clienteActualId()!, updateData).subscribe({
        next: () => this.cerrarModal()
      });
    } else {
      this.formCrear.nombres = this.nombres;
      this.formCrear.apellido = this.apellido;
      this.formCrear.correo = this.correo;
      this.formCrear.fechaNacimiento = this.fechaNacimiento;
      this.clienteService.crear(this.formCrear).subscribe({
        next: () => this.cerrarModal()
      });
    }
  }

  confirmarEliminar(c: Cliente) {
    if (confirm(`¿Está seguro de eliminar al cliente ${c.nombres} ${c.apellido}?`)) {
      this.clienteService.eliminar(c.id).subscribe();
    }
  }
}
