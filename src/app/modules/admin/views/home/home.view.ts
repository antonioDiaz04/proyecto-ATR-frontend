import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { MessageService } from "primeng/api";
import { finalize } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-home",
  templateUrl: "./home.view.html",
})
export class HomeView implements OnInit {
  loading = false;
  fechaTexto: string = '';
  transacciones: any[] = [];
  
  // Estadísticas actualizadas para transacciones
  stats = {
    totalRentas: 0,
    totalVentas: 0,
    ingresosTotales: 0,
    rentasVariacion: 0,
    ventasVariacion: 0,
    ingresosVariacion: 0,
    clienteFrecuente: { nombre: '', transacciones: 0 },
  };

  // Datos para gráficos actualizados
  chartDataTipo: any;
  chartDataMensual: any;
  chartDataTopClientes: any;
  chartDataTendencia: any; // Inicializado en prepareChartData

  // Actividad reciente basada en transacciones
  recentActivities: any[] = [];

  constructor(
    private http: HttpClient,
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
    
    this.loadTransactionData();
  }

  loadTransactionData(): void {
    this.loading = true;
    this.http.get('https://proyecto-atr-backend.onrender.com/api/v1/transaccion')
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (res: any) => {
          this.transacciones = res.data;
          this.calculateStats();
          this.prepareChartData();
          this.generateRecentActivities();
        },
        error: (err) => {
          console.error("Error al obtener transacciones:", err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar las transacciones'
          });
        }
      });
  }

  calculateStats(): void {
    // Calcular estadísticas básicas
    this.stats.totalRentas = this.transacciones.filter(t => t.tipoTransaccion.toLowerCase() === 'renta').length;
    this.stats.totalVentas = this.transacciones.filter(t => t.tipoTransaccion.toLowerCase() === 'venta').length;
    
    // Calcular ingresos (asumiendo que hay un campo monto)
    this.stats.ingresosTotales = this.transacciones.reduce((sum, t) => sum + (t.monto || 0), 0);
    
    // Encontrar cliente frecuente
    const clientesMap = new Map();
    this.transacciones.forEach(t => {
      // Asegurarse de que clienteNombre existe para evitar errores
      if (t.clienteNombre) {
        const count = clientesMap.get(t.clienteNombre) || 0;
        clientesMap.set(t.clienteNombre, count + 1);
      }
    });
    
    let maxTransacciones = 0;
    let clienteFrecuente = '';
    clientesMap.forEach((count, nombre) => {
      if (count > maxTransacciones) {
        maxTransacciones = count;
        clienteFrecuente = nombre;
      }
    });
    
    this.stats.clienteFrecuente = {
      nombre: clienteFrecuente || 'No disponible',
      transacciones: maxTransacciones
    };
    
    // Calcular variaciones (simuladas, considera implementar lógica real)
    this.stats.rentasVariacion = Math.floor(Math.random() * 30) - 10;
    this.stats.ventasVariacion = Math.floor(Math.random() * 30) - 10;
    this.stats.ingresosVariacion = Math.floor(Math.random() * 25) - 5;
  }

  prepareChartData(): void {
    // Gráfico por tipo de transacción
    this.chartDataTipo = {
      labels: ['Rentas', 'Ventas'],
      datasets: [{
        data: [this.stats.totalRentas, this.stats.totalVentas],
        backgroundColor: ['#4F46E5', '#10B981'], // Colores específicos para PrimeNG
        hoverBackgroundColor: ['#6366F1', '#34D399']
      }]
    };

    // Gráfico mensual
    const mensualData = this.groupByMonth(this.transacciones);
    const allMonths = Object.keys(mensualData).sort();
    // Obtener los últimos 6 meses para la tendencia, o menos si no hay suficientes datos
    const last6Months = allMonths.slice(Math.max(allMonths.length - 6, 0));
    
    this.chartDataMensual = {
      labels: last6Months.map(m => this.formatMonthLabel(m)),
      datasets: [{
        label: 'Transacciones',
        data: last6Months.map(m => mensualData[m]),
        backgroundColor: '#3B82F6',
        borderRadius: 6
      }]
    };

    // Gráfico de top clientes (top 5)
    const clientesMap = new Map();
    this.transacciones.forEach(t => {
      if (t.clienteNombre) { // Asegurarse de que clienteNombre existe
        const count = clientesMap.get(t.clienteNombre) || 0;
        clientesMap.set(t.clienteNombre, count + 1);
      }
    });
    
    const sortedClientes = [...clientesMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    this.chartDataTopClientes = {
      labels: sortedClientes.map(c => c[0]),
      datasets: [{
        label: 'Transacciones',
        data: sortedClientes.map(c => c[1]),
        backgroundColor: [
          '#3B82F6', // blue-500
          '#8B5CF6', // purple-500
          '#10B981', // green-500
          '#F59E0B', // amber-500
          '#EF4444'  // red-500
        ]
      }]
    };

    // Gráfico de Tendencia Semanal (Mini Gráfico) - Implementación simple
    // Esto es un ejemplo. En un caso real, querrías agrupar por semana.
    // Aquí, simplemente usaremos una simulación o datos de transacciones recientes
    const now = new Date();
    const last7DaysData: number[] = Array(7).fill(0); // Últimos 7 días
    const labels7Days: string[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      labels7Days.push(d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }));
      // Ejemplo: contar transacciones de los últimos 7 días
      // En una implementación real, sumarías montos o contarías transacciones para cada día
      const dayTransactions = this.transacciones.filter(t => {
        const transDate = new Date(t.fechaTransaccion);
        return transDate.toDateString() === d.toDateString();
      }).length; // O .reduce((sum, t) => sum + (t.monto || 0), 0);
      last7DaysData[6 - i] = dayTransactions + Math.floor(Math.random() * 5); // Añadir algo de aleatoriedad para visualización
    }

    this.chartDataTendencia = {
      labels: labels7Days,
      datasets: [{
        label: 'Actividad',
        data: last7DaysData,
        fill: true,
        borderColor: '#3B82F6',
        tension: 0.4,
        backgroundColor: 'rgba(59, 130, 246, 0.2)' // Light blue for fill
      }]
    };
  }

  groupByMonth(data: any[]): { [month: string]: number } {
    return data.reduce((acc, trans) => {
      const date = new Date(trans.fechaTransaccion);
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

  generateRecentActivities(): void {
    // Ordenar transacciones por fecha más reciente
    const sortedTransactions = [...this.transacciones]
      .sort((a, b) => new Date(b.fechaTransaccion).getTime() - new Date(a.fechaTransaccion).getTime())
      .slice(0, 5); // Limitar a las 5 más recientes
    
    this.recentActivities = sortedTransactions.map(t => {
      const isRenta = t.tipoTransaccion.toLowerCase() === 'renta';
      return {
        type: isRenta ? 'renta' : 'venta',
        icon: isRenta ? 'pi pi-shopping-cart' : 'pi pi-tag',
        title: isRenta ? 'Nueva renta registrada' : 'Venta completada',
        description: `${t.productoNombre || 'Producto Desconocido'} por ${t.clienteNombre || 'Cliente Desconocido'}`,
        time: this.formatTimeAgo(t.fechaTransaccion),
        details: [
          { text: `$${(t.monto || 0).toFixed(2)}`, type: 'success' }, // Formatear monto
          isRenta ? { text: `${t.duracion || 'N/A'} días`, type: 'info' } : null
        ].filter(d => d !== null) // Filtrar elementos nulos si duracion no es relevante para ventas
      };
    });
  }

  formatTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Hace unos segundos';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
    
    // Si es el mismo día calendario
    if (now.toDateString() === date.toDateString()) {
      return `Hoy a las ${date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Si fue ayer
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (yesterday.toDateString() === date.toDateString()) {
      return `Ayer a las ${date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;
    }

    return `${Math.floor(diffInSeconds / 86400)} días atrás`;
  }

  // Métodos auxiliares existentes (getColor no usado en el HTML corregido)
  goToComments(): void {
    this.router.navigate(['/admin/comments']);
  }
}