import { Component, OnInit, Renderer2, ViewChild, ViewEncapsulation } from "@angular/core";
import { Router } from "@angular/router";
import { VentayrentaService } from "../../../../shared/services/ventayrenta.service";
// import { ChartComponent } from 'smart-webcomponents-angular/chart';

@Component({
  selector: "app-home",
  templateUrl: "./home.view.html",
  styleUrls: [
    "./home.view.scss",
    // "./menuLateral.scss"
  ],
  encapsulation: ViewEncapsulation.None,
})
export class HomeView implements OnInit {
  // Propiedades para los gráficos
  chartDataAnual: any;
  chartDataMensual: any;
  chartDataSemanal: any;
  chartDataDiario: any;
  chartData: any;
  chartDataFecha: any;
  // / Propiedades para los datos de la vista
  commentCount: number = 0;
  fechaTexto: string = '';




  rentas: any[] = [];
  stats: {
    productoMasRentado?: { productoNombre: string, count: number },
    usuarioMasActivo?: { usuarioNombre: string, count: number },
    fechaMayorRenta?: string
  } = {};



  constructor(private ventaYrentaS_: VentayrentaService, private router: Router, private renderer: Renderer2) {
    this.rentas = [
      {
        detallesRenta: { fechaInicio: '2025-01-01T00:00:00.000Z', fechaFin: '2025-01-05T00:00:00.000Z' },
        detallesPago: { precioRenta: 100 },
        usuario: { nombre: 'Juan Pérez' },
        producto: { nombre: 'Producto A', idCategoria: { nombre: 'Categoría 1' } },
        estado: 'Activo'
      },
      {
        detallesRenta: { fechaInicio: '2025-01-01T00:00:00.000Z', fechaFin: '2025-01-06T00:00:00.000Z' },
        detallesPago: { precioRenta: 150 },
        usuario: { nombre: 'María López' },
        producto: { nombre: 'Producto B', idCategoria: { nombre: 'Categoría 2' } },
        estado: 'Activo'
      },
      {
        detallesRenta: { fechaInicio: '2025-01-02T00:00:00.000Z', fechaFin: '2025-01-07T00:00:00.000Z' },
        detallesPago: { precioRenta: 200 },
        usuario: { nombre: 'Juan Pérez' },
        producto: { nombre: 'Producto A', idCategoria: { nombre: 'Categoría 1' } },
        estado: 'Activo'
      }
    ];
  }
  // ... otros métodos y propiedades
  ngOnInit(): void {
    this.obtenerRentas();
    this.fechaTexto = new Date().toLocaleDateString();

    // Inicializa tu estadística, por ejemplo: distribución de rentas por producto.
    this.chartData = {
      labels: ['Producto A', 'Producto B', 'Producto C'],
      datasets: [
        {
          data: [300, 50, 100],
          backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726'],
          hoverBackgroundColor: ['#64B5F6', '#81C784', '#FFB74D']
        }
      ]
    };
  }
  obtenerRentas(): void {
    this.ventaYrentaS_.obtenerRentas().subscribe(
      (res) => {
        this.rentas = res.rentas.map((renta: any) => {
          const fechaInicio = new Date(renta.detallesRenta.fechaInicio);
          const fechaFin = new Date(renta.detallesRenta.fechaFin);
          return {
            ...renta,
            usuarioNombre: renta.usuario?.nombre || 'Usuario no disponible',
            productoNombre: renta.producto?.nombre || 'Producto no disponible',
            categoriaNombre: renta.producto?.idCategoria?.nombre || 'Sin categoría',
            estado: renta.estado,
            detallesRenta: {
              ...renta.detallesRenta,  // Nota: asegúrate de corregir errores tipográficos (por ejemplo, "detanllesRenta")
              fechaInicio: fechaInicio.toISOString().split('T')[0],
              fechaFin: fechaFin.toISOString().split('T')[0]
            },
            precioRenta: renta.detallesPago.precioRenta
          };
        });
        this.computeStats();
      },
      (error) => {
        console.error("Error al obtener rentas:", error);
      }
    );
  }

