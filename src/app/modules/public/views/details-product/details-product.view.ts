import { response } from 'express';
import { Location } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnChanges,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { ProductoService } from '../../../../shared/services/producto.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { IndexedDbService } from '../../commons/services/indexed-db.service';
import { CartService } from '../../../../shared/services/cart.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { NgxUiLoaderService } from 'ngx-ui-loader';
// import { Location } from '@angular/common';
// declare const $: any;
import AOS from 'aos';
import $ from 'jquery';
import { filter } from 'rxjs';
import { SwPush } from '@angular/service-worker';
import { NotificacionService } from '../../../../shared/services/notification.service';
import { environment } from '../../../../../environments/environment';

declare const Fancybox: any;

interface Resena {
  comentario: string;
  rating: number;
}

interface Producto {
  nombre: string;
  precio: number;
  imagenes: string[];
  descripcion?: string;
  resenas?: Resena[];
}

interface ProductoRecomendado {
  nombre: string;
  imagenes: string[];
  descripcion?: string;
  precio_venta?: number;
  precio_promocion?: number;
  precio?: number;
  resenas?: { rating: number; comentario: string }[];
}

@Component({
  selector: 'app-details-product',
  templateUrl: './details-product.view.html',
  // styleUrls: ['./details-product.view.scss', './info.scss', './carrucel.scss'],
})
export class DetailsProductView implements OnInit, AfterViewInit, OnDestroy {
  isLoading: boolean = true;
  isLoadingBtn: boolean = false;
  images: any[] = []; // Change to any[] to hold the required data
  productName: string = '';
  productPrice: string = '';
  productDescription: string = '';
  selectedImageIndex: number = 0; // Track the current index for the Galleria
  sizes: any[] = [];
  selectedColor: string = '';
  selectedSize: string = '';
  // sizes: any[] = [];
  private sub: any;
  isViewImagen: boolean = false;
  // productosRelacionados: any;
  mainImageUrl: string = ''; // URL de la imagen principal
  showImages: boolean = false; // Variable para mostrar/ocultar las imágenes secundarias
  imagenes: any; // Sigue siendo un array de cadenas para imágenes adicionales en base64
  selectedMainImage!: string;
  // accesorios: any;
  productId!: any;
  publicKey: string = environment.publicKey; // Este es el valor que debes obtener en la consola de Firebase.

  Detalles: any = null; // Inicializado en null

  mostrarModalRecomendados = false;

  recomendaciones: ProductoRecomendado[] = [];
  productosRecomendados: any[] = this.recomendaciones;



  // Variables para paginación de thumbnails en móvil/tablet
currentThumbPage: number = 0;
thumbsPerPage: number = 3;

get paginatedImages(): string[] {
  const start = this.currentThumbPage * this.thumbsPerPage;
  return this.Detalles?.imagenes?.slice(start, start + this.thumbsPerPage) || [];
}

get totalThumbPages(): number {
  return Math.ceil((this.Detalles?.imagenes?.length || 0) / this.thumbsPerPage);
}

setThumbPage(index: number): void {
  if (index >= 0 && index < this.totalThumbPages) {
    this.currentThumbPage = index;
  }
}

// Métodos para manejar el cambio de imagen principal
// onThumbnailHover(image: string): void {
//   this.selectedMainImage = image;
//   this.mainImageUrl = this.selectedMainImage;
// }

// resetMainImage(): void {
//   this.mainImageUrl = this.selectedMainImage;
// }

// changeMainImage(image: string): void {
//   this.selectedMainImage = image;
//   this.mainImageUrl = this.selectedMainImage;
// }


  abrirModal() {
    this.mostrarModalRecomendados = true;
  }

  cerrarModal() {
    this.mostrarModalRecomendados = false;
  }

  verProductoModal(producto: any) {
    this.cerrarModal();
    // Aquí puedes hacer algo, por ejemplo, navegar o abrir otro modal
    this.router.navigate(['/producto', producto._id]);
  }

  // Variables para paginación de thumbnails
  currentPage: number = 0;
  imagesPerPage: number = 5;

