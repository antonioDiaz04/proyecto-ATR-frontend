import { ActivatedRoute } from '@angular/router';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  FormControl,
} from '@angular/forms';
import { ProductoService } from '../../../../shared/services/producto.service';
import { MessageService } from 'primeng/api';
import { Location } from '@angular/common';
import { CategoriaService } from '../../../../shared/services/categoria.service';
// import ColorThief from 'colorthief';
// const ColorThief = require('colorthief');
import ColorThief from 'colorthief';

// declare module 'colorthief' {
//   export default class ColorThief {
//     getColor(image: HTMLImageElement | HTMLCanvasElement, quality?: number): [number, number, number];
//     getPalette(image: HTMLImageElement | HTMLCanvasElement, colorCount?: number, quality?: number): [number, number, number][];
//   }
// }

@Component({
  selector: 'app-registo-producto',
  templateUrl: './registo-producto.component.html',
  // styleUrls: ["./registo-producto.component.scss"],
})
export class RegistoProductoComponent implements OnInit {
  @Input() mostrarModalAddVestido!: boolean;
  categorias: any[] = [];
  @Output() mostrarFormulario = new EventEmitter<boolean>(); // Evento para cerrar el modal
  productoId: any | null = null; // Recibe el producto a editar

  productoForm: FormGroup;
  // imagenPrincipal: File | null = null; // Inicializa con null
  imagenesAdicionales: File[] = []; // Inicializa como un array vacío
  // imagenes: { file: File; url: string }[] = []; // Array para almacenar archivos y sus URLs base64
  constructor(
    private categoriaService: CategoriaService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private productoService: ProductoService,
    private messageService: MessageService,
    private location: Location
  ) {
    this.productoForm = this.fb.group({
      imagenes: this.fb.array([]),
      nombre: ['', [Validators.required]],
      // altura: ["", [Validators.required, Validators.min(30)]],
      // cintura: ["", [Validators.required, Validators.min(20)]],
      color: [], // ← array vacío para múltiples colores,
      precioAnterior: [0, [Validators.required, Validators.min(0)]],
      precioActual: [0, [Validators.required, Validators.min(0)]],
      costoRenta: [0, [Validators.required, Validators.min(0)]],
      mostrarPrecioAnterior: [false], // Checkbox desactivado por defecto
      opcionesTipoTransaccion: ['Venta', [Validators.required]],
      nuevo: [true],
      tipoCuello: ['', [Validators.required]],
      tipoCola: ['', [Validators.required]],
      tipoCapas: ['', [Validators.required]],
      tipoHombro: ['', [Validators.required]],
      descripcion: [''],
      idCategoria: ['', Validators.required], // Agregar este control
    });
  }

  mostrarPrecioAnterior: boolean = false;
  togglePrecioAnterior() {
    const mostrar = this.productoForm.get('mostrarPrecioAnterior')?.value;
    const precioAnteriorCtrl = this.productoForm.get('precioAnterior');

    if (mostrar) {
      this.mostrarPrecioAnterior = mostrar;
      precioAnteriorCtrl?.setValidators([Validators.required]); // Hacerlo obligatorio si se activa
    } else {
      this.mostrarPrecioAnterior = false;
      precioAnteriorCtrl?.clearValidators();
    }
    precioAnteriorCtrl?.updateValueAndValidity();
  }

  ngOnInit(): void {
    this.productoId = this.route.snapshot.paramMap.get('id');
    console.log('ID del producto:', this.productoId);

    // Obtener categorías
    this.obtenerCategorias();

    if (this.productoId) {
      this.productoService
        .obtenerDetalleProductoById(this.productoId)
        .subscribe(
          (producto) => {
            alert('llego id');
            this.cargarProductoEnFormulario(producto);
          },
          (error) => {
            console.error('Error al cargar el producto:', error);
          }
        );
    }
  }

  obtenerCategorias(): void {
    this.categoriaService.obtenerCategorias().subscribe(
      (categorias) => {
        this.categorias = categorias;
      },
      (error) => {
        console.error('Error al obtener categorías:', error);
      }
    );
  }

