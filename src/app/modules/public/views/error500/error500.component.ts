
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-error500',
  templateUrl: './error500.component.html',

})
export class Error500Component  implements OnInit {

  constructor(private router: Router) {}

  ngOnInit() {
    // Inicialización si es necesario
  }

  goBack() {
    this.router.navigate(['']); // Cambia la ruta según sea necesario
  }
}
