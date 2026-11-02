export type TipoTransaccion = 'CONSIGNACION' | 'RETIRO' | 'TRANSFERENCIA';

export interface Transaccion {
  id: number;
  tipo: TipoTransaccion;
  monto: number;
  cuentaOrigenId?: number | null;
  cuentaDestinoId?: number | null;
  fecha: string;
}

export interface TransaccionRequest {
  tipo: TipoTransaccion;
  monto: number;
  cuentaOrigenId?: number | null;
  cuentaDestinoId?: number | null;
}