  cargarProductoEnFormulario(producto: any) {
    // Solo cargamos los campos que están definidos en el FormGroup
    this.productoForm.patchValue({
      nombre: producto.nombre || '',
      talla: producto.talla || '',
      // altura: producto.altura || "",
      // cintura: producto.cintura || "",
      color: producto.color || '',
      precio: producto.precio || 0,
      opcionesTipoTransaccion: producto.tipoVenta || 'Venta', // Asegúrate de que coincida con el campo en el FormGroup
      nuevo: producto.nuevo !== undefined ? producto.nuevo : true, // Valor por defecto si no está definido
      tipoCuello: producto.tipoCuello || '',
      tipoCola: producto.tipoCola || '',
      precioAnterior: producto.precioAnterior || 0,
      precioActual: producto.precioActual || 0,
      costoRenta: producto.costoRenta || 0,
      mostrarPrecioAnterior: producto.mostrarPrecioAnterior, // Checkbox desactivado por defecto
      tipoCapas: producto.tipoCapas || '',
      tipoHombro: producto.tipoHombro || '',
      descripcion: producto.descripcion || '',
      idCategoria: producto.idCategoria || '',
    });

    // Limpiamos el array de imágenes y cargamos las nuevas si existen
    this.imagenes.clear();
    if (producto.imagenes && producto.imagenes.length > 0) {
      producto.imagenes.forEach((img: string) => {
        this.imagenes.push(this.fb.control(img));
      });
    }
  }

  tallas = [
    { label: 'XS', value: 'XS' },
    { label: 'S', value: 'S' },
    { label: 'M', value: 'M' },
    { label: 'L', value: 'L' },
    { label: 'XL', value: 'XL' },
    { label: 'XXL', value: 'XXL' },
    { label: 'Otro', value: 'Otro' },
  ];
  colores = [
    // Colores básicos
    { label: 'Blanco', value: 'blanco' },
    { label: 'Negro', value: 'negro' },
    { label: 'Gris', value: 'gris' },
    { label: 'Beige', value: 'beige' },
    { label: 'Cremas', value: 'crema' },

    // Colores primarios y secundarios
    { label: 'Rojo', value: 'rojo' },
    { label: 'Azul', value: 'azul' },
    { label: 'Amarillo', value: 'amarillo' },
    { label: 'Verde', value: 'verde' },
    { label: 'Naranja', value: 'naranja' },
    { label: 'Morado', value: 'morado' },
    { label: 'Rosa', value: 'rosa' },

    // Tonos pastel
    { label: 'Rosa Pastel', value: 'rosaPastel' },
    { label: 'Azul Pastel', value: 'azulPastel' },
    { label: 'Lavanda', value: 'lavanda' },
    { label: 'Menta', value: 'menta' },
    { label: 'Melocotón', value: 'melocoton' },

    // Tonos tierra
    { label: 'Marrón', value: 'marron' },
    { label: 'Caqui', value: 'caqui' },
    { label: 'Terracota', value: 'terracota' },
    { label: 'Ocre', value: 'ocre' },
    { label: 'Caramelo', value: 'caramelo' },

    // Colores metálicos
    { label: 'Dorado', value: 'dorado' },
    { label: 'Plateado', value: 'plateado' },
    { label: 'Bronce', value: 'bronce' },
    { label: 'Cobre', value: 'cobre' },

    // Colores vibrantes
    { label: 'Fucsia', value: 'fucsia' },
    { label: 'Turquesa', value: 'turquesa' },
    { label: 'Esmeralda', value: 'esmeralda' },
    { label: 'Rubí', value: 'rubi' },
    { label: 'Zafiro', value: 'zafiro' },

    // Patrones y estampados
    { label: 'Estampado Floral', value: 'estampadoFloral' },
    { label: 'Rayas', value: 'rayas' },
    { label: 'Cuadros', value: 'cuadros' },
    { label: 'Puntos', value: 'puntos' },
    { label: 'Animal Print', value: 'animalPrint' },

    // Degradados y efectos
    { label: 'Degradé', value: 'degrade' },
    { label: 'Ombré', value: 'ombre' },
    { label: 'Satinado', value: 'satinado' },
    { label: 'Brillante', value: 'brillante' },
    { label: 'Mate', value: 'mate' },
  ];

  // Opciones para el tipo de transacción (Renta o Venta)
  opcionesTipoTransaccion = [
    { label: 'Renta', value: 'renta' },
    { label: 'Venta', value: 'venta' },
  ];

