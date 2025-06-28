import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.view.html',
})
export class DashboardView {
  barChartData: any;
  radarChartData: any;
  productosMasVendidosData: any;
  selectedMonth!: number;
  selectedYear!: number;
  totalCompras: number = 0;
  totalRentas: number = 0;
  comprasRentasData: any;
  vestidosRentados: { tipo: string; color: string; talla: string; cantidad: number; }[] = [];

  months: { name: string; value: number }[] = [
    { name: 'Enero', value: 1 },
    { name: 'Febrero', value: 2 },
    { name: 'Marzo', value: 3 },
    { name: 'Abril', value: 4 },
    { name: 'Mayo', value: 5 },
    { name: 'Junio', value: 6 },
    { name: 'Julio', value: 7 },
    { name: 'Agosto', value: 8 },
    { name: 'Septiembre', value: 9 },
    { name: 'Octubre', value: 10 },
    { name: 'Noviembre', value: 11 },
    { name: 'Diciembre', value: 12 }
  ];
  years: number[] = [2023, 2024];
  totalVentas: number = 120000;
  totalClientes: number = 340;
  vestidosMasVendidos: any[] = [
    { tipo: 'Vestido de Corazón', color: 'Rojo', talla: 'M', cantidad: 50 },
    { tipo: 'Vestido de Corazón', color: 'Azul', talla: 'L', cantidad: 30 },
    { tipo: 'Vestido Largo', color: 'Negro', talla: 'S', cantidad: 20 },
    { tipo: 'Vestido Corto', color: 'Verde', talla: 'M', cantidad: 25 },
    { tipo: 'Vestido de Gala', color: 'Dorado', talla: 'XL', cantidad: 15 }
  ];

  constructor() {
    this.totalCompras = 100; // Ejemplo de valor
    this.totalRentas = 50;   // Ejemplo de valor
    this.loadBarChartData();
    this.loadRadarChart();
    this.loadProductosMasVendidosChart();
    this.loadComprasRentasData(); // Prepara los datos para la gráfica
  }

  loadBarChartData() {
    this.barChartData = {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      datasets: [
        {
          label: 'Ventas',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          data: [65, 59, 80, 81, 56, 55, 40, 48, 59, 62, 75, 80]
        },
        {
          label: 'Rentas',
          backgroundColor: 'rgba(255, 206, 86, 0.2)',
          borderColor: 'rgba(255, 206, 86, 1)',
          borderWidth: 1,
          data: [28, 48, 40, 19, 86, 27, 90, 100, 45, 67, 88, 60]
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
          data: [120, 90, 80, 70, 60],
          backgroundColor: 'rgba(0, 123, 255, 0.4)',
          borderColor: '#007bff',
          pointBackgroundColor: '#007bff'
        }
      ]
    };
  }
  loadComprasRentasData() {
    const totalTransacciones = this.totalCompras + this.totalRentas;
    this.comprasRentasData = {
      labels: ['Compras', 'Rentas'],
      datasets: [
        {
          data: [
            (this.totalCompras / totalTransacciones) * 100,
            (this.totalRentas / totalTransacciones) * 100
          ],
          backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
          hoverBackgroundColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)']
        }
      ]
    };
  }
  

  loadProductosMasVendidosChart() {
    this.productosMasVendidosData = {
      labels: this.vestidosMasVendidos.map(v => `${v.tipo} - ${v.color}`),
      datasets: [
        {
          label: 'Cantidad Vendida',
          data: this.vestidosMasVendidos.map(v => v.cantidad),
          backgroundColor: this.vestidosMasVendidos.map((v, i) => this.getColor(i)),
          borderColor: 'rgba(255, 255, 255, 1)',
          borderWidth: 2
        }
      ]
    };
  }
  radarChartDataVentaRenta = {
    labels: ["Jaltocán", "Atlapexco", "Buena Vista", "Huejutla", "Pachuca"],
    datasets: [
      {
        label: "Rentas",
        data: [50, 40, 30, 20, 10],
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
      {
        label: "Ventas",
        data: [40, 50, 60, 70, 80],
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };
  getColor(index: number) {
    const colors = [
      'rgba(18, 150, 238, 0.74)', // Azul
      'rgba(238, 255, 86, 0.76)', // Amarillo
      'rgba(241, 12, 62, 0.8)'  // Rosa
    ];
    return colors[index % colors.length];
  }
  
  filtrarDatos() {
    // Lógica para filtrar datos según selectedMonth y selectedYear
    // Actualiza totalVentas, totalClientes y vestidosMasVendidos
  }

  descargarReporte() {}
}
