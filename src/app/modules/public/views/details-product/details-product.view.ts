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
  productosRelacionados:any;


  accesorios:any;
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
    this.productId = this.activatedRoute.snapshot.params['id'];
    this.productoS_.obtenerDetalleProductoById(this.productId)
      .subscribe((response:any) => {
        this.isLoading = false;
        this.Detalles = response;
        this.cdRef.detectChanges(); // Forzar la actualización del DOM
      });
      this.productoS_.obtenerAccesorios()
      .subscribe((accesorios:any) => {
        this.accesorios = accesorios.map((item:any) => ({
          nombre: item.nombre,
          imagen: item.imagenPrincipal, // Ajuste del nombre de la propiedad
        }));
      });
      this.productoS_
      .obtenerProductos()
      .subscribe((accesorios:any) => {
        this.productosRelacionados = accesorios.map((item:any) => ({
          nombre: item.nombre,
          imagen: item.imagenPrincipal, // Ajuste del nombre de la propiedad
        }));
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
    const x = (event.clientX - rect.left) / rect.width * 100;
    const y = (event.clientY - rect.top) / rect.height * 100;

    this.renderer.setStyle(image, 'transform-origin', `${x}% ${y}%`);
    this.renderer.setStyle(image, 'transform', 'scale(2)');
  }

  resetZoomEffect(): void {
    const image = this.mainImage.nativeElement;
    this.renderer.setStyle(image, 'transform', 'scale(1)');
  }
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

  prevImage() {
    this.selectedImageIndex =
      (this.selectedImageIndex - 1 + this.images.length) % this.images.length;
  }
  nextImage() {
    this.selectedImageIndex =
      (this.selectedImageIndex + 1) % this.images.length;
  }

  onImageChange(event: any) {
    this.selectedImageIndex = event.index;
  }

  // Imagen principal del Detalles

  // // Lista de imágenes en miniatura
  thumbnailImages!: string[];
  changeMainImage(image: string) {
    if (this.Detalles) {
      this.Detalles.imagenPrincipal = image;
    }
  }
 
  redirigirContinuarRenta(id: any) {
    this.isLoadingBtn = true;
    setTimeout(() => {
      this.isLoadingBtn = false;
      this.router.navigate([`/public/continuarRenta/${id}`]);
    }, 2000); // 2 segundos
  }
  redirigirContinuarCompra(id: any) {
    this.isLoadingBtn = true;
    setTimeout(() => {
      this.isLoadingBtn = false;
      this.router.navigate([`/public/continuarCompra/${id}`]);
    }, 2000); // 2 segundos
  }

  apartarRentar(producto: any) {
    const body2 = {
      id: producto._id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagenPrincipal: producto.imagenPrincipal,
      categoria: producto.categoria,
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
    this.router.navigate(["/public/Detail/" + id]);
  }

}
