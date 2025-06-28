import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-titular',
  templateUrl: './titular.component.html',
})
export class TitularComponent {
  isCollapsed = false;
  constructor(private router: Router) {}

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  redirectTo(path: string) {
    console.log(`Redirigiendo a: /titular/${path}`);
    this.router.navigate(['/titular/', path]);
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/inicio']);
  }
}
