import { Location } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ProductoService } from '../../../../shared/services/producto.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IndexedDbService } from '../../commons/services/indexed-db.service';
import { CartService } from '../../../../shared/services/cart.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { NgxUiLoaderService } from 'ngx-ui-loader';
// import { Location } from '@angular/common';
// declare const $: any;
import AOS from 'aos';
import $ from 'jquery';

declare const Fancybox: any;

interface Producto {
  id?: string; // Opcional, para incluir el _id de MongoDB
  nombre: string;
  imagenPrincipal: any; // Sigue siendo una cadena para representar la imagen en base64
  otrasImagenes: string[]; // Sigue siendo un array de cadenas para imágenes adicionales en base64
  color: string;
  textura?: string;
  precio: number;
  estado: {
    disponible: boolean;
    tipoVenta: 'Venta' | 'Renta';
    nuevo?: boolean; // Nuevo es opcional
  };
  descripcion?: string; // Descripción opcional
}

@Component({
  selector: 'app-details-product',
  templateUrl: './details-product.view.html',
  styleUrls: ['./details-product.view.scss', './info.scss', './carrucel.scss'],
})
export class DetailsProductView implements OnInit, AfterViewInit {
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
  isViewImagen: boolean = false;
  // productosRelacionados: any;
  mainImageUrl: string = ''; // URL de la imagen principal
  showImages: boolean = false; // Variable para mostrar/ocultar las imágenes secundarias
  imagenes: any; // Sigue siendo un array de cadenas para imágenes adicionales en base64
  selectedMainImage!: string
  // accesorios: any;
  productId!: any;
  Detalles: any = null; // Inicializado en null
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
    Fancybox.bind('[data-fancybox="gallery"]', {
      Toolbar: false,
      Thumbs: {
        autoStart: true,
      },
    });

    this.renderer.listen(this.mainImage.nativeElement, 'mousemove', (event: MouseEvent) => {
      this.applyZoomEffect(event);
    });

    this.renderer.listen(this.mainImage.nativeElement, 'mouseleave', () => {
      this.resetZoomEffect();
    });
    this.renderer.listen(this.PreviewmainImage.nativeElement, 'mousemove', (event: MouseEvent) => {
      this.applyZoomEffectPreviewmainImage(event);
    });

    this.renderer.listen(this.PreviewmainImage.nativeElement, 'mouseleave', () => {
      this.resetZoomEffectPreviewmainImage();
    });
  }
  calcularDescuento(precioAnterior: number, precioActual: number): number {
    return Math.round(((precioAnterior - precioActual) / precioAnterior) * 100);
  }

  // Cambia la imagen principal y guarda la selección
// changeMainImage(image: string): void {
//   this.mainImageUrl = image;
//   this.selectedMainImage = image;
// }

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
  @ViewChild('PreviewmainImage', { static: false }) PreviewmainImage!: ElementRef;
  constructor(
    private location: Location,
    private indexedDbService: IndexedDbService,
    private productoS_: ProductoService,
    private activatedRoute: ActivatedRoute,
    private renderer: Renderer2,
    private cdRef: ChangeDetectorRef,
    private ngxService: NgxUiLoaderService,
    private router: Router,
    private cartService: CartService,
    private confirmationService: ConfirmationService, // Inyectar ConfirmationService
    private messageService: MessageService // Inyectar MessageService (opcional para notificacio
  ) {
    // this.id=require.para
  }

  ngOnInit() {
    this.isLoading = true;
    this.scrollToTop();
    this.ngxService.stop(); // Inicia el loader
    AOS.init({
      duration: 650, // Duración de la animación en milisegundos
      once: true, // Si `true`, la animación solo se ejecuta una vez
    });
    const productId = this.activatedRoute.snapshot.params['id'];

    // Obtener detalles del producto
    this.productoS_.obtenerDetalleProductoById(productId)
      .subscribe((response: any) => {
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
          thumbnailImageSrc: img
        }));

        this.cdRef.detectChanges(); // Forzar la actualización del DOM
      });


      setTimeout(() => {
        Fancybox.bind('[data-fancybox="gallery"]', {
          // Aquí puedes agregar configuraciones adicionales si es necesario
          // por ejemplo, velocidad de transición, etc.
        });
      }, 100);
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
    const x = (event.clientX - rect.left) / rect.width * 100;
    const y = (event.clientY - rect.top) / rect.height * 100;

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
      // Guardar el producto en IndexedDB
      // this.indexedDbService.guardarProducto(body2);

      // Agregar el producto al carrito usando el servicio
      this.cartService.addToCart(body2);
      console.error(body2);

      // // Mostrar diálogo de confirmación
      // this.confirmationService.confirm({
      //   message: `
      //     <div class="product-notification">
      //       <img src="${producto.imagenPrincipal}" alt="${producto.nombre}" class="product-image" />
      //       <div class="product-details">
      //         <h4>${producto.nombre}</h4> 
      //         <p>${producto.precio}</p>
      //       </div>
      //       <p>¿Deseas ir al carrito o iniciar sesión?</p>
      //     </div>
      //   `,
      //   header: 'Producto agregado',
      //   acceptLabel: 'Ir al carrito',
      //   rejectLabel: 'Iniciar sesión',
      //   accept: () => {
      //     // Lógica para ir al carrito
      //     this.goToCart();
      //   },
      //   reject: () => {
      //     // Lógica para iniciar sesión
      //     this.login();
      //   },
      // });
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
      this.imagenes.map((src:any) => ({
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
    this.router.navigate(["/Detail/" + id]);
  }


  // }}}
  // Cambiar la imagen principal al hacer clic en una miniatura
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


}
