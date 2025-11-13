import { Component, type AfterViewInit, type OnInit } from '@angular/core';
import Calendar from '@toast-ui/calendar';
import { MessageService } from 'primeng/api';
import { ChangeDetectorRef } from '@angular/core';
import { PropietarioService } from '../../../../shared/services/propietario.service';

interface Transaccion {
  id?: string;
  cliente: string;
  tipo: 'Renta' | 'Venta';
  vestido: string;
  monto: number;
  estado: 'Pagado' | 'Pendiente' | 'Cancelado';
  fecha: string;
  fotoDePerfil?: string;
}

interface DatosGrafica {
  mes: string;
  renta: number;
  venta: number;
}

type OrdenCampo = 'cliente' | 'tipo' | 'vestido' | 'monto' | 'estado' | 'fecha';
type OrdenDireccion = 'asc' | 'desc';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.view.html',
  styleUrl: './dashboard.view.scss',
})
export class DashboardView implements OnInit, AfterViewInit {
  // Totales
  totalRentaVentas = 0;
  totalVentas = 0;
  totalRentas = 0;
  totalClientes = 0;

  //del periodo anterior
  montoTotalAnterior = 0;
  totalRentasAnterior = 0;
  totalVentasAnterior = 0;
  totalClientesAnterior = 0;

  //clesimiento de lasventas y rentas
  crecimientoRentaVentas = 0;
  crecimientoRentas = 0;
  crecimientoVentas = 0;
  crecimientoClientes = 0;

  //
  cardFlipped = {
    ingresos: false,
    rentas: false,
    ventas: false,
    clientes: false,
  };

  // Fechas y filtros
  fechaInicio!: Date;
  fechaFin!: Date;
  filtroActivo: 'quincena' | 'semana' | 'mes' | 'anio' = 'mes';
  filtroSeleccionado = 'mes';

  // Datos de gráfica personalizada
  datosGrafica: DatosGrafica[] = [];
  maxValorGrafica = 0;

  // Calendario
  calendar!: Calendar;
  calendarDateDisplay: string = '';
  mesAnioActual: string = '';

  // Transacciones
  transacciones: Transaccion[] = [];
  transaccionesFiltradas: Transaccion[] = [];
  transaccionesPaginadas: Transaccion[] = [];

  // Paginación
  tamanoPagina = 5;
  paginaActual = 1;
  mostrarTodas = false;

  // Ordenamiento y búsqueda
  campoOrden: OrdenCampo = 'fecha';
  direccionOrden: OrdenDireccion = 'desc';
  terminoBusqueda = '';

  // Control de carga
  private totalConsultas = 5;
  private consultasCompletadas = 0;

  constructor(
    private propietarioService: PropietarioService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.filtrarPor('mes');
  }

  ngAfterViewInit(): void {
    this.inicializarCalendario();
    this.observarCambioDeModo();
  }

  toggleCard(card: keyof typeof this.cardFlipped) {
    this.cardFlipped[card] = !this.cardFlipped[card];
  }

  private calcularCrecimiento(actual: number, anterior?: number): number {
    if (!anterior || isNaN(anterior)) return 0;
    return Math.round(((actual - anterior) / anterior) * 100);
  }

  private inicializarCalendario(): void {
    const isDarkMode = document.documentElement.classList.contains('dark');

    this.calendar = new Calendar('#tui-calendar-container', {
      defaultView: 'month',
      scheduleView: ['allday'],
      taskView: false,
      useDetailPopup: true,
      useFormPopup: false,
      isReadOnly: true,
      month: {
        startDayOfWeek: 1,
        daynames: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
      },
      template: {
        monthDayname: (dayname: any) =>
          `<span class="tui-full-calendar-dayname">${dayname.label}</span>`,
      },
      theme: isDarkMode
        ? {
            common: {
              backgroundColor: '#141516', // fondoOscuro
              border: '1px solid #374151', // bordeOscuro
            },
            month: {
              dayName: { color: '#F9FAFB' }, // textoClaro
              holidayExceptThisMonth: { color: '#6b7280' }, // texto tenue
              dayExceptThisMonth: { color: '#6b7280' },
              weekend: { backgroundColor: '#1E1E1E' }, // fondoTarjeta
              moreView: {
                backgroundColor: '#2A2A2A',
                color: '#F9FAFB', // mejorar contraste del texto "1 more"
              },
              gridCell: {
                backgroundColor: '#141516',
                border: '1px solid #374151', // mantener cuadrícula discreta
              },
              today: {
                border: '1px solid #818CF8', // acentoHover
                color: '#F9FAFB',
              },
            },
            week: {
              dayName: {
                backgroundColor: '#1E1E1E',
                color: '#F9FAFB',
              },
              timeGrid: {
                backgroundColor: '#141516',
              },
              timeGridLeft: {
                backgroundColor: '#1E1E1E',
                borderRight: '1px solid #374151',
                color: '#F9FAFB',
              },
            },
          }
        : {
            common: {
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
            },
            month: {
              dayName: { color: '#64748b' },
              holidayExceptThisMonth: { color: '#cbd5e1' },
              dayExceptThisMonth: { color: '#cbd5e1' },
              weekend: { backgroundColor: '#f8fafc' },
            },
          },
    });

    this.actualizarMesAnio();
  }

