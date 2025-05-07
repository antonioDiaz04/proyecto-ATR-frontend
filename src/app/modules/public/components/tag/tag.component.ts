import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tag',
  templateUrl: './tag.component.html',
  
  // styleUrl: './tag.component.scss'
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
      image: 'https://www.shutterstock.com/image-photo/young-woman-blonde-hair-poses-600nw-2476791279.jpg',
      title: 'Descubre la esencia de la elegancia con nuestro exclusivo vestido.',
      text: `Cada pliegue y cada detalle han sido diseñados para resaltar tu belleza única. 
            Imagina deslizarte en un evento, sintiendo cómo todas las miradas se posan en ti...`
    },
    {
      image: 'https://www.shutterstock.com/image-photo/portrait-gorgeous-elegant-sensual-blonde-600nw-2231380795.jpg',
      title: 'Redefine tu estilo con nuestro cautivador vestido.',
      text: `Cada detalle ha sido meticulosamente diseñado para realzar tu silueta y resaltar tu personalidad. 
            Este vestido no es solo una prenda; es una experiencia...`
    },
    {
      image: 'https://img.freepik.com/foto-gratis/retrato-modelo-morena-linda-hermosa-mujer-vestido-casual-verano-maquillaje-aislado-blanco-longitud-total_158538-14436.jpg',
      title: 'Redefine tu estilo con nuestro cautivador vestido.',
      text: `Cada detalle ha sido meticulosamente diseñado para realzar tu silueta y resaltar tu personalidad. 
            Este vestido no es solo una prenda; es una experiencia...`
    },
    {
      image: 'https://res.cloudinary.com/dvvhnrvav/image/upload/v1736990456/images-AR/gh5ryrsad5fnaxgjgall.jpg',
      // image: 'https://res.cloudinary.com/dvvhnrvav/image/upload/v1740548944/images-AR/ybxbjn512j1u1tba1sob.jpg',
      title: 'Redefine tu estilo con nuestro cautivador vestido.',
      text: `Cada detalle ha sido meticulosamente diseñado para realzar tu silueta y resaltar tu personalidad. 
            Este vestido no es solo una prenda; es una experiencia...`
    }
  ];  
}
