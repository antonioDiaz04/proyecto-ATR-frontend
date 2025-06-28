import { Component,OnInit } from "@angular/core";

@Component({
  selector: "app-ventas",
  templateUrl: "./ventas.component.html"
})
export class VentasComponent implements OnInit {
    ventas: any[] = [];
  ventasOriginal: any[] = [];

  ventasResumen = {
    totalVentas: 0,
    ventasOnline: 0,
    ventasPresenciales: 0,
    porcentajeOnline: 0,
    porcentajePresencial: 0
  };

  aniosUnicos: number[] = [];
  mesesUnicos: string[] = [];
  anioSeleccionado: string = '';
  mesSeleccionado: string = '';

  ngOnInit(): void {
    this.obtenerDatos();
  }

  obtenerDatos() {
    this.ventas = [
      {
        fecha: '2024-06-10',
        producto: 'Vestido Azul Noche',
        cantidad: 1,
        total: 850,
        metodoPago: 'Online',
      },
      {
        fecha: '2024-06-12',
        producto: 'Vestido Gala Rojo',
        cantidad: 1,
        total: 920,
        metodoPago: 'Efectivo',
      },
      {
        fecha: '2024-05-25',
        producto: 'Vestido Rosa Pastel',
        cantidad: 2,
        total: 1800,
        metodoPago: 'Online',
      }
    ];

    this.ventasOriginal = [...this.ventas];
    this.actualizarResumen();
    this.extraerAniosYMeseUnicos();
  }

  actualizarResumen() {
    const total = this.ventas.reduce((acc, v) => acc + v.total, 0);
    const online = this.ventas
      .filter((v) => v.metodoPago.toLowerCase() === 'online')
      .reduce((acc, v) => acc + v.total, 0);
    const presencial = total - online;

    this.ventasResumen.totalVentas = total;
    this.ventasResumen.ventasOnline = online;
    this.ventasResumen.ventasPresenciales = presencial;
    this.ventasResumen.porcentajeOnline = total ? (online / total) * 100 : 0;
    this.ventasResumen.porcentajePresencial = total ? (presencial / total) * 100 : 0;
  }

  extraerAniosYMeseUnicos() {
    const fechas = this.ventasOriginal.map((v) => new Date(v.fecha));
    this.aniosUnicos = Array.from(new Set(fechas.map((f) => f.getFullYear()))).sort();
    this.mesesUnicos = Array.from(
      new Set(
        fechas.map((f) =>
          f.toLocaleDateString('es-MX', { month: 'long' }).toLowerCase()
        )
      )
    );
  }

  filtrarVentas() {
    this.ventas = this.ventasOriginal.filter((v) => {
      const fecha = new Date(v.fecha);
      const mes = fecha
        .toLocaleDateString('es-MX', { month: 'long' })
        .toLowerCase();
      const anio = fecha.getFullYear().toString();

      return (
        (!this.anioSeleccionado || this.anioSeleccionado === anio) &&
        (!this.mesSeleccionado || this.mesSeleccionado === mes)
      );
    });

    this.actualizarResumen();
  }

  generarReporte() {
    console.log('Generando PDF de ventas...');
    // Aquí iría la lógica con jsPDF o similar si deseas implementarla
  }
}