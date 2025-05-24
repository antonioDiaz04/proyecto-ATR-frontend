import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { ProductService } from './product.service'; // Asegúrate de que esta ruta sea correcta
import { MessageService } from 'primeng/api'; // Para mostrar mensajes de toast
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

interface Product {
  _id: string;
  nombre: string;
  imagenPrincipal: string;
  estado: {
    disponible: boolean;
  };
}

@Component({
  selector: 'app-listado-accesorio',
  templateUrl: './listado-accesorio.component.html',
  providers: [MessageService] // Proveedor para mostrar mensajes
})
export class ListadoAccesorioComponent implements OnInit {
  displayModal: boolean = false; // Controla la visibilidad del modal
  allProducts: Product[] = []; // Lista de todos los productos
  selectedProduct: Product | null = null; // Producto seleccionado para editar
  filterText: string = ''; // Texto para filtrar productos
  rows: number = 10; // Número de filas por página
  first: number = 0; // Página actual
  totalRecords: number = 0; // Total de registros

  constructor(private https:HttpClient, private messageService: MessageService) {}

  ngOnInit() {
    this.getProducts(); // Obtiene la lista de productos al inicializar el componente
  }

  open() {
    this.displayModal = true; // Alterna la visibilidad del modal
    this.selectedProduct = null; // Resetea el producto seleccionado al abrir el modal
  }

  getProducts() {
    this.https.get<any>(`${environment.api}/accesorio/`).subscribe(
      (response) => {
        this.allProducts = response; // Asigna los productos obtenidos a la variable allProducts
        this.totalRecords = response.length; // Actualiza el total de registros
      },
      (error:any) => {
        console.error('Error al obtener los productos', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los productos' });
      }
    );
  }

  onGlobalFilter(event: Event) {
    const searchValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.allProducts = this.allProducts.filter(product => product.nombre.toLowerCase().includes(searchValue));
    if(!searchValue){
      this.getProducts();
    }
  }

  editProduct(product: Product) {
    this.selectedProduct = product; // Establece el producto seleccionado para editar
    this.open(); // Abre el modal para edición
  }
  deleteProduct(product: Product) {
    this.selectedProduct = product; // Establece el producto seleccionado para eliminar
    this.open(); // Abre el modal para confirmación de eliminación
  }

  confirmarEliminar() {
    if (confirm('¿Estás seguro de que deseas eliminar este accesorio?')) {
      // this.productService.deleteProduct(id).subscribe(
      //   () => {
      //     this.getProducts(); // Vuelve a obtener la lista de productos después de eliminar uno
      //     this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Producto eliminado correctamente' });
      //   },
      //   (error) => {
      //     console.error('Error al eliminar el producto', error);
      //     this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el producto' });
      //   }
      // );
    }
  }
  countAvailableProducts() {
    return this.allProducts.filter(product => product.estado.disponible).length; // Cuenta los productos disponibles
  }

  onPageChange(event:any) {
    this.first = event.first; // Actualiza la página actual según el evento de cambio de página
    this.rows = event.rows;   // Actualiza el número de filas según el evento de cambio de página
    this.getProducts();       // Vuelve a obtener los productos (puedes optimizar esto según tu lógica)
  }
}
