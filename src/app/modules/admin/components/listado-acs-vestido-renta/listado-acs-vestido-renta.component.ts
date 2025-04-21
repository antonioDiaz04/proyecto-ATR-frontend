// listado-acs-vestido-renta.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface Accesorio {
  _id: string;
  nombre: string;
  imagenPrincipal: string;
}

interface Vestido {
  _id: string;
  nombre: string;
  imagenes: string;
  categoria: string;
  precio: number;
}

interface Relacion {
  _id: string;
  vestido: Vestido;
  accesorios: Accesorio[];
}

@Component({
  selector: 'app-listado-acs-vestido-renta',
  templateUrl: './listado-acs-vestido-renta.component.html',
  styleUrls: [

  '../../../../shared/styles/tablePrime.scss'
]
})
export class ListadoAcsVestidoRentaComponent implements OnInit {
  allProducts: Relacion[] = []; // Cambia el tipo a Relacion
  filterText = ''; // Texto para filtrar productos

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getRelaciones(); // Obtiene las relaciones al inicializar el componente
  }

  getRelaciones() {
    this.http.get<Relacion[]>(`${environment.api}/vestidos-accesorios`).subscribe(
      (response) => {
        this.allProducts = response; // Asigna las relaciones obtenidas a allProducts
      },
      (error) => {
        console.error('Error al obtener las relaciones', error);
      }
    );
  }

  onGlobalFilter(event:any) {
    const searchValue = event.target.value.toLowerCase();
    this.allProducts = this.allProducts.filter(producto =>
      producto.vestido.nombre.toLowerCase().includes(searchValue) ||
      // producto.vestido.imagenes.toLowerCase().includes(searchValue) ||
      producto.accesorios.some(ac => ac.nombre.toLowerCase().includes(searchValue))
    );
  }

  editProduct(producto: Relacion) {
    // Implementa la lógica para editar el producto
    // Por ejemplo, podrías abrir un modal con el formulario de edición
    console.log('Editar producto:', producto);
    // Aquí podrías implementar la lógica para abrir un modal de edición
    // o redirigir a una página de edición con el ID del producto
  }

  deleteProduct(id: string) {
    if (confirm("¿Estás seguro de que deseas eliminar esta relación?")) {
      this.http.delete(`${environment.api}/vestidos-accesorios/${id}`).subscribe(
        () => {
          // Eliminar el producto de la lista local después de la eliminación en el servidor
          this.allProducts = this.allProducts.filter(producto => producto._id !== id);
          alert("Relación eliminada con éxito.");
        },
        (error) => {
          console.error('Error al eliminar la relación', error);
          alert("Ocurrió un error al eliminar la relación.");
        }
      );
    }
  }
}
