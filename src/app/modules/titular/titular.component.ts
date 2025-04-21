import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-titular',
  templateUrl: './titular.component.html',
  styleUrls: ['./titular.component.scss']
})
export class TitularComponent {
  constructor(private router: Router) {}

  redirectTo(path: string) {
    // Imprimir en la consola la ruta que se está redirigiendo
    console.log(`Redirigiendo a: /titular/${path}`);
    
    // Concatenando el path del componente Titular con las rutas secundarias
    this.router.navigate(["/titular/",path]);
  }
  logout() {
    localStorage.removeItem("token");
    this.router.navigate(["/inicio"]);
  }
}
