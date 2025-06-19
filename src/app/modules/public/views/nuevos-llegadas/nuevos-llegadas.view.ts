import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ProductoService } from '../../../../shared/services/producto.service';

@Component({
  selector: 'app-nuevos-llegadas',
  templateUrl: './nuevos-llegadas.view.html',
  styleUrl: './nuevos-llegadas.view.scss'
})
export class NuevosLlegadasView implements OnInit{

  productos: any = []; // Inicializamos como array vacío

  isLoading: boolean = true;
  
    constructor(
      private router: Router,
      private ngxService: NgxUiLoaderService,
      private PRODUCTOSERVICE_: ProductoService,
    ) { }
  
  ngOnInit() {
    // Al iniciar la carga, vaciamos el array de productos
    this.productos = [];
    this.isLoading = true;

      this.cargarProductos();

    // Cargar los productos solo si la página no se está recargando
    // if (!this.isPageReloading()) {
    //   this.cargarProductos();
    // } else {
    //   // console.log("⏳ La página se está recargando, no se cargarán los productos.");
    //   this.isLoading = false;
    //   this.cargarProductos();
    //   this.ngxService.start(); // Inicia el loader

    // this.detectDevice();
  }






  cargarProductos() {
    this.isLoading = true; // Mostrar el skeleton al cargar
    this.PRODUCTOSERVICE_.obtenerProductos().subscribe(
      (response) => {
        this.ngxService.stop(); // Inicia el loader

        // console.log("📦 Productos recibidos:");
        this.productos = response;
        this.isLoading = false; // Ocultar el skeleton
      },
      (error) => {
        console.error("❌ Error al cargar los productos:");
        this.isLoading = false; // Ocultar el skeleton en caso de error
      }
    );
  }
}
