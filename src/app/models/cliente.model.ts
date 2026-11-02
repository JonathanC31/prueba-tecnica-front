export type TipoIdentificacion = 'CC' | 'CE' | 'TI' | 'PASAPORTE' | 'NIT';

export interface Cliente {
  id: number;
  tipoIdentificacion: TipoIdentificacion;
  numeroIdentificacion: string;
  nombres: string;
  apellido: string;
  correo: string;
  fechaNacimiento: string;
  fechaCreacion?: string;
  fechaModificacion?: string;
}

export interface ClienteRequest {
  tipoIdentificacion: TipoIdentificacion;
  numeroIdentificacion: string;
  nombres: string;
  apellido: string;
  correo: string;
  fechaNacimiento: string;
}

export interface ClienteUpdateRequest {
  nombres: string;
  apellido: string;
  correo: string;
  fechaNacimiento: string;
}
