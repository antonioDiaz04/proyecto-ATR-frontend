import { Component, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { SwPush } from "@angular/service-worker";

@Component({
  selector: 'app-root',
  templateUrl: './public.component.html',
  // styleUrl: './public.component.css',
})
export class PublicComponent implements OnInit {
  // title = 'frontend';
  isScrolled = false;

  visible: boolean = false;
  sidebarVisible: boolean = false;
  isMobile: boolean = false;

  constructor(private router: Router,private swPush: SwPush) {

    // Escucha los cambios de ruta
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Verifica si la ruta actual es 'home'
        this.isHomePage = event.url === '/inicio';
      }
    });
  }

  ngOnInit(): void {
    this.subscription()
    const ua = navigator.userAgent;
    console.log(ua);

    // Verificar si estamos en un entorno del navegador (donde window existe)
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent;
      console.log(ua);

      // Detectar si la ventana tiene un tamaño similar al de un móvil
      if (window.innerWidth <= 768) {
        this.isMobile = true;
        console.log('El navegador está en un tamaño de móvil');
      } else {
        this.isMobile = false;
        console.log('El navegador está en un tamaño de escritorio');
      }

      // Detectar si el navegador es Chrome
      if (/Chrome/i.test(ua)) {
        console.log('Navegador Chrome detectado');
      } else {
        console.log('Navegador no es Chrome');
      }

      // Escuchar cambios en el tamaño de la ventana
      window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
          this.isMobile = true;
          console.log('El navegador ahora está en un tamaño de móvil');
        } else {
          this.isMobile = false;
          console.log('El navegador ahora está en un tamaño de escritorio');
        }
      });
    } else {
      console.log('No se está ejecutando en un navegador');
    }
  }
  isHomePage: boolean = false;

  
  redirectTo(route: string): void {
    // this.sidebarVisible2 = !this.sidebarVisible2
    console.log(route);
    if (route === 'login') {
      this.router.navigate(['/auth/login']); // Navegación hacia la página de inicio de sesión
    } else {
      console.log('click', route);
      this.router.navigate(['/', route]); // Navegación hacia otras páginas públicas
    }
  }

  // title = 'purificadora';
  response: any;
  readonly VAPID_PUBLIC_KEY =
    'BPqUE0OuQtFwPMDzFFttBK-aM3oJePkk_vsQ0OPmRQVJwWYQY1gq1U7mxFPRuSUR85rwBiU1ynfCsExlCIt40fk';
  subscription() {
    this.swPush
      .requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY,
      })
      .then((response) => {
        this.response = response;
      })
      .catch((error) => (this.response = error));
  }

  showScrollButton: boolean = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showScrollButton = window.scrollY > 200; // Muestra el botón después de desplazarse 200px
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }



}
