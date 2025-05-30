import { AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
declare var $: any;
import AOS from 'aos';
import { ReseniaService } from '../../../../shared/services/resenia.service';


interface Usuario {
  nombre: string;
  avatar: string;
}

interface Resenia {
  id: number;
  usuario: Usuario;
  calificacion: number;
  contenido: string;
  fecha: string;
  correo?: string;
}
@Component({
  selector: 'app-comentarios',
  templateUrl: './comentarios.component.html',
  styleUrl: './comentarios.component.scss'
})
export class ComentariosComponent implements OnInit,AfterViewInit {
  
  
  
  
  reviewForm!: FormGroup;


  constructor(private fb: FormBuilder, private reseniaService: ReseniaService) {
    this.reviewForm = this.fb.group({
      nombre: ['', [Validators.required,Validators.min(1), Validators.max(5)]],
      correo: ['', [Validators.required, Validators.email]],
      calificacion: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      contenido: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(500)]]
    });
  }

  ngOnInit() {
    this.obtnerReseniasAceptadas();
    // Al iniciar la carga, vaciamos el array de productos
    AOS.init({
      duration: 650, // Duración de la animación en milisegundos
      once: true, // Si `true`, la animación solo se ejecuta una vez
    });

  }
  reviews: Resenia[] = [];
  obtnerReseniasAceptadas() {
    this.reseniaService.obtenerReseniasAceptadas().subscribe(
      (resenias: any[]) => {
        this.reviews = resenias;
      },
      (error) => {
        console.error('Error al obtener reseñas aceptadas:', error);
      }
    );
  }



  getStars(rating: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < rating);
  }


  onSubmit() {
    alert('Reseña paso la validacion');
    if (this.reviewForm.valid) {
      alert('Reseña no paso la validacion');
      const nuevaReseña: any = {
        id: this.reviews.length + 1,
        usuario: {
          nombre: this.reviewForm.value.nombre,
          avatar: "https://randomuser.me/api/portraits/women/43.jpg"
        },
        calificacion: this.reviewForm.value.calificacion!,
        contenido: this.reviewForm.value.contenido!,
        fecha: new Date().toISOString().split('T')[0],
        correo: this.reviewForm.value.correo!
      };


      // Aquí puedes enviar la nueva reseña a tu backend
      this.reseniaService.crearResenia(nuevaReseña).subscribe(
        (response:any) => {
          // this.reviews.unshift(nuevaReseña);
          // this.reviewForm.reset({ rating: 5 });

          alert('Reseña creada:'+ response);
          // this.reviews.unshift(response); // Agregar la reseña al inicio del array
          this.reviewForm.reset({ rating: 5 });
        },
        error => {
          alert('Error al crear la reseña:'+error);
        }
      );
      this.reviewForm.reset();
      // Reiniciar el formulario a su estado inicial
      this.obtnerReseniasAceptadas();

      // Aquí iría la lógica para enviar a tu backend
      console.log('New review submitted:', nuevaReseña);
    }
  }

  @ViewChild('reviewsContent') reviewsContent!: ElementRef;
@ViewChildren('reviewCard') reviewCards!: QueryList<ElementRef>;

ngAfterViewInit() {
  this.checkScroll();
}

onReviewsScroll() {
  this.checkScroll();
}

checkScroll() {
  const container = this.reviewsContent.nativeElement;
  const cards = this.reviewCards.toArray();
  
  if (cards.length === 0) return;

  const lastCard = cards[cards.length - 1].nativeElement;
  const lastCardRect = lastCard.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  // Verificar si la última tarjeta está completamente visible
  const isLastCardFullyVisible = lastCardRect.bottom <= containerRect.bottom;

  // Añadir/remover clase según sea necesario
  if (isLastCardFullyVisible) {
    container.classList.add('mask-disabled');
  } else {
    container.classList.remove('mask-disabled');
  }
}

}
