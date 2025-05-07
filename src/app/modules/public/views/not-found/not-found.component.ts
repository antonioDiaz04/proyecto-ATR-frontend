import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',

})
export class NotFoundComponent implements OnInit {

  errorCode: number = 404;
  errorMessage: string = 'Página no encontrada';
  constructor(private router: Router) {}

  ngOnInit() {
    // Inicialización si es necesario
  }

  goBack() {
    this.router.navigate(['']); // Cambia la ruta según sea necesario
  }
}
