import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Aos from 'aos';
import { ReseniaService } from '../../../../shared/services/resenia.service';

interface Usuario {
  nombre: string;
  avatar: string;
}

interface Resenia {
  _id: string;
  usuario: Usuario;
  calificacion: number;
  contenido: string;
  fecha: string;
  correo?: string;
  estado?: 'pendiente' | 'aprobada' | 'rechazada';
}

interface Pregunta {
  _id: string;
  usuario: Usuario;
  pregunta: string;
  respuesta?: string;
  fecha: string;
  correo?: string;
}
@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.component.html',
  // styleUrl: './notificaciones.component.scss'
})
export class NotificacionesComponent implements OnInit {
  activeTab: string = 'reviews'; // Tab activo por defecto
  tabs: { name: string; icon: string }[] = [
    { name: 'reviews', icon: 'fa-solid fa-star' },
    { name: 'preguntas', icon: 'fa-solid fa-question' },
    { name: 'notificaciones', icon: 'fa-solid fa-bell' }
  ];
  allSelected: boolean = false;
 

  reviewForm!: FormGroup;
  questionForm!: FormGroup;
  notificationForm!: FormGroup;


  constructor(private fb: FormBuilder, private reseniaService: ReseniaService) {
    this.reviewForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      calificacion: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      contenido: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(500)]]
    });
  }

  ngOnInit() {
    this.obtenerTodasResenias();
    // Al iniciar la carga, vaciamos el array de productos
    Aos.init({
      duration: 650, // Duración de la animación en milisegundos
      once: true, // Si `true`, la animación solo se ejecuta una vez
    });

  }
  reviews: Resenia[] = [];
  questions: Pregunta[] = [];
  obtenerTodasResenias() {
    this.reseniaService.obtenerTodasResenias().subscribe(
      (resenias: any[]) => {
        this.reviews = resenias;
      },
      (error) => {
        console.error('Error al obtener reseñas aceptadas:', error);
      }
    );
  }
  selectedIds: string[] = [];
  toggleSelection(id: string) {
    const index = this.selectedIds.indexOf(id);
    if (index > -1) {
      this.selectedIds.splice(index, 1);
    } else {
      this.selectedIds.push(id);
    }
    // this.allSelected = this.pendingReviews.length > 0 &&
    //   this.selectedIds.length === this.pendingReviews.length;
  }

  isSelected(id: string): boolean {
    return this.selectedIds.includes(id);
  }

  toggleSelectAll() {
    if (this.allSelected) {
      this.selectedIds = [];
    } 
    this.allSelected = !this.allSelected;
  }

  // Método para eliminar reseñas seleccionadas
  eliminarReseniasSeleccionadas() {
    if (this.selectedIds.length > 0) {
      if (confirm('¿Estás seguro de eliminar las reseñas seleccionadas?')) {
        this.reseniaService.eliminarReseniasSeleccionadas(this.selectedIds).subscribe(
          () => {
            this.obtenerTodasResenias(); // Actualizar la lista después de eliminar
            // Actualizar la lista después de eliminar
            // this.pendingReviews = this.pendingReviews.filter(
            //   review => !this.selectedIds.includes(review.id)
            // );
            this.selectedIds = [];
            this.allSelected = false;
            alert('Reseñas eliminadas correctamente');
          },
          (error) => {
            console.error('Error al eliminar reseñas:', error);
            alert('Error al eliminar reseñas');
          }
        );
      }
    } else {
      alert('Por favor selecciona al menos una reseña');
    }
  }







  onSubmit() {
    alert('Reseña paso la validacion');
    if (this.reviewForm.valid) {
      alert('Reseña no paso la validacion');
      const nuevaReseña: any = {
        id: this.reviews.length + 1,
        usuario: {
          nombre: "Tú",
          avatar: "https://randomuser.me/api/portraits/women/43.jpg"
        },
        calificacion: this.reviewForm.value.calificacion!,
        contenido: this.reviewForm.value.contenido!,
        fecha: new Date().toISOString().split('T')[0],
        correo: this.reviewForm.value.correo!
      };


      // Aquí puedes enviar la nueva reseña a tu backend
      this.reseniaService.crearResenia(nuevaReseña).subscribe(
        (response: any) => {
          // this.reviews.unshift(nuevaReseña);
          // this.reviewForm.reset({ rating: 5 });

          alert('Reseña creada:' + response);
          this.reviews.unshift(response); // Agregar la reseña al inicio del array
          this.reviewForm.reset({ rating: 5 });
        },
        error => {
          alert('Error al crear la reseña:' + error);
        }
      );
      this.reviewForm.reset();
      // Reiniciar el formulario a su estado inicial
      this.obtenerTodasResenias();

      // Aquí iría la lógica para enviar a tu backend
      console.log('New review submitted:', nuevaReseña);
    }
  }



  // 
  cargarPreguntas() {
    // Mock data
    this.questions = [
      {
        _id: "1",
        usuario: { nombre: 'Carlos M.', avatar: 'assets/images/avatars/3.jpg' },
        pregunta: '¿Hacen ajustes a los vestidos?',
        respuesta: 'Sí, ofrecemos servicio de ajustes con 48h de anticipación.',
        fecha: '2023-06-10'
      }
    ];
  }

  getStars(rating: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < rating);
  }

  submitReview() {
    if (this.reviewForm.valid) {
      // Submit logic here
      console.log('Review submitted:', this.reviewForm.value);
      this.reviewForm.reset({ calificacion: 5 });
    }
  }

  submitQuestion() {
    if (this.questionForm.valid) {
      // Submit logic here
      console.log('Question submitted:', this.questionForm.value);
      this.questionForm.reset();
    }
  }

  sendNotification() {
    if (this.notificationForm.valid) {
      // Submit logic here
      console.log('Notification sent:', this.notificationForm.value);
      this.notificationForm.reset();
    }
  }

  approveReview(review: Resenia) {
    // Update status to approved
    review.estado = 'aprobada';
    this.reseniaService.actualizarResenia(review._id, 'aprobada').subscribe(
      (response) => {
        this.obtenerTodasResenias(); // Refresh the list after approval
        alert('Reseña aprobada:' + response);
        // Optionally refresh the list or show a success message
      },
      error => {
        alert('Error al aprobar la reseña:' + error);
      }
    );
    // Service call to update status
  }


  rejectReview(review: Resenia) {
    review.estado = 'rechazada';
    this.reseniaService.actualizarResenia(review._id, 'rechazada').subscribe(
      (response) => {
        this.obtenerTodasResenias();
        alert('Reseña rechazada: ' + response);
      },
      error => {
        alert('Error al rechazar la reseña: ' + error);
      }
    );
  }
  
}





