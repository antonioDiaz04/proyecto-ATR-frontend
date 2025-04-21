import { isPlatformBrowser } from "@angular/common";
import { Component, HostListener, Inject, OnInit, Output, PLATFORM_ID } from "@angular/core";
import { Router } from '@angular/router';  // Importa el Router para la navegación
import EventEmitter from "events";

// Define the structure of the selected filters
interface SelectedFilters {
  categoria: string | null;
  color: string | null;
  tallas: string[];
}

@Component({
  selector: "app-sidevar",
  templateUrl: "./sidevar.component.html",
  styleUrls: ["../../../../shared/styles/categoriesNav.scss"],
  styles:`.reset-button {
    background-color: #f44336; /* Color rojo */
    color: white;
    border: none;
    padding: 10px 15px;
    cursor: pointer;
    border-radius: 5px;
    margin-top: 10px;
  }
  
  .reset-button:hover {
    background-color: #d32f2f; /* Color rojo más oscuro al pasar el ratón */
  }
  `
})
export class SidevarComponent implements OnInit {
  isMobile: boolean = false;
  visible: boolean = false;

  // Output to emit selected filters
  @Output() filtersChanged = new EventEmitter<any>();

  // Selected filters default values
  selectedFilters: SelectedFilters = {
    categoria: null,
    color: null,
    tallas: ['todas'],
  };

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router  // Inyecta el Router
  ) {}

  // Method to apply filters (category, color, etc.)
  applyFilter(key: keyof SelectedFilters, value: any) {
    if (key in this.selectedFilters) {
      this.selectedFilters[key] = value;
    } else {
      return;
    }
    console.log('Filtros seleccionados:', this.selectedFilters);
    this.emitFilters();
    this.redirectWithFilters();  // Llama a la función para redirigir con los filtros
  }

  // Method to toggle size selection
  toggleSize(talla: string) {
    if (talla === "todas") {
      this.selectedFilters.tallas = ["todas"];
    } else {
      // Si "todas" estaba seleccionada, la reemplazamos con la nueva talla
      if (this.selectedFilters.tallas.includes("todas")) {
        this.selectedFilters.tallas = [talla];
      } else {
        // Reemplaza cualquier talla seleccionada previamente
        this.selectedFilters.tallas = [talla];
      }
      
    }
    this.emitFilters();
    this.redirectWithFilters();  // Llama a la función para redirigir con los filtros
  }
  

  // Method to emit selected filters as JSON
  private emitFilters() {
    this.filtersChanged.emit(this.selectedFilters);
  }

  // Method to redirect with filters in query parameters
  private redirectWithFilters() {
    const { categoria, color, tallas } = this.selectedFilters;
    // Redirige a la ruta deseada con los filtros como parámetros de consulta
    this.router.navigate(['/search'], {
      queryParams: {
        categoria,
        color,
        tallas: tallas.join(',')  // Convierte las tallas en un string separado por comas
      },
      queryParamsHandling: 'merge',  // Mantén los parámetros actuales si los hubiera
    });
  }

  // Check screen size to determine if the device is mobile or desktop
  checkScreenSize() {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth <= 768;
      this.applyHeroImageVisibility();
      console.log(this.isMobile ? "Modo móvil" : "Modo escritorio");
    }
  }

  // Apply visibility logic for the hero image based on screen size
  applyHeroImageVisibility() {
    const heroImageElement = document.querySelector(".hero-img");
    if (heroImageElement) {
      if (this.isMobile) {
        heroImageElement.classList.add("hide-hero-img");
      } else {
        heroImageElement.classList.remove("hide-hero-img");
      }
    }
  }

  // Initialize component
  ngOnInit() {
    this.emitFilters();
    this.detectDevice();
  }
  

  // Detect device type (mobile or desktop)
  private detectDevice() {
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent;
      console.log(ua);
      this.isMobile = window.innerWidth <= 600;
    }
  }

  // Listen for window resize events
  @HostListener("window:resize", ["$event"])
  onResize() {
    this.detectDevice();
  }


  // Método para restablecer los filtros
resetFilters() {
  this.selectedFilters = {
    categoria: null,
    color: null,
    tallas: ['todas'],
  };
  console.log('Filtros restablecidos:', this.selectedFilters);
  this.emitFilters();
  this.redirectWithFilters();  // Redirige con los filtros restablecidos
}

}