  computeStats(): void {
    const productoCount: any = {};
    const usuarioCount: any = {};
    const fechaCount: any = {};
    let anualData: { [year: string]: number } = {};
    let mensualData: { [month: string]: number } = {};
    // Se omiten semanalData y diarioData si no se usan
  
    this.rentas.forEach(renta => {
      // Contar por producto
      const prod = renta.productoNombre;
      productoCount[prod] = (productoCount[prod] || 0) + 1;
  
      // Contar por usuario
      const user = renta.usuarioNombre;
      usuarioCount[user] = (usuarioCount[user] || 0) + 1;
  
      // Convertir fecha de inicio a objeto Date y formatearlo
      const fechaObj = new Date(renta.detallesRenta.fechaInicio);
      const fechaStr = fechaObj.toISOString().split('T')[0];
      fechaCount[fechaStr] = (fechaCount[fechaStr] || 0) + 1;
  
      // Datos para gráficos anuales y mensuales
      let year = fechaObj.getFullYear().toString();
      let month = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
      let keyMonth = `${year}-${month}`;
      anualData[year] = (anualData[year] || 0) + 1;
      mensualData[keyMonth] = (mensualData[keyMonth] || 0) + 1;
    });
  
    // Gráfico anual
    const years = Object.keys(anualData).sort();
    this.chartDataAnual = {
      labels: years,
      datasets: [
        {
          label: 'Rentas por Año',
          data: years.map(year => anualData[year]),
          fill: false,
          borderColor: '#42A5F5',
          tension: 0.1
        }
      ]
    };
  
    // Gráfico mensual
    const months = Object.keys(mensualData).sort();
    this.chartDataMensual = {
      labels: months,
      datasets: [
        {
          label: 'Rentas por Mes',
          data: months.map(month => mensualData[month]),
          fill: false,
          borderColor: '#FFA726',
          tension: 0.1
        }
      ]
    };
  
    const keysProducto = Object.keys(productoCount);
    const keysUsuario = Object.keys(usuarioCount);
    const keysFecha = Object.keys(fechaCount);
  
    const productoMasRentado = keysProducto.length > 0
      ? keysProducto.reduce((a, b) => productoCount[a] > productoCount[b] ? a : b)
      : undefined;
  
    const usuarioMasActivo = keysUsuario.length > 0
      ? keysUsuario.reduce((a, b) => usuarioCount[a] > usuarioCount[b] ? a : b)
      : undefined;
  
    const fechaMayorRenta = keysFecha.length > 0
      ? keysFecha.reduce((a, b) => fechaCount[a] > fechaCount[b] ? a : b)
      : undefined;
  
    this.stats = {
      productoMasRentado: productoMasRentado
        ? { productoNombre: productoMasRentado, count: productoCount[productoMasRentado] }
        : undefined,
      usuarioMasActivo: usuarioMasActivo
        ? { usuarioNombre: usuarioMasActivo, count: usuarioCount[usuarioMasActivo] }
        : undefined,
      fechaMayorRenta: fechaMayorRenta || undefined
    };
  
    // Gráfico de productos
    this.chartData = {
      labels: keysProducto,
      datasets: [
        {
          data: keysProducto.map(key => productoCount[key]),
          backgroundColor: keysProducto.map((_, index) => this.getColor(index)),
          hoverBackgroundColor: keysProducto.map((_, index) => this.getHoverColor(index))
        }
      ]
    };
  
    // Gráfico de distribución por fecha
    this.chartDataFecha = {
      labels: keysFecha,
      datasets: [
        {
          label: 'Cant. de Rentas por Fecha',
          data: keysFecha.map(key => fechaCount[key]),
          backgroundColor: keysFecha.map((_, index) => this.getColor(index)),
          hoverBackgroundColor: keysFecha.map((_, index) => this.getHoverColor(index))
        }
      ]
    };
  }
  // Funciones para obtener color (puedes ajustar los colores según necesites)
  getColor(index: number): string {
    const colors = ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#26C6DA'];
    return colors[index % colors.length];
  }

  getHoverColor(index: number): string {
    const colors = ['#64B5F6', '#81C784', '#FFB74D', '#CE93D8', '#4DD0E1'];
    return colors[index % colors.length];
  }
  // ... resto del código del componente
  loadPendingComments(): void {
    // Llama al servicio para obtener el conteo de comentarios pendientes
    // this.commentsService.getPendingComments().subscribe(
    //   (res: any) => {
    //     this.commentCount = res.count || 0;
    //   },
    //   (err) => {
    //     console.error("Error al obtener comentarios pendientes:", err);
    //   }
    // );
  }
  // Simula algunas rentas de ejemplo

  // Luego llamas a computeStats para actualizar gráficos y estadísticas
  // this.computeStats();
  goToComments(): void {
    // Redirige a la ruta de comentarios en el panel de administración
    this.router.navigate(['/admin/comments']);
  }
}
