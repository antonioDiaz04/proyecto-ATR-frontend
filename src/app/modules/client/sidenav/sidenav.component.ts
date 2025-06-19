import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styles: ``
})
export class SidenavComponent implements OnInit {
  showMobileSidebar: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.checkIfMobile();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkIfMobile();
  }

  checkIfMobile(): void {
    this.showMobileSidebar = window.innerWidth <= 768;
  }

  redirectToCliente(route: string): void {
    this.router.navigate(["/cuenta/", route]);
  }

  logout() {
    localStorage.removeItem("token");
    this.router.navigate(["/inicio"]);
  }
}
