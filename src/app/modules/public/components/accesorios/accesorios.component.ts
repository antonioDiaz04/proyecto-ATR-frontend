import { Component, HostListener } from '@angular/core';
import { ProductoService } from '../../../../shared/services/producto.service';

@Component({
  selector: 'app-accesorios',
  templateUrl: './accesorios.component.html',
  // styleUrl: './accesorios.component.scss'
})
export class AccesoriosComponent {
  isMobile: boolean = false;
  iconItems: any[] = [];
  responsiveOptions: any[] = [];

  accesorios :any[] = [];
numVisible: number = 4; // Número visible por defecto
  ngOnInit() {
    this.checkScreenSize();
    this.setupIconItems();
    this.setupResponsiveOptions();
    
  }

  constructor(private productoS_: ProductoService) {
    this.productoS_.obtenerAccesorios().subscribe({
      next: (response) => {
        this.accesorios = response;
        console.log('Accesorios:', response);
      },
      error: (err) => {
        console.error('Error al obtener accesorios:', err);
      }
    });
  

    this.responsiveOptions = [
      {
        breakpoint: '640px',
        numVisible: 2,
        numScroll: 1
      },
      {
        breakpoint: '641px',
        numVisible: 3,
        numScroll: 1
      },
      {
        breakpoint: '1024px',
        numVisible: 5,
        numScroll: 1
      }
    ];
  
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
  }

  setupIconItems() {
    this.iconItems = [
      {
        icon: 'pi pi-sparkles',
        title: 'ACCESORIOS',
        description: 'Lleva tu look al siguiente nivel y complétalo con nuestros accesorios exclusivos'
      },
      {
        icon: 'pi pi-heart',
        title: 'LIPSTICK',
        description: 'Mirum est notare quam littera gothica, quam nunc putamus parum claram'
      },
      {
        icon: 'pi pi-bell',
        title: 'NOTIFICATIONS',
        description: 'Recibe notificaciones y sé el primero en conocer nuestras ofertas y descuentos exclusivos'
      },
      {
        icon: 'pi pi-users',
        title: 'BE A CLIENT',
        description: 'Únete a nuestra comunidad y disfruta de beneficios exclusivos para clientes'
      }
    ];
  }

  setupResponsiveOptions() {
    this.responsiveOptions = [
      {
        breakpoint: '1024px',
        numVisible: 1,
        numScroll: 1
      },
      {
        breakpoint: '768px',
        numVisible: 1,
        numScroll: 1
      },
      {
        breakpoint: '560px',
        numVisible: 1,
        numScroll: 1
      }
    ];
  }
}