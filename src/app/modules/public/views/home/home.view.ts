import {
  Component,
  OnInit,
  Inject,
  PLATFORM_ID,
  HostListener,
} from "@angular/core";

import { isPlatformBrowser } from "@angular/common";
import { Router } from "@angular/router";
import { SessionService } from "../../../../shared/services/session.service";
import { ERol } from "../../../../shared/constants/rol.enum";
import { DatosEmpresaService } from "../../../../shared/services/datos-empresa.service";
import { ProductoService } from "../../../../shared/services/producto.service";
import { IndexedDbService } from "../../commons/services/indexed-db.service";
import AOS from 'aos';

@Component({
  selector: "app-home",
  templateUrl: "./home.view.html",
  styleUrls: [
    // "./home.view.css",
    // "../../../../shared/styles/styles.scss",
    // "../../../../shared/styles/animations.scss",
  ],
})
export class HomeView implements OnInit {
  isMobile: boolean = false;
  visible: boolean = false;
  userROL!: string;
  position: any = "bottom-left";
  productosPaginados: any = [];
  numVisibleProducts: number = 5; // Valor por defecto
  rows = 7; // Número de elementos por página
  skeletonItems: any[] = Array(6).fill({}); // Array de 6 elementos para el skeleton
  productos: any = []; // Inicializamos como array vacío
  responsiveOptions = [
    {
      breakpoint: "1024px",
      numVisible: 3,
      numScroll: 1,
    },
    {
      breakpoint: "768px",
      numVisible: 2,
      numScroll: 1,
    },
    {
      breakpoint: "500px",
      numVisible: 0.5, // Mostrar la mitad del último producto
      numScroll: 1,
    },
  ];

  // Inicializamos isLoading en true para mostrar el skeleton
  isLoading: boolean = true;

  constructor(
    private indexedDbService: IndexedDbService,
    private router: Router,
    private sessionService: SessionService,
    private datosEmpresaService: DatosEmpresaService,
    private PRODUCTOSERVICE_: ProductoService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private detectDevice() {
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent;
      console.log(ua);
      this.isMobile = window.innerWidth <= 600;
    }
  }

  @HostListener("window:resize", ["$event"])
  onResize() {
    this.detectDevice();
  }

  // Antes de recargar o cerrar la página, vaciamos productos y mostramos el skeleton


  // HostListener para window:load (se dispara al cargar la página)
  

  ngOnInit() {
    // Al iniciar la carga, vaciamos el array de productos
    AOS.init({
      duration: 650, // Duración de la animación en milisegundos
      once: false, // Si `true`, la animación solo se ejecuta una vez
    });
    this.detectDevice();
    this.checkBrowserEnvironment();

     
  
  // Cargar los productos solo si la página no se está recargando
  
      this.detectDevice();
      this.checkBrowserEnvironment();
    }
  
   
  
  
  
  checkBrowserEnvironment() {
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent;
      console.log(ua);

      if (window.innerWidth <= 768) {
        this.isMobile = true;
        console.log("El navegador está en un tamaño de móvil");
      } else {
        this.isMobile = false;
        console.log("El navegador está en un tamaño de escritorio");
      }

      if (/Chrome/i.test(ua)) {
        console.log("Navegador Chrome detectado");
      } else {
        console.log("Navegador no es Chrome");
      }

      window.addEventListener("resize", () => {
        this.isMobile = window.innerWidth <= 600;
        console.log("Cambio de tamaño detectado:", window.innerWidth);
      });
    } else {
      this.isMobile = false;
      console.log("No se está ejecutando en un navegador");
    }
  }

  isUserLoggedIn(): boolean {
    const userData = this.sessionService.getUserData();
    if (userData) {
      this.userROL = userData.rol;
      return this.userROL === ERol.CLIENTE;
    }
    return false;
  }

  

  cambiarPagina(event: any) {
    const start = event.first;
    const end = start + event.rows;
    this.productosPaginados = this.productos.slice(start, end);
  }


}
