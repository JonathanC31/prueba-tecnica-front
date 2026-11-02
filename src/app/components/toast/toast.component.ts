import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of notify.toasts(); track toast.id) {
        <div class="toast" [ngClass]="'toast-' + toast.tipo">
          <div class="toast-content">
            <span class="toast-icon">
              @if (toast.tipo === 'success') { ✓ }
              @else if (toast.tipo === 'error') { ✕ }
              @else { ℹ }
            </span>
            <div>
              <div class="toast-title">{{ toast.titulo }}</div>
              <div class="toast-msg">{{ toast.mensaje }}</div>
            </div>
          </div>
          <button class="toast-close" (click)="notify.remove(toast.id)">×</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 2000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 420px;
      width: calc(100% - 40px);
    }
    .toast {
      padding: 14px 18px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      box-shadow: var(--shadow-lg);
      border: 1px solid transparent;
      animation: slideIn 0.25s ease-out;
    }
    .toast-success { background-color: #064e3b; border-color: #059669; color: #ecfdf5; }
    .toast-error { background-color: #4c0519; border-color: #e11d48; color: #fff1f2; }
    .toast-info { background-color: #082f49; border-color: #0284c7; color: #f0f9ff; }
    .toast-content { display: flex; gap: 12px; align-items: flex-start; }
    .toast-icon { font-weight: bold; font-size: 1.1rem; }
    .toast-title { font-weight: 700; font-size: 0.9rem; margin-bottom: 2px; }
    .toast-msg { font-size: 0.825rem; opacity: 0.9; }
    .toast-close { background: none; border: none; color: inherit; font-size: 1.25rem; cursor: pointer; opacity: 0.7; }
    .toast-close:hover { opacity: 1; }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent {
  notify = inject(NotificationService);
}
