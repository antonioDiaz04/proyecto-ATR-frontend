export interface Producto {
  _id: string;
  nombre: string;
  descripcion?: string;
  precioActual: number;
  precioAnterior?: number;
  mostrarPrecioAnterior?: boolean;
  imagenes: string[];
  imagenPrincipal?: string;
  talla?: string;
  color?: string;
  opcionesTipoTransaccion?: 'renta' | 'Venta';
  isNuevo?: boolean;
  _hoverIndex?: number;
}