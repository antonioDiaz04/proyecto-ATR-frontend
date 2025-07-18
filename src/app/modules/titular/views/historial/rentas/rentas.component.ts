import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-rentas',
  templateUrl: './rentas.component.html',
})
export class RentasComponent implements OnInit {
  rentas: any[] = [];
  rentasOriginal: any[] = [];

  rentasResumen = {
    totalRentas: 0,
    rentasOnline: 0,
    rentasPresenciales: 0,
    porcentajeOnline: 0,
    porcentajePresencial: 0,
  };

  aniosUnicos: number[] = [];
  mesesUnicos: string[] = [];
  anioSeleccionado: string = '';
  mesSeleccionado: string = '';

  ngOnInit() {
    this.obtenerDatos();
  }

  obtenerDatos() {
    this.rentas = [
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
      },
    ];

    this.rentasOriginal = [...this.rentas];
    this.actualizarResumen();
    this.extraerAniosYMeseUnicos();
  }

  actualizarResumen() {
    const total = this.rentas.reduce((acc, r) => acc + r.total, 0);
    const online = this.rentas
      .filter((r) => r.metodoPago.toLowerCase() === 'online')
      .reduce((acc, r) => acc + r.total, 0);
    const presencial = total - online;

    this.rentasResumen.totalRentas = total;
    this.rentasResumen.rentasOnline = online;
    this.rentasResumen.rentasPresenciales = presencial;
    this.rentasResumen.porcentajeOnline = total > 0 ? (online / total) * 100 : 0;
    this.rentasResumen.porcentajePresencial = total > 0 ? (presencial / total) * 100 : 0;
  }

  extraerAniosYMeseUnicos() {
    const fechas = this.rentasOriginal.map((r) => new Date(r.fecha));
    this.aniosUnicos = Array.from(new Set(fechas.map((f) => f.getFullYear()))).sort();
    this.mesesUnicos = Array.from(
      new Set(
        fechas.map((f) =>
          f.toLocaleDateString('es-MX', { month: 'long' }).toLowerCase()
        )
      )
    );
  }

  filtrarRentas() {
    this.rentas = this.rentasOriginal.filter((r) => {
      const fecha = new Date(r.fecha);
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
    console.log('Generando PDF de rentas...');
  }
}
