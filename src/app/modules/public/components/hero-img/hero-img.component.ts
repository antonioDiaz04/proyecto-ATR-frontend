import {
  animate,
  state,
  style,
  transition,
  trigger,
} from "@angular/animations";
import { Component, HostListener, Inject, OnDestroy, OnInit, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from '@angular/common';

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

        <!-- Iconos de redes sociales -->
        <div class="social-icons">
          <a href="#" class="icon facebook">
            <svg
              viewBox="0 0 24 24"
              fill="white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22 12.073C22 6.504 17.523 2 12 2S2 6.504 2 12.073c0 5.035 3.657 9.209 8.437 9.908v-7.006H7.897v-2.902h2.54v-2.219c0-2.508 1.492-3.89 3.777-3.89 1.095 0 2.238.195 2.238.195v2.455h-1.26c-1.242 0-1.632.773-1.632 1.563v1.896h2.773l-.443 2.902h-2.33v7.006C18.343 21.282 22 17.108 22 12.073z"
              />
            </svg>
          </a>

          <a href="#" class="icon instagram">
            <svg
              viewBox="0 0 24 24"
              fill="white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.5 2C4.462 2 2 4.462 2 7.5v9C2 19.538 4.462 22 7.5 22h9c3.038 0 5.5-2.462 5.5-5.5v-9C22 4.462 19.538 2 16.5 2h-9zM18 4c.827 0 1.5.673 1.5 1.5S18.827 7 18 7s-1.5-.673-1.5-1.5S17.173 4 18 4zM12 6a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm0 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"
              />
            </svg>
          </a>
        </div>
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
  mask-image: linear-gradient(black 90%, transparent);
  padding: 0 2rem;
  opacity: 1; /* Asegúrate de que la opacidad inicial sea 1 */
  transition: opacity 0.5s ease-in-out;
}/* Agrega esta clase para ocultar temporalmente la imagen */
.hero.fade-out {
  opacity: 0;
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


.social-icons {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    gap: 15px;

    .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: transparent;
      border: 2px solid white;
      transition: background 0.3s;

      svg {
        width: 20px;
        height: 20px;
      }

      &:hover {
        background: white;

        svg {
          fill: black;
        }
      }
    }
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
.hero-content {
  transition: transform 0.3s ease, font-size 0.3s ease;

  h1 {
    font-size: 3rem;
    transition: font-size 0.3s ease;
  }

  .subtitle {
    font-size: 1.5rem;
    transition: font-size 0.3s ease;
  }

  .description {
    font-size: 1rem;
    transition: font-size 0.3s ease;
  }

  // When the "scrolled" class is added, chan.ge the style.
  &.scrolled {
    transform: translateY(-10px);  // You can add the effect you want, e.g., moving the hero content up.
    h1 {
      font-size: 2.5rem; // Example: Reduce font-size on scroll
    }

    .subtitle {
      font-size: 1.25rem; // Example: Change subtitle font-size on scroll
    }

    .description {
      font-size: 0.9rem; // Example: Change description font-size on scroll
    }
  }
}


// Aplicar el efecto cuando se hace scroll
@media (min-width: 768px) {
  .scrolled .hero-content {
    transform: scale(0.9);
  
    h1 {
      font-size: 2.5rem;
    }

    .subtitle {
      font-size: 1.2rem;
    }

    .description {
      font-size: 0.9rem;
    }
  }
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
export class HeroImgComponent implements OnInit, OnDestroy {
  images: string[] = [
    "https://res.cloudinary.com/dvvhnrvav/image/upload/v1736990456/images-AR/gh5ryrsad5fnaxgjgall.jpg",
    "https://res.cloudinary.com/dvvhnrvav/image/upload/v1740548991/images-AR/eo8xyojnqxjhyjz9vfec.jpg",
    "https://res.cloudinary.com/dvvhnrvav/image/upload/v1740548954/images-AR/olxd7enpsw0xm7h2wz5i.jpg",
    "https://res.cloudinary.com/dvvhnrvav/image/upload/v1740548954/images-AR/br5qoj8efwj5fzm5a8ls.jpg",
    "https://res.cloudinary.com/dvvhnrvav/image/upload/v1740548924/images-AR/y9i9sl47oklfv6sjijyl.jpg",
  ];

  selectedIndex: number = 0;
  selectedImage: string = this.images[this.selectedIndex];

  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  prevImage() {
    this.selectedIndex =
      (this.selectedIndex - 1 + this.images.length) % this.images.length;
    this.selectedImage = this.images[this.selectedIndex];
  }

  nextImage() {
    this.selectedIndex = (this.selectedIndex + 1) % this.images.length;
    this.selectedImage = this.images[this.selectedIndex];
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener("scroll", this.onScroll);
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener("scroll", this.onScroll);
    }
  }

  private onScroll = () => {
    if (window.scrollY > 50) {
      document.body.classList.add("scrolled");
    } else {
      document.body.classList.remove("scrolled");
    }
  };
  @HostListener("window:scroll", [])
onWindowScroll() {
  const hero = document.querySelector(".hero-content");
  if (window.scrollY > 50) {
    hero?.classList.add("scrolled");
  } else {
    hero?.classList.remove("scrolled");
  }
}

}