  // Opciones de características del vestido
  opcionesCaracteristicasVestido = {
    tipoCuello: [
      { value: 'cuelloRedondo', label: 'Cuello Redondo' },
      { value: 'cuelloRecto', label: 'Cuello recto' },
      { value: 'cuelloV', label: 'Cuello en V' },
      { value: 'strapless', label: 'Cuello en strapless' },
      { value: 'drapeado', label: 'Cuello drapeado' },
      { value: 'CuelloVProfundo', label: 'Cuello en V Profundo' },
      { value: 'halter Joya', label: 'halter Joya' },
      { value: 'cuelloBarco', label: 'Cuello Barco' },
      { value: 'cuelloAlta', label: 'Cuello Alta' },
      { value: 'cuelloHalter', label: 'Cuello Halter' },
      { value: 'pechoCorazon', label: 'Pecho Corazón' },
    ],
    tipoCola: [
      { value: 'colaCorta', label: 'Cola Corta' },
      { value: 'colaMedia', label: 'Cola Media' },
      { value: 'colaLarga', label: 'Cola Larga' },
      { value: 'colaArrastrando', label: 'Cola Arrastrando' },
      { value: 'sinCola', label: 'Sin Cola' },
    ],
    tipoCapas: [
      { value: 'capaSimple', label: 'Capa Simple' },
      { value: 'capaDoble', label: 'Capa Doble' },
      { value: 'capaConVolantes', label: 'Capa con Volantes' },
      { value: 'capaTranslúcida', label: 'Capa Translúcida' },
      { value: 'casacadaEnCapa', label: 'Casacada en Capa' },
      { value: 'sinCapas', label: 'Sin Capas' },
    ],
    tipoHombro: [
      { value: 'hombroLargo', label: 'Hombro Largo' },
      { value: 'hombroSimple', label: 'Hombro Simple' },
      { value: 'hombroEncampanado', label: 'Hombro Encampanado' },
      {
        value: 'hombrosCortados',
        label: 'Hombros cortados (no tapan el brazo)',
      },
      { value: 'unHombroLargo', label: 'Un hombro largo y el otro sin hombro' },

      { value: 'mangaCortaAbullonada', label: 'Manga Corta Abullonada' },
      { value: 'mangaLarga', label: 'Manga Larga' },
      { value: 'tirantesAnchos', label: 'Tirantes Anchos' },
      { value: 'tirantesDelgados', label: 'tirantes Delgados' },
      { value: 'descubiertoConTiras', label: 'Descubierto Con Tiras' },
      { value: 'sinHombro', label: 'sin Hombro' },
    ],
  };

  estadoProducto = [
    { label: 'Sí', value: true },
    { label: 'No', value: false },
  ];

  volver() {
    this.location.back(); // Navega a la página anterior
  }
  cerrar() {
    this.mostrarModalAddVestido = false; // Actualizamos el valor para cerrar el modal

    this.mostrarFormulario.emit(false); // Emitimos false para cerrar el modal
  }

