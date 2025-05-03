import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-hero-img',
  templateUrl: './hero-img.component.html',
  // styleUrls: ['./hero-img.component.css']
})
export class HeroImgComponent implements OnInit, OnDestroy {

  // images: string[] = [
  //   "https://res.cloudinary.com/dvvhnrvav/image/upload/v1736990456/images-AR/gh5ryrsad5fnaxgjgall.jpg",
  //   "https://res.cloudinary.com/dvvhnrvav/image/upload/v1740548991/images-AR/eo8xyojnqxjhyjz9vfec.jpg",
  //   "https://res.cloudinary.com/dvvhnrvav/image/upload/v1740548954/images-AR/olxd7enpsw0xm7h2wz5i.jpg",
  //   "https://res.cloudinary.com/dvvhnrvav/image/upload/v1740548954/images-AR/br5qoj8efwj5fzm5a8ls.jpg",
  //   "https://res.cloudinary.com/dvvhnrvav/image/upload/v1740548924/images-AR/y9i9sl47oklfv6sjijyl.jpg"
  // ];
  
  selectedIndex: number = 0;
  // selectedImage: string = this.images[0];
  isFading: boolean = false;

  constructor(@Inject(PLATFORM_ID) private platformId: any) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // puedes poner auto-slide aquí si quieres
    }
  }

  ngOnDestroy(): void {
    // limpiar si activas intervalos después
  }

  // private fadeTransition(newIndex: number): void {
  //   this.isFading = true;
  //   setTimeout(() => {
  //     this.selectedIndex = newIndex;
  //     this.selectedImage = this.images[newIndex];
  //     this.isFading = false;
  //   }, 500);
  // }

  // prevImage(): void {
  //   const newIndex = (this.selectedIndex - 1 + this.images.length) % this.images.length;
  //   this.fadeTransition(newIndex);
  // }

  // nextImage(): void {
  //   const newIndex = (this.selectedIndex + 1) % this.images.length;
  //   this.fadeTransition(newIndex);
  // }
}
