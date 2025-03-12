import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.view.html',
  styleUrls: ['./dashboard.view.scss']
})
export class DashboardView {
  barChartData: any;
  radarChartData: any;

  constructor() {
    this.loadBarChart();
    this.loadRadarChart();
  }

  loadBarChart() {
    this.barChartData = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
      datasets: [
        {
          label: 'Ventas en USD',
          data: [10000, 15000, 12000, 18000, 20000, 22000],
          backgroundColor: '#007bff'
        }
      ]
    };
  }

  loadRadarChart() {
    this.radarChartData = {
      labels: [
        'Buenavista - Huejutla', 
        'Altamira - Tampico', 
        'Chapultepec - Poza Rica', 
        'Centro - Pachuca', 
        'La Escondida - Tulancingo'
      ],
      datasets: [
        {
          label: 'Clientes Frecuentes',
          data: [120, 90, 80, 70, 60], // Frecuencia de compras en cada localidad
          backgroundColor: 'rgba(0, 123, 255, 0.4)',
          borderColor: '#007bff',
          pointBackgroundColor: '#007bff'
        }
      ]
    };
  }
  descargarReporte(){}
}