  // get paginatedImages(): string[] {
  //   const start = this.currentPage * this.imagesPerPage;
  //   return (
  //     this.Detalles?.imagenes?.slice(start, start + this.imagesPerPage) || []
  //   );
  // }

  get totalPages(): number {
    return Math.ceil(
      (this.Detalles?.imagenes?.length || 0) / this.imagesPerPage
    );
  }

  setPage(index: number): void {
    this.currentPage = index;
  }

  responsiveOptions: any[] = [
    {
      breakpoint: '1024px',
      numVisible: 3,
      numScroll: 3,
    },
    {
      breakpoint: '768px',
      numVisible: 2,
      numScroll: 2,
    },
    {
      breakpoint: '560px',
      numVisible: 1,
      numScroll: 1,
    },
  ];

  ngAfterViewInit(): void {
    if (this.mainImage && this.mainImage.nativeElement) {
      this.renderer.listen(
        this.mainImage.nativeElement,
        'mousemove',
        (event: MouseEvent) => {
          this.applyZoomEffect(event);
        }
      );

      this.renderer.listen(this.mainImage.nativeElement, 'mouseleave', () => {
        this.resetZoomEffect();
      });
    }

    if (this.PreviewmainImage && this.PreviewmainImage.nativeElement) {
      this.renderer.listen(
        this.PreviewmainImage.nativeElement,
        'mousemove',
        (event: MouseEvent) => {
          this.applyZoomEffectPreviewmainImage(event);
        }
      );

      this.renderer.listen(
        this.PreviewmainImage.nativeElement,
        'mouseleave',
        () => {
          this.resetZoomEffectPreviewmainImage();
        }
      );
    }
  }

  calcularDescuento(precioAnterior: number, precioActual: number): number {
    return Math.round(((precioAnterior - precioActual) / precioAnterior) * 100);
  }

  // Al pasar el mouse, cambia temporalmente la imagen principal
  onThumbnailHover(image: string): void {
    // this.mainImageUrl = image;
    this.selectedMainImage = image;

    this.mainImageUrl = this.selectedMainImage;
  }

  // Al salir del hover, restaura la imagen principal seleccionada previamente
  resetMainImage(): void {
    this.mainImageUrl = this.selectedMainImage;
  }
  @ViewChild('mainImage', { static: false }) mainImage!: ElementRef;
  @ViewChild('PreviewmainImage', { static: false })
  PreviewmainImage!: ElementRef;
  constructor(
    private location: Location,
    private indexedDbService: IndexedDbService,
    private productoS_: ProductoService,
    private activatedRoute: ActivatedRoute,
    private renderer: Renderer2,
    private cdRef: ChangeDetectorRef,
    private swPush: SwPush,
    private notificacionService_: NotificacionService,
    private ngxService: NgxUiLoaderService,
    private router: Router,
    private cartService: CartService
  ) {
    // this.id=require.para
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
  ngOnInit() {
    // this.ngxService.start(); // Inicia el loader
    this.isLoading = true;
    this.scrollToTop();
    // AOS.init({
    //   duration: 650, // Duración de la animación en milisegundos
    //   once: true, // Si `true`, la animación solo se ejecuta una vez
    // });
    const productId = this.activatedRoute.snapshot.params['id'];
    this.obtenerProducto(productId);
    this.sub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const productId = this.activatedRoute.snapshot.params['id'];
        if (productId) {
          this.obtenerProducto(productId); // Tu función para recargar el producto
        }
      });

