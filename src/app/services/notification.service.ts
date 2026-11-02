import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  tipo: 'success' | 'error' | 'info';
  titulo: string;
  mensaje: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private counter = 0;
  toasts = signal<Toast[]>([]);

  success(titulo: string, mensaje: string) {
    this.add('success', titulo, mensaje);
  }

  error(titulo: string, mensaje: string) {
    this.add('error', titulo, mensaje);
  }

  info(titulo: string, mensaje: string) {
    this.add('info', titulo, mensaje);
  }

  remove(id: number) {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  private add(tipo: 'success' | 'error' | 'info', titulo: string, mensaje: string) {
    const id = ++this.counter;
    const toast: Toast = { id, tipo, titulo, mensaje };
    this.toasts.update(list => [...list, toast]);

    setTimeout(() => {
      this.remove(id);
    }, 5000);
  }
}
