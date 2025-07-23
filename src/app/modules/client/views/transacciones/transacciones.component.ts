import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-transacciones',
  templateUrl: './transacciones.component.html',
})
export class TransaccionesComponent implements OnInit {
  transacciones: any[] = [];
  totalTransacciones: number = 0;
  loading: boolean = true;

  // Paginación (ahora 5 elementos por página)
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 0;

  // Panel de detalles
  showDetailPanel: boolean = false;
  selectedTransaction: any | null = null;
  reviewForm: FormGroup;
  currentRating: number = 0;

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.reviewForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comentario: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.obtenerTransacciones();
  }

  obtenerTransacciones(): void {
    const userId = '67dd9094ece929a0fadc7fa9'; // ID de usuario hardcodeado
    this.loading = true;
    
    this.http.get<any>(`http://localhost:4000/api/v1/transaccion/user/${userId}?page=${this.currentPage}&limit=${this.itemsPerPage}`)
      .pipe(
        catchError(error => {
          console.error('Error al obtener transacciones:', error);
          this.loading = false;
          return throwError(() => new Error('Error al cargar transacciones'));
        })
      )
      .subscribe({
        next: (response) => {
          this.transacciones = response.data;
          this.totalTransacciones = response.count;
          this.totalPages = Math.ceil(this.totalTransacciones / this.itemsPerPage);
          this.loading = false;
        },
        error: (err) => {
          console.error('Error:', err);
          this.loading = false;
        }
      });
  }

  // Métodos de paginación
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.obtenerTransacciones();
      this.closeDetailPanel();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.obtenerTransacciones();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.obtenerTransacciones();
    }
  }

  getPaginationRange(): number[] {
    const range = [];
    const maxPagesToShow = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let end = Math.min(this.totalPages, start + maxPagesToShow - 1);

    if (end - start + 1 < maxPagesToShow) {
      start = Math.max(1, end - maxPagesToShow + 1);
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  }

  // Métodos para el panel de detalles
  openDetailPanel(transaccion: any): void {
    this.selectedTransaction = transaccion;
    this.showDetailPanel = true;

    if (transaccion.reseñaCliente) {
      this.reviewForm.patchValue({
        rating: transaccion.reseñaCliente.rating,
        comentario: transaccion.reseñaCliente.comentario
      });
      this.currentRating = transaccion.reseñaCliente.rating;
    } else {
      this.reviewForm.reset({ rating: 0, comentario: '' });
      this.currentRating = 0;
    }
  }

  closeDetailPanel(): void {
    this.showDetailPanel = false;
    this.selectedTransaction = null;
  }

  setRating(rating: number): void {
    this.currentRating = rating;
    this.reviewForm.get('rating')?.setValue(rating);
  }

  submitReview(): void {
    if (this.reviewForm.valid && this.selectedTransaction) {
      const reviewData = {
        comentario: this.reviewForm.value.comentario,
        rating: this.reviewForm.value.rating,
        idUsuario: this.selectedTransaction.idUsuario._id,
        idVestido: this.selectedTransaction.idVestido._id,
        fechaReseña: new Date().toISOString()
      };

      this.http.post<any>('http://localhost:4000/api/v1/reseñas', reviewData)
        .pipe(
          catchError(error => {
            console.error('Error al enviar reseña:', error);
            alert('Error al enviar reseña');
            return throwError(() => new Error('Error al enviar reseña'));
          })
        )
        .subscribe({
          next: (response) => {
            alert('¡Reseña enviada con éxito!');
            const index = this.transacciones.findIndex(t => t._id === this.selectedTransaction._id);
            if (index !== -1) {
              this.transacciones[index].reseñaCliente = response.data;
            }
            this.closeDetailPanel();
          },
          error: (err) => {
            console.error('Error:', err);
          }
        });
    }
  }

  // Métodos auxiliares
  getVestidoImagen(transaccion: any): string {
    return transaccion.idVestido?.imagenes?.[0] || 'https://via.placeholder.com/400x600?text=Imagen+no+disponible';
  }

  getStars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }
}