    // }, 100);
  }
  obtenerProducto(id: string) {
    // Obtener detalles del producto

    this.ngxService.start(); // Inicia el loader
    this.productoS_
      .obtenerDetalleProductoById(id)
      .subscribe((response: any) => {
        console.log(response);
        this.ngxService.stop(); // Inicia el loader

        this.isLoading = false;
        this.Detalles = response;
        this.imagenes = this.Detalles.imagenes;

        // Establecer la primera imagen como imagen principal
        if (this.Detalles.imagenes && this.Detalles.imagenes.length > 0) {
          this.mainImageUrl = this.Detalles.imagenes[0];
        }

        // Preparar imágenes para el carrusel
        this.images = this.Detalles.imagenes.map((img: string) => ({
          itemImageSrc: img,
          thumbnailImageSrc: img,
        }));

        this.cdRef.detectChanges();
        const mostrar = localStorage.getItem('mostrarRecomendadosVentaVestido');
        if (mostrar === 'true') {
          this.mostrarModalRecomendados = true;
          localStorage.removeItem('mostrarRecomendadosVentaVestido');

          const vestido = {
            id_producto: this.Detalles?._id,
            producto_nombre: this.Detalles?.nombre,
            producto_talla: this.Detalles?.talla,
            producto_color: this.Detalles?.color,
            producto_temporada: this.Detalles?.temporada,
            vestido_estilo: this.Detalles?.estilo,
            vestido_condicion: this.Detalles?.condicion,
          };

          this.productoS_
            .obtenerRecomendacionesPorAtributos(vestido)
            .subscribe((response: any) => {
              if (response.success) {
                console.log(response);
                this.recomendaciones = response.recomendaciones;
              } else {
                console.warn('No se encontraron recomendaciones');
              }
            });
        }
      });
  }
  scrollToTop() {
    window.scrollTo(0, 0); // Esto lleva la página a la parte superior
  }
  volver() {
    this.location.back();
  }
  // getProductDetails() {
  //   this.isLoading = true;
  // }

  // selectedImageIndex = 0; // Índice inicial de la imagen
  applyZoomEffect(event: MouseEvent): void {
    const image = this.mainImage.nativeElement;
    const rect = image.getBoundingClientRect(); // Obtiene la posición de la imagen en la pantalla
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    this.renderer.setStyle(image, 'transform-origin', `${x}% ${y}%`);
    this.renderer.setStyle(image, 'transform', 'scale(2)');
  }

  resetZoomEffect(): void {
    const image = this.mainImage.nativeElement;
    this.renderer.setStyle(image, 'transform', 'scale(1)');
  }
  // Aplicar efecto de zoom en la imagen del modal
  applyZoomEffectPreviewmainImage(event: MouseEvent): void {
    const img = this.PreviewmainImage.nativeElement;
    const { offsetX, offsetY } = event;
    const { offsetWidth, offsetHeight } = img;

    const x = (offsetX / offsetWidth) * 100;
    const y = (offsetY / offsetHeight) * 100;

    img.style.transformOrigin = `${x}% ${y}%`;
    img.style.transform = 'scale(1.5)';
  }

  // Restablecer el efecto de zoom en la imagen del modal
  resetZoomEffectPreviewmainImage(): void {
    const img = this.PreviewmainImage.nativeElement;
    img.style.transform = 'scale(1)';
  }
  esFavorito: boolean = false;

  toggleFavorite(event: Event) {
    event.stopPropagation(); // Evita que se active el click de la imagen
    this.esFavorito = !this.esFavorito;
    // Aquí puedes agregar la lógica para guardar como favorito
  }
  // Imagen principal del Detalles

  // // Lista de imágenes en miniatura
  thumbnailImages!: string[];
  redirigirContinuarRenta(id: any) {
    this.isLoadingBtn = true;
    setTimeout(() => {
      this.isLoadingBtn = false;
      this.router.navigate([`/continuarRenta/${id}`]);
    }, 2000); // 2 segundos
  }
  redirigirContinuarCompra(id: any) {
    this.isLoadingBtn = true;
    setTimeout(() => {
      this.isLoadingBtn = false;
      this.router.navigate([`/continuarCompra/${id}`]);
    }, 2000); // 2 segundos
  }

  apartarRentar(producto: any) {
    const body2 = {
      id: producto._id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagenes: producto.imagenes[0],
      opcionesTipoTransaccion: producto.opcionesTipoTransaccion,
    };

    try {
      this.cartService.addToCart(body2);
      console.log('Producto agregado al carrito:', body2);

      // Enviar notificación push al usuario
      const nombreProducto = producto.nombre;
      const imagenProducto = producto.imagenes[0]; // Asegúrate de que sea una URL válida

      // Llama a generarToken y pasa los datos del producto
      this.generarToken(nombreProducto, imagenProducto);
    } catch (error) {
      console.error('Error al guardar el producto:', error);
    }
  }

  goToCart() {
    // Lógica para ir al carrito
    console.log('Ir al carrito');
  }

  login() {
    // Lógica para iniciar sesión
    console.log('Iniciar sesión');
  }

  openModal(): void {
    Fancybox.show(
      this.imagenes.map((src: any) => ({
        src,
        type: 'image',
      }))
    );
  }
  // Cerrar el modal de la imagen en pantalla completa
  btnClose(): void {
    this.isViewImagen = false;
  }

  closeModal(event: MouseEvent) {
    // Verifica si el clic fue en el fondo y no en la imagen
    if ((event.target as HTMLElement).classList.contains('image-modal')) {
      this.isViewImagen = false;
    }
  }
  verDetalles(id: number) {
    this.router.navigate(['/Detail/' + id]);
  }

  changeMainImage(image: string): void {
    this.selectedMainImage = image;
    this.mainImageUrl = this.selectedMainImage;
  }

  // Cambiar la imagen en el carrusel
  onImageChange(index: number) {
    this.selectedImageIndex = index;
  }

  // Navegar a la imagen anterior en el carrusel
  prevImage() {
    if (this.selectedImageIndex > 0) {
      this.selectedImageIndex--;
    } else {
      this.selectedImageIndex = this.images.length - 1; // Ir a la última imagen
    }
  }

  // Navegar a la siguiente imagen en el carrusel
  nextImage() {
    if (this.selectedImageIndex < this.images.length - 1) {
      this.selectedImageIndex++;
    } else {
      this.selectedImageIndex = 0; // Volver a la primera imagen
    }
  }

  generarToken(nombreProducto: string, imagenProducto: string): void {
    const esLocal =
      location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    const esSeguro = location.protocol === 'https:' || esLocal;

    if (!esSeguro) {
      console.error(
        'Las notificaciones push solo funcionan en sitios HTTPS o localhost.'
      );
      alert(
        'Debes acceder mediante HTTPS o localhost para usar notificaciones.'
      );
      return;
    }

    if (!('serviceWorker' in navigator)) {
      console.error('Este navegador no soporta Service Workers.');
      alert('Tu navegador no soporta notificaciones push.');
      return;
    }

    if (!this.swPush || !this.swPush.isEnabled) {
      console.warn(
        'Push notifications no están habilitadas en este navegador.'
      );
      return;
    }

    Notification.requestPermission().then((permiso) => {
      if (permiso !== 'granted') {
        console.warn('Permiso de notificaciones no concedido:', permiso);
        alert('Debes permitir notificaciones para recibir alertas.');
        return;
      }

      navigator.serviceWorker
        .register('ngsw-worker.js')
        .then(() => {
          this.swPush
            .requestSubscription({ serverPublicKey: this.publicKey })
            .then((sub) => {
              const productoInfo = {
                nombreProducto,
                imagenProducto,
              };
              this.enviarNotificacion(sub, productoInfo);
              console.log('Suscripción push exitosa:', sub);
            })
            .catch((err) => {
              console.error('Error al suscribirse a notificaciones:', err);
              alert('Hubo un problema al suscribirse a las notificaciones.');
            });
        })
        .catch((error) => {
          console.error('Error al registrar el Service Worker:', error);
          alert('Fallo el registro del Service Worker.');
        });
    });
  }

  enviarNotificacion(
    token: PushSubscription,
    productoInfo: { nombreProducto: string; imagenProducto: string }
  ): void {
    const body = {
      token,
      nombreProducto: productoInfo.nombreProducto,
      imagenProducto: productoInfo.imagenProducto,
    };

    this.notificacionService_.enviarNotificacionLlevaTuVestido(body).subscribe(
      (response) => {
        console.log('Notificación enviada:', response);
      },
      (error) => {
        console.error('Error al enviar la notificación:', error);
      }
    );
  }
}