  // Lógica común para agregar y editar productos
  onAgregarProducto() {
    console.log(this.productoForm.value);
    // Verificar colores seleccionados
    const coloresSeleccionados = this.productoForm.get('color')?.value || [];
    if (
      coloresSeleccionados.length === 0 &&
      this.colorDetectadoHex.length > 0
    ) {
      this.productoForm.get('color')?.setValue([...this.colorDetectadoHex]);
      console.log('Colores asignados automáticamente:', this.colorDetectadoHex);
    }
    const formData = new FormData();
    Object.keys(this.productoForm.value).forEach((key) => {
      formData.append(key, this.productoForm.get(key)?.value);
    });

    // Verificar si hay imágenes
    if (this.imagenesAdicionales && this.imagenesAdicionales.length > 0) {
      this.imagenesAdicionales.forEach((imagen) => {
        formData.append('imagenes', imagen);
      });
    }
    // Verifica el contenido de formData
    // console.log([...formData]); // Esto mostrará el contenido de formData
    // Dependiendo de si estamos editando o agregando, enviamos la solicitud
    this.productoId
      ? this.productoService
          .editarProducto(this.productoId, formData)
          .subscribe(
            (response) => {
              // console.log("Producto editado exitosamente:", response);
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Producto editado exitosamente.',
                life: 3000,
              });
              this.volver();
            },
            (err) => {
              // console.error("Error al editar el producto:", err);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Ocurrió un error al editar el producto.',
                life: 3000,
              });
            }
          )
      : this.productoService.crearProducto(formData).subscribe(
          (response) => {
            console.log('Producto creado exitosamente:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Producto creado exitosamente.',
              life: 3000,
            });
            this.cerrar();
          },
          (err) => {
            console.error('Error al crear el producto:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Ocurrió un error al crear el producto.',
              life: 3000,
            });
          }
        );
  }

  // Método para vaciar todo el array de imágenes
  clearAllImages() {
    this.imagenes.clear(); // Vacía el FormArray
    this.colorDetectadoHex = [];
  }

  get imagenes(): FormArray {
    return this.productoForm.get('imagenes') as FormArray;
  }

  // Método para eliminar una imagen del FormArray
  eliminarImagen(index: number): void {
    this.imagenes.removeAt(index); // Elimina la imagen del FormArray
  }

  otrasImagenesChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (!inputElement.files || inputElement.files.length === 0) return;

    Array.from(inputElement.files).forEach((file) => {
      this.imagenesAdicionales.push(file);

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        this.imagenes.push(this.fb.control(base64));

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = base64;

        // img.onload = () => {
        //   try {
        //     const colorThief = new ColorThief();
        //     const palette: number[][] = colorThief.getPalette(img, 6); // Tipado explícito

        //     const hexColors = palette.map(
        //       (rgb: any[]) =>
        //         `#${rgb.map((c) => c.toString(16).padStart(2, '0')).join('')}`
        //     );

        //     this.colorDetectadoHex = Array.from(
        //       new Set([...this.colorDetectadoHex, ...hexColors])
        //     );
        //   } catch (error) {
        //     console.error('Error al extraer colores:', error);
        //   }
        // };
        img.onload = () => {
          try {
            const colorThief = new ColorThief();
            const dominantColor: number[] = colorThief.getColor(img); // ← solo 1 color

            const colorNombre = this.getClosestNamedColor(dominantColor); // usamos función de similitud
            this.productoForm.get('color')?.setValue(colorNombre);
          } catch (error) {
            console.error('Error al extraer color dominante:', error);
          }
        };
      };

      reader.readAsDataURL(file);
    });
  }

  onTipoTransaccionChange(event: any) {
    // Lógica para manejar el cambio si es necesario
    // El campo ya se muestra/oculta automáticamente basado en el valor del formulario
  }

  colorDetectadoHex: string[] = [];

  convertRGBToHex(rgb: number[]): string {
    return `#${rgb.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
  }

  async extraerColores(imagen: string) {
    return new Promise<string[]>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imagen;
      img.onload = () => {
        const colorThief = new ColorThief();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const palette = colorThief.getPalette(img, 6); // extrae hasta 6 colores
        const hexColors = palette.map(this.convertRGBToHex);
        resolve(hexColors);
      };
    });
  }

  // Elimina un color específico
  eliminarColor(color: string): void {
    this.colorDetectadoHex = this.colorDetectadoHex.filter((c) => c !== color);

    const currentColors = this.productoForm.get('color')?.value || [];
    const nuevosColores = currentColors.filter((c: any) => c !== color);
    this.productoForm.get('color')?.setValue(nuevosColores);
  }

  // Elimina todos los colores no seleccionados
  eliminarColoresNoSeleccionados(): void {
    const seleccionados = this.productoForm.get('color')?.value || [];
    this.colorDetectadoHex = this.colorDetectadoHex.filter((c) =>
      seleccionados.includes(c)
    );
  }
  // Alterna un color en la selección múltiple
  toggleColorSeleccionado(color: string): void {
    const currentColors = this.productoForm.get('color')?.value || [];
    const index = currentColors.indexOf(color);

    if (index >= 0) {
      currentColors.splice(index, 1); // lo deselecciona
    } else {
      currentColors.push(color); // lo selecciona
    }

    this.productoForm.get('color')?.setValue([...currentColors]);
  }

  getClosestNamedColor(rgb: number[]): string {
    const colorMap: { [key: string]: number[] } = {
      Blanco: [255, 255, 255],
      Negro: [0, 0, 0],
      Gris: [128, 128, 128],
      Rojo: [255, 0, 0],
      Verde: [0, 128, 0],
      Azul: [0, 0, 255],
      Amarillo: [255, 255, 0],
      Morado: [128, 0, 128],
      Rosa: [255, 192, 203],
      Fucsia: [255, 0, 255],
      Dorado: [255, 215, 0],
      Plateado: [192, 192, 192],
      Beige: [245, 245, 220],
      Café: [139, 69, 19],
    };

    let closest = '';
    let minDist = Infinity;

    for (const [name, val] of Object.entries(colorMap)) {
      const dist = Math.sqrt(
        Math.pow(rgb[0] - val[0], 2) +
          Math.pow(rgb[1] - val[1], 2) +
          Math.pow(rgb[2] - val[2], 2)
      );
      if (dist < minDist) {
        minDist = dist;
        closest = name;
      }
    }

    return closest;
  }

  // Verifica si un color está seleccionado
  estaSeleccionado(color: string): boolean {
    const currentColors = this.productoForm.get('color')?.value || [];
    return currentColors.includes(color);
  }
}
