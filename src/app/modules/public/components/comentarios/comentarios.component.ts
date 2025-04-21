import { AfterViewInit, Component } from '@angular/core';
declare var $:any;
@Component({
  selector: 'app-comentarios',
  templateUrl: './comentarios.component.html',
  styleUrl: './comentarios.component.scss'
})
export class ComentariosComponent implements AfterViewInit{
// Objeto con las reseñas y calificaciones de usuarios
reviews = [
  { usuario: 'Atacante', description: 'Contenido<script>alert("XSS Attack!");</script> XSS', rating: 1 },
  { usuario: 'Intruso', description: '<img src="x" onerror="alert(\'Hackeado!\')">', rating: 2 },
  { usuario: 'Atacante', description: '<iframe src="javascript:alert(\'XSS!\')"></iframe>', rating: 3 },
];



// Inicializar el componente de rating después de que la vista se haya cargado
ngAfterViewInit() {
  $('.ui.rating').rating();
}
}