  updateCalendarDateDisplay() {
    const date = this.calendar.getDate();
    this.calendarDateDisplay = date.format('MMMM YYYY'); // requiere moment.js o dayjs
  }

  private generarColorUnico(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash % 360);
    return `hsl(${h}, 70%, 70%)`;
  }

  calendarPrev() {
    this.calendar.prev();
    this.updateCalendarDateDisplay();
  }
  calendarNext() {
    this.calendar.next();
    this.updateCalendarDateDisplay();
  }

  calendarToday() {
    this.calendar.today();
    this.updateCalendarDateDisplay();
  }
  actualizarMesAnio() {
    const fecha = this.calendar.getDate(); // retorna un moment.js o similar
    const meses = [
      'enero',
      'febrero',
      'marzo',
      'abril',
      'mayo',
      'junio',
      'julio',
      'agosto',
      'septiembre',
      'octubre',
      'noviembre',
      'diciembre',
    ];
    const mes = meses[fecha.getMonth()];
    const anio = fecha.getFullYear();
    this.mesAnioActual = `${mes} ${anio}`;
    this.cdr.detectChanges();
  }

  filtrarPor(tipo: 'quincena' | 'semana' | 'mes' | 'anio'): void {
    this.filtroActivo = tipo;
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (tipo) {
      case 'quincena': {
        const dia = now.getDate();
        start = new Date(now.getFullYear(), now.getMonth(), dia <= 15 ? 1 : 16);
        end = new Date(
          now.getFullYear(),
          now.getMonth(),
          dia <= 15 ? 15 : this.getUltimoDiaMes(now)
        );
        break;
      }
      case 'semana': {
        const diaSemana = now.getDay();
        start = new Date(now);
        start.setDate(now.getDate() - diaSemana);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        break;
      }
      case 'mes':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(
          now.getFullYear(),
          now.getMonth(),
          this.getUltimoDiaMes(now)
        );
        break;
      case 'anio':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        break;
    }

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    this.propietarioService
      .getTotalesRentaVentaPorRango(startStr, endStr)
      .subscribe({
        next: (data) => {
          console.log(data);
          this.totalRentaVentas = data.montoTotalVentas + data.montoTotalRentas;
          this.montoTotalAnterior =
            data.montoTotalVentasAnterior + data.montoTotalRentasAnterior || 0;
          this.totalRentasAnterior = data.montoTotalRentasAnterior || 0;
          this.totalVentasAnterior = data.montoTotalVentasAnterior || 0;
          this.totalClientesAnterior = data.totalClientesAnterior || 0;
          this.totalVentas = data.totalVentas;
          this.totalRentas = data.totalRentas;

          this.totalClientes = data.totalClientes;
          this.fechaInicio = start;
          this.fechaFin = end;

          // Procesar datos para la gráfica personalizada
          this.procesarDatosParaGrafica(data.barChartData);

          if (this.calendar) {
            this.calendar.clear();

            const eventos = data.calendarOptions?.events ?? [];

            const eventosTipados: any[] = eventos;

            const idsUnicos: string[] = [
              ...new Set(eventosTipados.map((e) => e.calendarId as string)),
            ];

            // Asignar un color único a cada calendarId
            const calendariosUnicos = idsUnicos.map((id) => {
              const color = this.generarColorUnico(id);
              return {
                id,
                name: `Renta ${id}`,
                backgroundColor: color,
                borderColor: color,
                dragBackgroundColor: color,
              };
            });

            this.calendar.setCalendars(calendariosUnicos);
            this.calendar.createEvents(eventosTipados);
          }

          this.crecimientoRentaVentas = this.calcularCrecimiento(
            data.montoTotalVentas + data.montoTotalRentas,
            data.montoTotalAnterior
          );
          this.crecimientoRentas = this.calcularCrecimiento(
            data.totalRentas,
            data.totalRentasAnterior
          );
          this.crecimientoVentas = this.calcularCrecimiento(
            data.totalVentas,
            data.totalVentasAnterior
          );
          this.crecimientoClientes = this.calcularCrecimiento(
            data.totalClientes,
            data.totalClientesAnterior
          );

          this.transacciones = data.transacciones || [];
          this.aplicarFiltrosYOrdenamiento();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los datos del dashboard.',
          });
        },
      });
  }

  private procesarDatosParaGrafica(barChartData: any): void {
    if (!barChartData || !barChartData.labels || !barChartData.datasets) {
      this.datosGrafica = [];
      this.maxValorGrafica = 0;
      return;
    }

    const labels = barChartData.labels;
    const rentaDataset = barChartData.datasets.find((ds: any) => ds.label.toLowerCase().includes('renta'));
    const ventaDataset = barChartData.datasets.find((ds: any) => ds.label.toLowerCase().includes('venta'));

    this.datosGrafica = labels.map((label: string, index: number) => {
      const renta = rentaDataset?.data?.[index] || 0;
      const venta = ventaDataset?.data?.[index] || 0;
      
      return {
        mes: label,
        renta: renta,
        venta: venta
      };
    });

    // Calcular el valor máximo para la escala
    this.maxValorGrafica = Math.max(
      ...this.datosGrafica.flatMap(item => [item.renta, item.venta]),
      1 // Mínimo 1 para evitar división por cero
    );
  }

  getBarHeight(valor: number): string {
    if (this.maxValorGrafica === 0) return '5%';
    const percentage = (valor / this.maxValorGrafica) * 100;
    return `${Math.max(percentage, 5)}%`; // Mínimo 5% para que sea visible
  }

  get hayDatosEnGrafica(): boolean {
    return this.datosGrafica.length > 0 && this.datosGrafica.some(item => item.renta > 0 || item.venta > 0);
  }

  ordenarPor(campo: OrdenCampo): void {
    if (this.campoOrden === campo) {
      this.direccionOrden = this.direccionOrden === 'asc' ? 'desc' : 'asc';
    } else {
      this.campoOrden = campo;
      this.direccionOrden = 'asc';
    }
    this.aplicarFiltrosYOrdenamiento();
  }

  private ordenarTransacciones(transacciones: Transaccion[]): Transaccion[] {
    return [...transacciones].sort((a, b) => {
      let valorA: any = a[this.campoOrden];
      let valorB: any = b[this.campoOrden];

      if (typeof valorA === 'string') {
        valorA = valorA.toLowerCase();
        valorB = valorB.toLowerCase();
      }

      if (this.campoOrden === 'fecha') {
        valorA = new Date(a.fecha).getTime();
        valorB = new Date(b.fecha).getTime();
      }

      let resultado = 0;
      if (valorA < valorB) resultado = -1;
      if (valorA > valorB) resultado = 1;

      return this.direccionOrden === 'desc' ? -resultado : resultado;
    });
  }

  buscarTransacciones(termino: string): void {
    this.terminoBusqueda = (termino || '').toLowerCase();
    this.aplicarFiltrosYOrdenamiento();
  }

  private filtrarTransacciones(transacciones: Transaccion[]): Transaccion[] {
    if (!this.terminoBusqueda) return transacciones;

    return transacciones.filter(
      (transaccion) =>
        (transaccion.cliente || '')
          .toLowerCase()
          .includes(this.terminoBusqueda) ||
        (transaccion.vestido || '')
          .toLowerCase()
          .includes(this.terminoBusqueda) ||
        (transaccion.tipo || '').toLowerCase().includes(this.terminoBusqueda) ||
        (transaccion.estado || '').toLowerCase().includes(this.terminoBusqueda)
    );
  }

  private aplicarFiltrosYOrdenamiento(): void {
    console.log('Filtradas:', this.transaccionesFiltradas.length);
    console.log('Paginadas:', this.transaccionesPaginadas.length);
    let resultado = this.filtrarTransacciones(this.transacciones);
    resultado = this.ordenarTransacciones(resultado);
    this.transaccionesFiltradas = resultado;
    this.actualizarPaginacion();
  }

  private actualizarPaginacion(): void {
    if (this.mostrarTodas) {
      this.transaccionesPaginadas = this.transaccionesFiltradas;
    } else {
      const inicio = 0;
      const fin = this.paginaActual * this.tamanoPagina;
      this.transaccionesPaginadas = this.transaccionesFiltradas.slice(
        inicio,
        fin
      );
    }
  }
  private observarCambioDeModo(): void {
    const target = document.documentElement;
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class'
        ) {
          this.reinicializarCalendario();
        }
      });
    });

    observer.observe(target, { attributes: true });
  }
  private reinicializarCalendario(): void {
    if (this.calendar) {
      this.calendar.destroy();
    }
    this.inicializarCalendario();
  }
  verTodasLasTransacciones(): void {
    this.mostrarTodas = true;
    this.actualizarPaginacion();
  }

  reiniciarPaginacion(): void {
    this.mostrarTodas = false;
    this.paginaActual = 1;
    this.actualizarPaginacion();
  }

  cargarMas(): void {
    this.paginaActual++;
    this.actualizarPaginacion();
  }

  private getUltimoDiaMes(fecha: Date): number {
    return new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).getDate();
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

  getInitials(nombre: string): string {
    return nombre
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  // Controles de navegación
  irAnterior() {
    this.calendar.prev();
    this.actualizarMesAnio();
  }

  irSiguiente() {
    this.calendar.next();
    this.actualizarMesAnio();
  }

  irHoy() {
    this.calendar.today();
    this.actualizarMesAnio();
  }

  trackByTransaccion(index: number, transaccion: Transaccion): any {
    return transaccion.id || index;
  }

  getIconoOrdenamiento(campo: OrdenCampo): string {
    if (this.campoOrden !== campo) return '';
    return this.direccionOrden === 'asc' ? '↑' : '↓';
  }

  verificarCargaCompleta(): void {
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