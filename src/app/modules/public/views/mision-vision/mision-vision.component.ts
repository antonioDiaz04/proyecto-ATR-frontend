import { Component, OnInit } from '@angular/core';
import AOS from 'aos';

@Component({
  selector: 'app-mision-vision',
  templateUrl: './mision-vision.component.html',
  // styleUrl: './mision-vision.component.scss'
})
export class MisionVisionComponent implements OnInit{
  // Datos de Misión y Visión
  cards = [
    {
      icon: 'https://static.vecteezy.com/system/resources/previews/020/045/403/large_2x/business-mission-flat-icon-symbol-symbol-free-vector.jpg', // Ruta a tu imagen
      title: 'Misión',
      content: 'Ofrecer productos de alta calidad con diseños exclusivos y atención personalizada, superando las expectativas de nuestros clientes.'
    },
    {
      icon: 'https://static.vecteezy.com/system/resources/previews/020/045/329/non_2x/isolate-blue-rocket-flat-icon-business-mission-flat-icon-symbol-vector.jpg',
      title: 'Visión',
      content: 'Ser líderes en moda sostenible para 2025, reconocidos por innovación y compromiso ambiental.'
    },
    {
      icon: 'https://static.vecteezy.com/system/resources/previews/047/524/868/non_2x/shining-diamond-icon-perfect-for-jewelry-and-luxury-items-vector.jpg',
      title: 'Valores',
      content: [ // Cambiado a "items" para arrays
        'Integridad en todas nuestras acciones',
        'Innovación constante',
        'Responsabilidad social',
        'Trabajo en equipo',
        'Orientación al cliente'
      ]
    }
  ];

  
    ngOnInit(): void {
      
      AOS.init({
        duration: 650, // Duración de la animación en milisegundos
          once: true, // Si `true`, la animación solo se ejecuta una vez
      });
    }


}
