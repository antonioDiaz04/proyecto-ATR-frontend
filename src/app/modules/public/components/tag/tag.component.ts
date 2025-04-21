import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tag',
  templateUrl: './tag.component.html',
  styleUrl: './tag.component.scss'
})
export class TagComponent implements OnInit {
  isMobile: boolean = false;

  ngOnInit() {
    this.checkIfMobile();
    window.addEventListener('resize', () => this.checkIfMobile());
  }
  
  checkIfMobile() {
    this.isMobile = window.innerWidth <= 768;
  }
  steps = [
    {
      icon: 'pi pi-whatsapp',
      text: '<strong>Visítanos en el local:</strong> Llámanos por WhatsApp o por nuestras Redes Sociales...'
    },
    {
      icon: 'pi pi-home',
      text: '<strong>¡Visítanos y Selecciona!</strong> Prueba los vestidos que más te gusten...'
    },
    {
      icon: 'pi pi-check-circle',
      text: '<strong>¡Renta!</strong> Recoge y lleva el vestido...'
    },
    {
      icon: 'pi pi-undo',
      text: '<strong>Devolución Fácil:</strong> Los vestidos se regresan...'
    }
  ];
  cards = [
    {
      image: 'https://res.cloudinary.com/dvvhnrvav/image/upload/v1740548954/images-AR/kbvvxf2v2wx7g2ac3qgg.jpg',
      title: 'Descubre la esencia de la elegancia con nuestro exclusivo vestido.',
      text: `Cada pliegue y cada detalle han sido diseñados para resaltar tu belleza única. 
            Imagina deslizarte en un evento, sintiendo cómo todas las miradas se posan en ti...`
    },
    {
      image: 'https://res.cloudinary.com/dvvhnrvav/image/upload/v1740548944/images-AR/ybxbjn512j1u1tba1sob.jpg',
      title: 'Redefine tu estilo con nuestro cautivador vestido.',
      text: `Cada detalle ha sido meticulosamente diseñado para realzar tu silueta y resaltar tu personalidad. 
            Este vestido no es solo una prenda; es una experiencia...`
    }
  ];  
}
