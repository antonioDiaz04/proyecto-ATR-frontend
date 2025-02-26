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
import { FormBuilder, FormGroup, FormArray, Validators } from "@angular/forms";
import { ProductoService } from "../../../../shared/services/producto.service";

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

  imagenPrincipal: File | null = null; // Inicializa con null
  imagenesAdicionales: File[] = []; // Inicializa como un array vacío

  constructor(
    private route:ActivatedRoute, 
    private fb: FormBuilder,
    private productoService: ProductoService,
  ) {
    this.productoForm = this.fb.group({
      nombre: ["", [Validators.required]],
      imagenPrincipal: [""],
      otrasImagenes: this.fb.array([]),
      categoria: ["venta", [Validators.required]],
      color: ["", [Validators.required]],
      textura: [""],
      talla: ["", [Validators.required]],
      altura: ["", [Validators.required, Validators.min(30)]],
      cintura: ["", [Validators.required, Validators.min(20)]],
      precio: [0, [Validators.required, Validators.min(0)]],
      disponible: [true],
      tipoVenta: ["Venta", [Validators.required]],
      nuevo: [true],
      descripcion: [""],
    });
  }

  // ngOnChanges(changes: SimpleChanges): void {
  //   if (changes["mostrarModalAddVestido"]) {
  //     const newValues = changes["mostrarModalAddVestido"].currentValue;
  //     this.mostrarModalAddVestido = newValues;
  //   }

  //   if (changes["productoId"] && this.productoId) {
  //     this.productoService.obtenerDetalleProductoById(this.productoId).subscribe(
  //       (producto) => {
  //         alert("llego id")
  //         this.cargarProductoEnFormulario(producto);
  //         // this.cargarProductoEnFormulario(this.productoId);
  //       },
  //       (error) => {
  //         console.error('Error al cargar el producto:', error);
  //       }
  //     );
  //   }
  // }

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
    this.productoForm.patchValue({
      nombre: producto.nombre,
      imagenPrincipal: producto.imagenPrincipal || "",
      categoria: producto.categoria,
      color: producto.color,
      textura: producto.textura,
      talla: producto.tallaDisponible ,
      altura: producto.altura,
      cintura: producto.cintura,
      precio: producto.precio,
      disponible: producto.disponible,
      tipoVenta: producto.tipoVenta,
      nuevo: producto.nuevo,
      descripcion: producto.descripcion,
    });

    this.otrasImagenes.clear();
    if (producto.otrasImagenes && producto.otrasImagenes.length > 0) {
      producto.otrasImagenes.forEach((img: string) => {
        this.otrasImagenes.push(this.fb.control(img));
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
    { label: 'Azul', value: 'azul' },
    { label: 'Rojo', value: 'rojo' },
    { label: 'Verde', value: 'verde' },
    { label: 'Negro', value: 'negro' },
    { label: 'Blanco', value: 'blanco' },
    { label: 'Amarillo', value: 'amarillo' },
    { label: 'Morado', value: 'morado' }
  ];

  categorias = [
    { label: 'Venta', value: 'venta' },
    { label: 'Renta', value: 'renta' }
  ];

  tiposVenta = [
    { label: 'Venta', value: 'venta' },
    { label: 'Renta', value: 'renta' }
  ];
  estadoProducto = [
    { label: 'Sí', value: true },
    { label: 'No', value: false }
  ];

  eliminarImagenPrincipal() {
    // Reiniciar el valor de la imagen principal en el formulario a vacío
    this.productoForm.patchValue({
      imagenPrincipal: "",
    });

    // También reiniciar la variable de la imagen principal
    this.imagenPrincipal = null; // Restablece la imagen seleccionada a null

    // Puedes agregar aquí cualquier otra lógica adicional que necesites, como borrar el archivo de la imagen si es necesario
    console.log("Imagen principal eliminada");
  }

  get otrasImagenes(): FormArray {
    return this.productoForm.get("otrasImagenes") as FormArray;
  }

  cerrar() {
    this.mostrarFormulario.emit(false); // Emitimos false para cerrar el modal
  }

  // Lógica común para agregar y editar productos
  onAgregarProducto() {
    if (this.productoForm.invalid) {
      console.error("Formulario inválido");
      return;
    }

    const formData = new FormData();
    Object.keys(this.productoForm.value).forEach((key) => {
      formData.append(key, this.productoForm.get(key)?.value);
    });

    // Verificar si hay imágenes
    if (!this.imagenPrincipal) {
      console.error(
        "No se ha seleccionado ningún archivo para la imagen principal."
      );
      return;
    }
    formData.append("imagenPrincipal", this.imagenPrincipal);

    if (this.imagenesAdicionales && this.imagenesAdicionales.length > 0) {
      this.imagenesAdicionales.forEach((imagen) => {
        formData.append("otrasImagenes", imagen);
      });
    }

    // Dependiendo de si estamos editando o agregando, enviamos la solicitud
    if (this.productoId) {
      // Lógica de edición
      this.productoService
        .editarProducto(this.productoId, formData)
        .subscribe(
          (response) => {
            console.log("Producto editado exitosamente:", response);
            this.cerrar();
          },
          (err) => {
            console.error("Error al editar el producto:", err);
          }
        );
    } else {
      // Lógica de agregar
      this.productoService.crearProducto(formData).subscribe(
        (response) => {
          console.log("Producto creado exitosamente:", response);
          this.cerrar();
        },
        (err) => {
          console.error("Error al crear el producto:", err);
        }
      );
    }
  }

  onImagePrincipalChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.productoForm.patchValue({
          imagenPrincipal: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  }

  agregarImagen() {
    this.otrasImagenes.push(this.fb.control(""));
  }

  eliminarImagen(index: number) {
    this.otrasImagenes.removeAt(index);
  }

  onFileSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      this.imagenPrincipal = inputElement.files[0];
      const file = inputElement.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.productoForm.patchValue({
          imagenPrincipal: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  }

  otrasImagenesChange(event: Event, index: number): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      const file = inputElement.files[0];
      this.imagenesAdicionales[index] = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.otrasImagenes.at(index).setValue(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }
}
