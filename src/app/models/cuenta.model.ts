export type TipoCuenta = 'AHORROS' | 'CORRIENTE';
export type EstadoCuenta = 'ACTIVA' | 'INACTIVA' | 'CANCELADA';

export interface Cuenta {
  id: number;
  numeroCuenta: string;
  tipo: TipoCuenta;
  estado: EstadoCuenta;
  saldo: number;
  exentaGmf: boolean;
  clienteId: number;
  fechaCreacion: string;
  fechaModificacion: string;
}

export interface CuentaRequest {
  tipo: TipoCuenta;
  clienteId: number;
  exentaGmf: boolean;
}
