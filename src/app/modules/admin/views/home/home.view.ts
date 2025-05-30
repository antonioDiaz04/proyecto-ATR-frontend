import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { VentayrentaService } from "../../../../shared/services/ventayrenta.service";
import { MessageService } from "primeng/api";
import { finalize } from "rxjs/operators";

@Component({
  selector: "app-home",
  templateUrl: "./home.view.html",
  styleUrls: ["./home.view.scss"],
})
export class HomeView implements OnInit {
  // Propiedades para los datos
  loading = false;
  fechaTexto: string = '';
  commentCount = 0;
  usuariosActivos = 0;
  
  // Datos de rentas
  rentas: any[] = [];
  rentasRecientes: any[] = [];
  topVestidos: any[] = [];
  
  // Estadísticas
  stats = {
    totalRentas: 0,
    totalVentas: 0,
    totalUsuarios: 0,
    ingresosTotales: 0,
    rentasVariacion: 0,
    ventasVariacion: 0,
    usuariosVariacion: 0,
    ingresosVariacion: 0,
    productoMasRentado: { productoNombre: '', count: 0 },
    usuarioMasActivo: { usuarioNombre: '', count: 0 },
    fechaMayorRenta: ''
  };

  // Datos para gráficos
  chartData: any;
  chartDataFecha: any;
  chartDataAnual: any;
  chartDataMensual: any;
  chartDataSemanal: any;
  chartDataDistribucion: any;
  tendenciaSemanal: number[] = [];
  variacionSemanal = 0;

  // Actividad reciente
  recentActivities = [
    {
      type: 'renta',
      icon: 'pi pi-shopping-cart',
      title: 'Nueva renta registrada',
      description: 'Vestido de gala por María González',
      time: 'Hace 15 minutos',
      details: [
        { text: '$450', type: 'success' },
        { text: '3 días', type: 'info' }
      ]
    },
    {
      type: 'venta',
      icon: 'pi pi-tag',
      title: 'Venta completada',
      description: 'Traje de noche vendido a Laura Martínez',
      time: 'Hace 2 horas',
      details: [
        { text: '$1200', type: 'success' }
      ]
    },
    {
      type: 'registro',
      icon: 'pi pi-user-plus',
      title: 'Nuevo usuario registrado',
      description: 'Carlos Sánchez se ha registrado',
      time: 'Hace 5 horas',
      details: [
        { text: 'Cliente', type: 'info' }
      ]
    }
  ];

  constructor(
    private ventaYrentaS_: VentayrentaService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.fechaTexto = new Date().toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    this.loadData();
    this.loadPendingComments();
  }

  loadData(): void {
    this.loading = true;
    this.ventaYrentaS_.obtenerRentas()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (res) => {
          this.rentas = res.rentas;
          this.stats = res.stats;
          this.rentasRecientes = res.rentasRecientes;
          this.topVestidos = res.topVestidos;
          this.usuariosActivos = res.usuariosActivos;
          
          this.prepareChartData();
          this.computeWeeklyTrend();
        },
        error: (err) => {
          console.error("Error al obtener datos:", err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los datos del dashboard'
          });
        }
      });
  }

  prepareChartData(): void {
    // Gráfico de distribución por categoría
    const categorias = [...new Set(this.rentas.map(r => r.categoriaNombre))];
    this.chartDataDistribucion = {
      labels: categorias,
      datasets: [{
        data: categorias.map(cat => 
          this.rentas.filter(r => r.categoriaNombre === cat).length
        ),
        backgroundColor: categorias.map((_, i) => this.getColor(i))
      }]
    };

    // Gráfico anual
    const anualData = this.groupByYear(this.rentas);
    this.chartDataAnual = {
      labels: Object.keys(anualData),
      datasets: [{
        label: 'Rentas por Año',
        data: Object.values(anualData),
        fill: false,
        borderColor: '#3B82F6',
        tension: 0.4
      }]
    };

    // Gráfico mensual (últimos 6 meses)
    const mensualData = this.groupByMonth(this.rentas);
    const last6Months = Object.keys(mensualData).sort().slice(-6);
    this.chartDataMensual = {
      labels: last6Months.map(m => this.formatMonthLabel(m)),
      datasets: [{
        label: 'Rentas',
        data: last6Months.map(m => mensualData[m]),
        backgroundColor: '#3B82F6',
        borderRadius: 6
      }]
    };
  }

  computeWeeklyTrend(): void {
    // Simular datos semanales para la tendencia
    const baseValue = Math.floor(Math.random() * 50) + 30;
    this.tendenciaSemanal = [
      baseValue,
      baseValue + Math.floor(Math.random() * 10) - 3,
      baseValue + Math.floor(Math.random() * 15) - 5,
      baseValue + Math.floor(Math.random() * 20) - 7,
      baseValue + Math.floor(Math.random() * 25) - 10,
      baseValue + Math.floor(Math.random() * 30) - 12,
      baseValue + Math.floor(Math.random() * 35) - 15
    ];
    
    this.variacionSemanal = Math.round(
      ((this.tendenciaSemanal[6] - this.tendenciaSemanal[0]) / this.tendenciaSemanal[0]) * 100
    );

    this.chartDataSemanal = {
      labels: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
      datasets: [{
        label: 'Rentas',
        data: this.tendenciaSemanal,
        fill: true,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }]
    };
  }

  groupByYear(data: any[]): { [year: string]: number } {
    return data.reduce((acc, renta) => {
      const year = new Date(renta.detallesRenta.fechaInicio).getFullYear();
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {});
  }

  groupByMonth(data: any[]): { [month: string]: number } {
    return data.reduce((acc, renta) => {
      const date = new Date(renta.detallesRenta.fechaInicio);
      const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});
  }

  formatMonthLabel(monthStr: string): string {
    const [year, month] = monthStr.split('-');
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  }

  loadPendingComments(): void {
    // this.commentsService.getPendingCount().subscribe(
    //   count => this.commentCount = count,
    //   err => console.error("Error al obtener comentarios:", err)
    // );
  }

  getColor(index: number): string {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EC4899'];
    return colors[index % colors.length];
  }

  getHoverColor(index: number): string {
    const colors = ['#60A5FA', '#34D399', '#FBBF24', '#818CF8', '#F472B6'];
    return colors[index % colors.length];
  }

  goToComments(): void {
    this.router.navigate(['/admin/comments']);
  }
}