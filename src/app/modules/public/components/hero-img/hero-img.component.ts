import {
  animate,
  state,
  style,
  transition,
  trigger,
} from "@angular/animations";
import { Component } from "@angular/core";

@Component({
  selector: "app-hero-img",

  animations: [
    trigger("fadeIn", [
      state("in", style({ opacity: 1 })),
      transition(":enter", [
        style({ opacity: 0 }),
        animate("800ms ease-in", style({ opacity: 1 })),
      ]),
      transition(":leave", [animate("800ms ease-out", style({ opacity: 0 }))]),
    ]),
  ],
  template: `
    <div
      class="hero"
      [ngStyle]="{ 'background-image': 'url(' + selectedImage + ')' }"
    >
      <div class="hero-content" @fadeIn>
        <h1 class="title">Venta <span class="small">y</span> Renta</h1>

        <p class="subtitle">Especial de Verano 2024</p>
        <p class="description">
          LO MÁS TOP DE VESTIDOS EN RENTA PARA FIESTAS, UN ESPACIO DONDE
          ENCONTRARÁS LO QUE ESTÁS BUSCANDO ✨.
        </p>
        <a href="#" class="cta">Compra Ahora</a>
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
  styles: `
.hero{
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60vh;
  filter: drop-shadow(10px 10px 15px rgb(249, 192, 255));
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  background-color:rgb(252, 230, 230);
  background-attachment: fixed;
  mask-image: linear-gradient(black 76%, transparent);
  padding: 0 2rem;
}
  
  .hero-content {
    width: 55%;
    filter: opacity(8);
    color:rgb(255, 0, 179);
    position: relative;
    z-index: 1;
    padding: 7rem;
    text-align: center;
    animation: fadeIn 1.5s ease-out;
  }
  .subtitle {
    font-size: 1.2rem;
    margin-bottom: 1rem;
  }
  .title {
  font-size: 6.5rem;
  font-weight: 999;
  font-family: innerti;
  margin-bottom: 1rem;
  line-height: 1.2;
  text-shadow: 0px 0px 9px rgba(255, 133, 214, 0.8), 0px 0px 15px rgba(255, 167, 226, 0.6);
}
  .description {
    font-size: 1rem;
    line-height: 1.5;
    margin-bottom: 2rem;
    color:#363636;
  }
  .cta {
    display: inline-block;
    padding: 0.8rem 2rem;
    background: linear-gradient(90deg, #ffcc00, #ffa500);
    color: #000;
    font-weight: bold;
    text-decoration: none;
    border-radius: 50px;
    transition: background-color 0.3s;
  }
  .cta:hover {
    background-color: #e6b800;
  }
  
.title .small {
    font-size:5rem; /* Tamaño más pequeño para la "y" */
}
  @media (max-width: 767px) {
      .hero {
        // border-radius: 10px;
        // mask-image: none;
        // margin: 10px;
        height: 50vh;

        filter: drop-shadow( 15px 0px 15px  rgb(255, 255, 255)); /* Sombra hacia abajo */
      }
      .hero-content {
    // border: dashed 1px;
    text-align: center;
    padding: 0rem;
    width: 70%;
}

.subtitle {
    width: 100%;
    font-size: 0.8rem;
    word-wrap: break-word;
    white-space: normal;
    overflow-wrap: break-word;
    text-align: center;
}
.title .small {
    font-size: 3.5rem; /* Tamaño más pequeño para la "y" */
}


.title {
  font-family: innerti;

    font-size: 3.8rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1;
}

.description {
    font-size: 0.7rem;
}

.cta {
    padding: 0.5rem 1rem;
    border-radius: 5px;
}

}
/* Optional: Smooth fade-in effect for content */
@keyframes fadeIn {
0% {
  opacity: 0;
  transform: translateY(20px);
}
100% {
  opacity: 1;
  transform: translateY(0);
}
}
.carousel-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
z-index:1;
border: none;
// background-color:none;
background-color: transparent;
      color: white;
      padding: 10px;
      cursor: pointer;
      font-size: 1.5rem;
      transition: background-color 0.3s;
    }
    .carousel-btn.left {
      left: 10px;
    }
    .carousel-btn.right {
      right: 10px;
    }
    .carousel-btn:hover {
      background-color:transparent;
    }
    .carousel-btn i {
      font-size: 2rem;
    }
`,
})
export class HeroImgComponent {
  images: string[] = [
    "https://res.cloudinary.com/dvvhnrvav/image/upload/v1736990456/images-AR/gh5ryrsad5fnaxgjgall.jpg",
  "https://res.cloudinary.com/dvvhnrvav/image/upload/v1740548991/images-AR/eo8xyojnqxjhyjz9vfec.jpg",
  "https://res.cloudinary.com/dvvhnrvav/image/upload/v1740548954/images-AR/olxd7enpsw0xm7h2wz5i.jpg",
  "https://res.cloudinary.com/dvvhnrvav/image/upload/v1740548954/images-AR/br5qoj8efwj5fzm5a8ls.jpg",
  "https://res.cloudinary.com/dvvhnrvav/image/upload/v1740548924/images-AR/y9i9sl47oklfv6sjijyl.jpg"
  ];

  selectedIndex: number = 0;
  selectedImage: string = this.images[this.selectedIndex];

  prevImage() {
    this.selectedIndex =
      (this.selectedIndex - 1 + this.images.length) % this.images.length;
    this.selectedImage = this.images[this.selectedIndex];
  }

  nextImage() {
    this.selectedIndex = (this.selectedIndex + 1) % this.images.length;
    this.selectedImage = this.images[this.selectedIndex];
  }
}
