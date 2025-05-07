import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styles: ``
})
export class SidenavComponent {
constructor(private router:Router){}

 redirectToCliente(route: string): void {
    // this.sidebarVisible = false;
    // this.isModalVisible = false;
    this.router.navigate(["/cuenta/", route]
    );
  }
  logout() {
    localStorage.removeItem("token");
    this.router.navigate(["/inicio"]);
  }
}
