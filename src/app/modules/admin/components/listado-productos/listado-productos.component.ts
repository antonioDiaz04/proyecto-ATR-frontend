import { Component, EventEmitter, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ProductoService } from '../../../../shared/services/producto.service';
import { Producto } from '../../../../shared/models/Producto.model';
import { FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
declare const $: any;

@Component({
  selector: 'app-listado-productos',
  templateUrl: './listado-productos.component.html',
  styleUrls: [
    '../../../../shared/styles/tablePrime.scss',
    '../../../../shared/styles/form.scss',
  ],

})
export class ListadoProductosComponent implements OnInit, OnChanges {
  allProducts: Producto[] = [];
  visible: boolean = false;
  esRenta: boolean = false;
  mostrarModalAddVestido: boolean = false;
  totalRecords: number = 0;
  rows: number = 5; // Número de registros por página
  first: number = 0; // Índice del primer registro de la página actual
  paginatedUser: Producto[] = [];
  filterText: string = '';
  productForm!: FormGroup;
  idProducto!: string;
  productoEditar: any | null = null; // Guardamos el producto que se va a editar



  constructor(private productoS: ProductoService, private router: Router) { }
  abrirModal() {
    console.log("abierto")
    this.mostrarModalAddVestido = true;
  }
  cerrarModal() {
    this.mostrarModalAddVestido = false;
    this.productoEditar = null; // Opcional: resetear el producto en edición
  }
  cerrarModalHandler(mostrar: boolean) {
    this.mostrarModalAddVestido = mostrar;
    
    // Opcional: resetear productoEditar si es necesario
    if (!mostrar) {
      this.productoEditar = null;
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes["mostrarFormulario"]) {
      const newVluesmostrarFormulario = changes["mostrarFormulario"].currentValue;
      this.mostrarModalAddVestido = newVluesmostrarFormulario; // Actualizamos el valor para cerrar el modal

      console.log("mostrarFormulario  en listado producto cambió a:", newVluesmostrarFormulario);
    }

    // Aquí puedes agregar lógica adicional si es necesario
  }


  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.getProductos();
  }


  getProductos() {
    this.productoS.obtenerProductos().subscribe(
      (response) => {
        this.allProducts = response;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  highlightText(text: string): string {
    if (!this.filterText) {
      return text; // Si no hay texto a filtrar, regresa el texto original.
    }

    const regex = new RegExp(`(${this.filterText})`, 'gi'); // Crea una expresión regular para encontrar el texto de búsqueda.
    return text.replace(regex, '<strong>$1</strong>'); // Reemplaza las coincidencias con el texto en negritas.
  }

  onGlobalFilter(event: Event) {
    // const value = event.target as HTMLInputElement;
    const value = (event.target as HTMLInputElement).value.toLowerCase();

    if (value) {
      const filteredData = this.allProducts.filter(
        (c) =>
          c.nombre.toLowerCase().includes(value) ||
          c.categoria.toLowerCase().includes(value) ||
          c.color.toLowerCase().includes(value)
        // c.precio.toLowerCase().includes(value) ||
        // c.colonia.toLowerCase().includes(value)
      );

      this.totalRecords = filteredData.length;
      this.paginatedUser = filteredData.slice(
        this.first,
        this.first + this.rows
      );
    } else {
      this.totalRecords = this.allProducts.length;
      this.paginatedUser = this.allProducts.slice(
        this.first,
        this.first + this.rows
      );

      // this.dt2.filterGlobal(input.value, "contains");
    }
  }

  deleteProduct(id: any) {
    this.idProducto = id;

    $('.basic.test.modal')
      .modal({
        closable: false, // Evita cerrar haciendo clic fuera del modal
        onApprove: () => {
          this.confirmarEliminar(); // Ejecuta la confirmación cuando se aprueba
        },
      })
      .modal('show');
  }

  confirmarEliminar() {
    this.productoS.eliminarProducto(this.idProducto).subscribe((response) => {
      this.getProductos();
      Swal.fire(
        'Eliminado',
        'El producto se ha eliminado correctamente.',
        'success'
      );
      $('.basic.test.modal').modal('hide'); // Cierra el modal después de la eliminación
    });
  }


  editProduct(id: any) {
    this.productoEditar = id; // Guardamos el producto que se va a editar
    this.mostrarModalAddVestido = true; // Mostrar el modal
    this.router.navigate([`admin/control-productos/edit-producto/${id}`]);
  }
  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.updatePaginatedUser();
  }

  updatePaginatedUser() {
    console.log();
    this.paginatedUser = this.allProducts.slice(
      this.first,
      this.first + this.rows
    );
  }
  toggleAvailability(product: any) {
    product.disponibilidad = !product.disponibilidad; // Cambia el estado de disponibilidad
    // Aquí puedes agregar lógica adicional para actualizar el producto en tu backend si es necesario
  }
  justifyOptions = [
    { label: 'Disponible', icon: 'pi pi-check', value: true },
    { label: 'No Disponible', icon: 'pi pi-times', value: false }
  ];
  // Función para truncar el texto
  truncateText(text: string, maxLength: number): string {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...'; // Recorta el texto y agrega puntos suspensivos
    }
    return text; // Devuelve el texto original si no es necesario truncarlo
  }

}
