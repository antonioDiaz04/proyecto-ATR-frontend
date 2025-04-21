import { Component, OnInit, OnDestroy, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-hero-img',
  template: `
    <div class="hero">
      <img [src]="selectedImage" [class.fade-out]="isFading" class="hero-image" />
      <div class="hero-content">
        <h1 class="title">Venta <span class="small">y</span> Renta</h1>
        <p class="subtitle">Especial de Verano 2024</p>
        <p class="description">
          LO MÁS TOP DE VESTIDOS EN RENTA PARA FIESTAS, UN ESPACIO DONDE
          ENCONTRARÁS LO QUE ESTÁS BUSCANDO ✨.
        </p>
      </div>
      
      <!-- Botón Izquierdo -->
      <button class="carousel-btn left" (click)="prevImage()">
         <i class="angle left icon"></i>
      </button>
      <!-- Botón Derecho -->
      <button class="carousel-btn right" (click)="nextImage()">
         <i class="angle right icon"></i>
      </button>
    </div>
  `,
  styles: [`
    .hero {
      position: relative;
      height: 50vh;
      overflow: hidden;
      background-attachment: fixed;
  
      filter: contrast(125%);
    }
    .hero-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: opacity 0.5s ease;
    }
    .fade-out {
      opacity: 0;
    }
    .hero-content { /* Color del texto */

      position: absolute;
      top: 40%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      color: white;
      z-index: 2;
    }
    .title {
      font-family:  'Times New Roman', Times; /* Cambia a una tipografía similar */
      // font-style: italic; /* Aplica cursiva */
      color: rgb(255, 27, 168);
      font-size: 8rem;
      transition: font-size 0.3s ease;
      margin-bottom: 0rem;
    }
    .small {
      font-size: 1.8rem;
    }
    .subtitle {
      font-size: 1.2rem;
      margin-bottom: 1rem;
    }
    .description {
      font-size: 1rem;
      max-width: 80%;
      margin: 0 auto;
    }
    .carousel-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(0,0,0,0.4);
      border: none;
      padding: 10px;
      color: white;
      cursor: pointer;
      z-index: 3;
      font-size: 1.5rem;
      transition: background 0.3s ease;
    }
    .carousel-btn:hover {
      background: rgba(0,0,0,0.6);
    }
    .carousel-btn.left {
      left: 20px;
    }
    .carousel-btn.right {
      right: 20px;
    }
  `]
})
export class HeroImgComponent implements OnInit, OnDestroy {
  images: string[] = [
    // "https://i.pinimg.com/736x/3f/50/dc/3f50dc11de0c352f8ef7d5e046e476ee.jpg",
    "https://res.cloudinary.com/dvvhnrvav/image/upload/v1736990456/images-AR/gh5ryrsad5fnaxgjgall.jpg",
    "https://res.cloudinary.com/dvvhnrvav/image/upload/v1740548991/images-AR/eo8xyojnqxjhyjz9vfec.jpg",
    "https://res.cloudinary.com/dvvhnrvav/image/upload/v1740548954/images-AR/olxd7enpsw0xm7h2wz5i.jpg",
    "https://res.cloudinary.com/dvvhnrvav/image/upload/v1740548954/images-AR/br5qoj8efwj5fzm5a8ls.jpg",
    "https://res.cloudinary.com/dvvhnrvav/image/upload/v1740548924/images-AR/y9i9sl47oklfv6sjijyl.jpg"
  ];
  selectedIndex: number = 0;
  selectedImage: string = this.images[this.selectedIndex];
  isFading: boolean = false;

  constructor(@Inject(PLATFORM_ID) private platformId: any) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Puedes agregar listeners o lógica adicional si es necesario.
    }
  }

  ngOnDestroy(): void {
    // Remueve listeners o limpia recursos si se utilizan.
  }

  private fadeTransition(newIndex: number): void {
    // Activa la animación de fade out
    this.isFading = true;
    setTimeout(() => {
      this.selectedIndex = newIndex;
      this.selectedImage = this.images[newIndex];
      // Reinicia la opacidad (fade in)
      this.isFading = false;
    }, 500); // La duración (ms) debe coincidir con el transition CSS
  }

  prevImage(): void {
    const newIndex = (this.selectedIndex - 1 + this.images.length) % this.images.length;
    this.fadeTransition(newIndex);
  }

  nextImage(): void {
    const newIndex = (this.selectedIndex + 1) % this.images.length;
    this.fadeTransition(newIndex);
  }
}