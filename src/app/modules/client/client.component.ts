import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrl: './client.component.scss'
})
export class ClientComponent {
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
