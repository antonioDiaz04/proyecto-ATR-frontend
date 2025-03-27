import { ActivatedRoute } from '@angular/router';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from "@angular/forms";
import { ProductoService } from "../../../../shared/services/producto.service";
import { MessageService } from 'primeng/api';
import { Location } from '@angular/common';

@Component({
  selector: "app-registo-producto",
  templateUrl: "./registo-producto.component.html",
  styleUrls: ["./registo-producto.component.scss"],
})
export class RegistoProductoComponent implements OnInit {
  @Input() mostrarModalAddVestido!: boolean;

  @Output() mostrarFormulario = new EventEmitter<boolean>(); // Evento para cerrar el modal
  productoId: any | null = null; // Recibe el producto a editar

  productoForm: FormGroup;
  // imagenPrincipal: File | null = null; // Inicializa con null
  imagenesAdicionales: File[] = []; // Inicializa como un array vacío
  // imagenes: { file: File; url: string }[] = []; // Array para almacenar archivos y sus URLs base64
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private productoService: ProductoService,
    private messageService: MessageService,
    private location: Location
  ) {
    this.productoForm = this.fb.group({
      imagenes: this.fb.array([]),
      nombre: ["", [Validators.required]],
      talla: ["", [Validators.required]],
      altura: ["", [Validators.required, Validators.min(30)]],
      cintura: ["", [Validators.required, Validators.min(20)]],
      color: ["", [Validators.required]],
      precio: [0, [Validators.required, Validators.min(0)]],
      opcionesTipoTransaccion: ["Venta", [Validators.required]],
      nuevo: [true],
      tipoCuello: ["", [Validators.required]],
      tipoCola: ["", [Validators.required]],
      tipoCapas: ["", [Validators.required]],
      tipoHombro: ["", [Validators.required]],
      descripcion: [""]
    });
  }



  ngOnInit(): void {
    this.productoId = this.route.snapshot.paramMap.get('id');
    console.log('ID del producto:', this.productoId);
    if (this.productoId) {
      this.productoService.obtenerDetalleProductoById(this.productoId).subscribe(
        (producto) => {
          alert("llego id")
          this.cargarProductoEnFormulario(producto);
          // this.cargarProductoEnFormulario(this.productoId);
        },
        (error) => {
          console.error('Error al cargar el producto:', error);
        }
      );
    }
  }

  cargarProductoEnFormulario(producto: any) {
    // Solo cargamos los campos que están definidos en el FormGroup
    this.productoForm.patchValue({
      nombre: producto.nombre || "",
      talla: producto.talla || "",
      altura: producto.altura || "",
      cintura: producto.cintura || "",
      color: producto.color || "",
      precio: producto.precio || 0,
      opcionesTipoTransaccion: producto.tipoVenta || "Venta", // Asegúrate de que coincida con el campo en el FormGroup
      nuevo: producto.nuevo !== undefined ? producto.nuevo : true, // Valor por defecto si no está definido
      tipoCuello: producto.tipoCuello || "",
      tipoCola: producto.tipoCola || "",
      tipoCapas: producto.tipoCapas || "",
      tipoHombro: producto.tipoHombro || "",
      descripcion: producto.descripcion || "",
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
    { label: 'Otro', value: 'Otro' }
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
    { label: 'Mate', value: 'mate' }
  ];


  // Opciones para el tipo de transacción (Renta o Venta)
  opcionesTipoTransaccion = [
    { label: 'Renta', value: 'renta' },
    { label: 'Venta', value: 'venta' }
  ];

  // Opciones de características del vestido
  opcionesCaracteristicasVestido = {
    tipoCuello: [
      { value: 'cuelloRedondo', label: 'Cuello Redondo' },
      { value: 'cuelloV', label: 'Cuello en V' },
      { value: 'cuelloBarco', label: 'Cuello Barco' },
      { value: 'cuelloAlta', label: 'Cuello Alta' },
      { value: 'cuelloHalter', label: 'Cuello Halter' },
      { value: 'pechoCorazon', label: 'Pecho Corazón' }
    ],
    tipoCola: [
      { value: 'colaCorta', label: 'Cola Corta' },
      { value: 'colaMedia', label: 'Cola Media' },
      { value: 'colaLarga', label: 'Cola Larga' },
      { value: 'colaArrastrando', label: 'Cola Arrastrando' },
      { value: 'sinCola', label: 'Sin Cola' }
    ],
    tipoCapas: [
      { value: 'capaSimple', label: 'Capa Simple' },
      { value: 'capaDoble', label: 'Capa Doble' },
      { value: 'capaConVolantes', label: 'Capa con Volantes' },
      { value: 'capaTranslúcida', label: 'Capa Translúcida' },
      { value: 'sinCapas', label: 'Sin Capas' },
      { value: 'casacadaEnCapa', label: 'Casacada en Capa' }
    ],
    tipoHombro: [
      { value: 'hombroLargo', label: 'Hombro Largo' },
      { value: 'hombroSimple', label: 'Hombro Simple' },
      { value: 'hombroEncampanado', label: 'Hombro Encampanado' },
      { value: 'unHombroLargo', label: 'Un hombro largo y el otro sin' }, // Nueva opción
      { value: 'hombrosCortados', label: 'Hombros cortados (no tapan el brazo)' } // Nueva opción
    ]
  };

  estadoProducto = [
    { label: 'Sí', value: true },
    { label: 'No', value: false }
  ];

  volver() {
    this.location.back();  // Navega a la página anterior
  }
  cerrar() {
    this.mostrarModalAddVestido = false; // Actualizamos el valor para cerrar el modal

    this.mostrarFormulario.emit(false); // Emitimos false para cerrar el modal
  }

  // Lógica común para agregar y editar productos
  onAgregarProducto() {
    const formData = new FormData();
    Object.keys(this.productoForm.value).forEach((key) => {
      formData.append(key, this.productoForm.get(key)?.value);
    });

    // Verificar si hay imágenes
    if (this.imagenesAdicionales && this.imagenesAdicionales.length > 0) {
      this.imagenesAdicionales.forEach((imagen) => {
        formData.append("imagenes", imagen);
      });
    }
    // Verifica el contenido de formData
    // console.log([...formData]); // Esto mostrará el contenido de formData
    // Dependiendo de si estamos editando o agregando, enviamos la solicitud
    this.productoId
      ? this.productoService.editarProducto(this.productoId, formData).subscribe(
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
          console.log("Producto creado exitosamente:", response);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Producto creado exitosamente.',
            life: 3000,
          });
          this.cerrar();
        },
        (err) => {
          console.error("Error al crear el producto:", err);
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
  }


  get imagenes(): FormArray {
    return this.productoForm.get("imagenes") as FormArray;
  }


  // Método para eliminar una imagen del FormArray
  eliminarImagen(index: number): void {
    this.imagenes.removeAt(index); // Elimina la imagen del FormArray
  }


  otrasImagenesChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      Array.from(inputElement.files).forEach((file) => {
        this.imagenesAdicionales.push(file); // Guardar el archivo en el array
        const reader = new FileReader();
        reader.onload = () => {
          this.imagenes.push(this.fb.control(reader.result as string)); // Guardar la vista previa
        };
        reader.readAsDataURL(file);
      });
    }
  }
}
