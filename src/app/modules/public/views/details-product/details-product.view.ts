import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ProductoService } from '../../../../shared/services/producto.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IndexedDbService } from '../../commons/services/indexed-db.service';
declare const $: any;

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
export class DetailsProductView implements OnInit ,AfterViewInit{
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
    private indexedDbService: IndexedDbService,
    private productoS_: ProductoService,
    private activatedRoute: ActivatedRoute,
    private renderer: Renderer2,
    private cdRef: ChangeDetectorRef,
    private router:Router
  ) {
    // this.id=require.para
  }
  ngOnInit() {
    this.isLoading = true;
    this.scrollToTop();
    this.productId = this.activatedRoute.snapshot.params['id'];
    this.productoS_
      .obtenerDetalleProductoById(this.productId)
      .subscribe((response) => {
        this.isLoading = false;
        this.Detalles = response;
        this.cdRef.detectChanges(); // Forzar la actualización del DOM
      });
  }
  scrollToTop() {
    window.scrollTo(0, 0); // Esto lleva la página a la parte superior
  }
  volver() {
    window.history.back();
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
    const image = this.PreviewmainImage.nativeElement;
    const rect = image.getBoundingClientRect(); // Obtiene la posición de la imagen en la pantalla
    const x = (event.clientX - rect.left) / rect.width * 100;
    const y = (event.clientY - rect.top) / rect.height * 100;

    this.renderer.setStyle(image, 'transform-origin', `${x}% ${y}%`);
    this.renderer.setStyle(image, 'transform', 'scale(1.5)');
  }

  resetZoomEffectPreviewmainImage(): void {
    const image = this.PreviewmainImage.nativeElement;
    this.renderer.setStyle(image, 'transform', 'scale(1)');
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
    console.log('primero=>', producto); // Log the data being saved
    // guardarProducto(productData);
    const body2 = {
      id: producto._id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagenPrincipal: producto.imagenPrincipal,
      categoria: producto.categoria,
    };
    console.log('ssegundo=>', body2); // Log the data being saved
    try {
      this.indexedDbService.guardarProducto(body2);
      // this.dbService.guardarProducto(productData);
    } catch (error) {
      console.error('Error saving product:', error);
    }
    // Agregar producto a la lista de "Apartados" o "Rentados"
  }

  productos = [
    {
      nombre: 'Diadema Elegante',
      precio: 15,
      imagen:
        'https://img.ltwebstatic.com/images3_spmp/2024/09/05/c4/17254703255ca6e5d5659688c66976ff7fcca3f6ca_thumbnail_720x.jpg',
    },
    {
      nombre: 'Collar de Perlas',
      precio: 25,
      imagen:
        'https://img.ltwebstatic.com/images3_spmp/2024/09/05/c4/17254703255ca6e5d5659688c66976ff7fcca3f6ca_thumbnail_720x.jpg',
    },
    {
      nombre: 'Pulsera Brillante',
      precio: 10,
      imagen:
        'https://img.ltwebstatic.com/images3_spmp/2024/09/05/c4/17254703255ca6e5d5659688c66976ff7fcca3f6ca_thumbnail_720x.jpg',
    },
    {
      nombre: 'Renta de Vestido',
      precio: 50,
      imagen:
        'https://img.ltwebstatic.com/images3_spmp/2024/09/05/c4/17254703255ca6e5d5659688c66976ff7fcca3f6ca_thumbnail_720x.jpg',
    },
  ];

  productosRelacionados = [
    {
      nombre: 'vestido pulpa',
      precio: 30,
      imagen: 'https://m.media-amazon.com/images/I/61kC5lqiJOL._AC_SX569_.jpg',
    },
    {
      nombre: 'vestido 2',
      precio: 40,
      imagen: 'https://m.media-amazon.com/images/I/61kC5lqiJOL._AC_SX569_.jpg',
    },
    {
      nombre: 'vestido 3',
      precio: 20,
      imagen: 'https://m.media-amazon.com/images/I/61kC5lqiJOL._AC_SX569_.jpg',
    },
    {
      nombre: 'vestido 3',
      precio: 20,
      imagen: 'https://m.media-amazon.com/images/I/61kC5lqiJOL._AC_SX569_.jpg',
    },
  ];
  openModal() {
    this.isViewImagen = true;
  }
  
  closeModal(event: MouseEvent) {
    // Verifica si el clic fue en el fondo y no en la imagen
    if ((event.target as HTMLElement).classList.contains('image-modal')) {
      this.isViewImagen = false;
    }
  }
}
