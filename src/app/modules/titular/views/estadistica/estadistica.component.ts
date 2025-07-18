import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-estadistica',
  templateUrl: './estadistica.component.html',
})
export class EstadisticaComponent implements OnInit {
  metricas: any = {};
  graficoLineas: any;
  graficoBarras: any;
  graficoPie: any;
  detalleTabla: any[] = [];

  ngOnInit(): void {
    this.initMetricas();
    this.initGraficos();
    this.initTabla();
  }

  initMetricas() {
    this.metricas = {
      totalFebrero: 182,
      proyeccionMarzo: 275,
      categoriaLider: 'Coctel',
      totalCategoria: 96,
      incrementoPromedio: 12.5,
    };
  }

  initGraficos() {
    this.graficoLineas = {
      labels: ['16-31 Dic', '1-15 Ene', '16-31 Ene', '1-15 Feb', '16-28 Feb'],
      datasets: [
        {
          label: 'Gala',
          data: [13, 21, 32, 45, 59],
          borderColor: '#FF6384',
          backgroundColor: 'rgba(255,99,132,0.2)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Noche',
          data: [12, 20, 31, 44, 58],
          borderColor: '#36A2EB',
          backgroundColor: 'rgba(54,162,235,0.2)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Coctel',
          data: [17, 26, 38, 51, 65],
          borderColor: '#FFCE56',
          backgroundColor: 'rgba(255,206,86,0.2)',
          tension: 0.4,
          fill: true,
        },
      ],
    };

    this.graficoBarras = {
      labels: ['Gala', 'Noche', 'Coctel'],
      datasets: [
        {
          label: 'Febrero',
          data: [59, 58, 65],
          backgroundColor: '#36A2EB',
        },
        {
          label: 'Marzo (Proyección)',
          data: [90, 89, 96],
          backgroundColor: '#4bc0c0',
        },
      ],
    };

    this.graficoPie = {
      labels: ['Gala (90)', 'Noche (89)', 'Coctel (96)'],
      datasets: [
        {
          data: [90, 89, 96],
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        },
      ],
    };
  }

  initTabla() {
    this.detalleTabla = [
      {
        periodo: '1/feb - 15/feb',
        gala: 32,
        noche: 31,
        coctel: 38,
        total: 101,
        incremento: '(+3%, +2%, +5%)',
      },
      {
        periodo: '16/feb - 28/feb',
        gala: 45,
        noche: 44,
        coctel: 51,
        total: 140,
        incremento: '(+41%, +42%, +34%)',
      },
      {
        periodo: '1/mar - 15/mar',
        gala: 59,
        noche: 58,
        coctel: 65,
        total: 182,
        incremento: '(+31%, +32%, +27%)',
      },
    ];
  }
}
