import { AfterViewInit, Component, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import $ from 'jquery';

declare namespace JQuery {
  interface JQuery {
    rating(): JQuery;
  }
}


@Component({
  selector: 'app-comentarios',
  templateUrl: './comentarios.component.html',
  styleUrls: ['./comentarios.component.scss'],
})
export class ComentariosComponent implements AfterViewInit {
  reviews = [
    {
      usuario: 'Atacante',
      description: 'Contenido<script>alert("XSS Attack!");</script> XSS',
      rating: 1,
    },
    {
      usuario: 'Intruso',
      description: '<img src="x" onerror="alert(\'Hackeado!\')">',
      rating: 2,
    },
    {
      usuario: 'Atacante',
      description: '<iframe src="javascript:alert(\'XSS!\')"></iframe>',
      rating: 3,
    },
    {
      usuario: 'Malicioso',
      description:
        'Contenido<a href="javascript:alert(\'Peligro\')">Click aquí</a>',
      rating: 1,
    },
  ];

  sanitizedReviews: { usuario: string; description: SafeHtml; rating: number }[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private sanitizer: DomSanitizer
  ) {
    // Sanitizar los comentarios antes de mostrarlos
    this.sanitizedReviews = this.reviews.map(review => ({
      ...review,
      description: this.sanitizer.bypassSecurityTrustHtml(review.description),
    }));
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        if (typeof $ !== 'undefined') {
          ($('.ui.rating') as any).rating();
        } else {
          console.error('Error: Semantic UI rating no está disponible.');
        }
      }, 100);
    }
  }
}