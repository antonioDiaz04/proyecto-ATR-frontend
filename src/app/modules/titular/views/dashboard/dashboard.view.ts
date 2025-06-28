import { Component, OnInit } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { MessageService } from 'primeng/api';
import { PropietarioService } from '../../../../shared/services/propietario.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.view.html',
})
export class DashboardView implements OnInit {
  totalCompras = 0;
  totalRentas = 0;
  totalVentas = 0;
  totalClientes = 0;

  productosMasVendidosData: any;
  radarChartData: any;
  barChartData: any;
  comprasRentasData: any;

  vestidosMasVendidos: {
    nombre: string;
    tipo: string;
    color: string;
    talla: string;
    cantidad: number;
  }[] = [];

  chartOptionsMinimal: any = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 0,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#000',
        bodyColor: '#333',
        titleFont: {
          size: 10,
        },
        bodyFont: {
          size: 10,
        },
        padding: 6,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#999',
          font: {
            size: 10,
          },
          padding: 2,
        },
      },
      y: {
        grid: {
          color: 'rgba(0,0,0,0.03)',
        },
        ticks: {
          color: '#999',
          font: {
            size: 10,
          },
          padding: 2,
        },
      },
    },
  };

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin],
    events: [
      { title: 'Renta - Ana', date: '2024-06-05' },
      { title: 'Venta - Gala Azul', date: '2024-06-10' },
    ],
  };

  //Controlador del flujo de carga
  private totalConsultas = 5;
  private consultasCompletadas = 0;

  constructor(
    private propietarioService: PropietarioService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.cargarResumenVentas();
    this.cargarResumenRentas();
    this.cargarClientesUnicos();
    this.cargarProductosMasVendidos();
    this.cargarDatosGraficas();
    this.verificarCargaCompleta();
  }

  cargarResumenVentas() {
    this.propietarioService.getResumenVentas().subscribe((res: any) => {
      console.log(res);
      this.totalVentas = res.totalVentas;
      this.totalCompras = res.totalVentas; // Ajusta si hay una diferencia lógica
      this.loadComprasRentasData();
      this.verificarCargaCompleta();
    });
  }

  cargarResumenRentas() {
    this.propietarioService.getResumenRentas().subscribe((res: any) => {
      console.log(res);
      this.totalRentas = res.totalRentas;
      this.loadComprasRentasData();
      this.verificarCargaCompleta();
    });
  }

  cargarClientesUnicos() {
    this.propietarioService.getClientesUnicos().subscribe((res: any) => {
      console.log(res);
      this.totalClientes = res.totalClientes;
      this.verificarCargaCompleta();
    });
  }

  cargarProductosMasVendidos() {
    this.propietarioService.getProductosMasVendidos().subscribe((res: any) => {
      console.log(res);
      this.vestidosMasVendidos = res.productosMasVendidos || [];
      this.loadProductosMasVendidosChart();
      this.verificarCargaCompleta();
    });
  }

  cargarDatosGraficas() {
    this.propietarioService.getDatosGraficas().subscribe((res: any) => {
      this.barChartData = {
        labels: [
          'Ene',
          'Feb',
          'Mar',
          'Abr',
          'May',
          'Jun',
          'Jul',
          'Ago',
          'Sep',
          'Oct',
          'Nov',
          'Dic',
        ],
        datasets: [
          {
            label: 'Ventas',
            data: res.ventasMensuales,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
          {
            label: 'Rentas',
            data: res.rentasMensuales,
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            borderColor: 'rgba(255, 206, 86, 1)',
            borderWidth: 1,
          },
        ],
      };

      this.radarChartData = {
        labels: res.ventasRentasRadar.labels,
        datasets: [
          {
            label: 'Rentas',
            data: res.ventasRentasRadar.rentas,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
          {
            label: 'Ventas',
            data: res.ventasRentasRadar.ventas,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          },
        ],
      };
      this.verificarCargaCompleta();
    });
  }

  loadComprasRentasData() {
    const total = this.totalCompras + this.totalRentas;
    if (total === 0) return;

    this.comprasRentasData = {
      labels: ['Compras', 'Rentas'],
      datasets: [
        {
          data: [
            (this.totalCompras / total) * 100,
            (this.totalRentas / total) * 100,
          ],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 99, 132, 0.6)',
          ],
          hoverBackgroundColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
          ],
        },
      ],
    };
  }

  loadProductosMasVendidosChart() {
    if (!Array.isArray(this.vestidosMasVendidos)) {
      this.vestidosMasVendidos = [];
    }

    this.productosMasVendidosData = {
      labels: this.vestidosMasVendidos.map(
        (v) => `${v.nombre || v.tipo} - ${v.color}`
      ),
      datasets: [
        {
          label: 'Cantidad Vendida',
          data: this.vestidosMasVendidos.map((v) => v.cantidad),
          backgroundColor: this.vestidosMasVendidos.map((_, i) =>
            this.getColor(i)
          ),
          borderColor: 'rgba(255, 255, 255, 1)',
          borderWidth: 2,
        },
      ],
    };
  }

  getColor(index: number): string {
    const colors = [
      'rgba(18, 150, 238, 0.74)',
      'rgba(238, 255, 86, 0.76)',
      'rgba(241, 12, 62, 0.8)',
      'rgba(255, 140, 0, 0.8)',
      'rgba(0, 200, 83, 0.8)',
    ];
    return colors[index % colors.length];
  }

  descargarReporte() {
    // Lógica para exportar PDF o CSV si aplica
  }

  private verificarCargaCompleta() {
    this.consultasCompletadas++;
    if (this.consultasCompletadas === this.totalConsultas) {
      this.messageService.add({
        severity: 'success',
        summary: 'Dashboard listo',
        detail: 'Los datos se cargaron correctamente.',
      });
    }
  }
}
