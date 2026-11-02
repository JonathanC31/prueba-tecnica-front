import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'clientes', pathMatch: 'full' },
  {
    path: 'clientes',
    loadComponent: () => import('./pages/clientes/clientes.component').then(m => m.ClientesComponent)
  },
  {
    path: 'cuentas',
    loadComponent: () => import('./pages/cuentas/cuentas.component').then(m => m.CuentasComponent)
  },
  {
    path: 'transacciones',
    loadComponent: () => import('./pages/transacciones/transacciones.component').then(m => m.TransaccionesComponent)
  },
  { path: '**', redirectTo: 'clientes' }
];
