import { Component, OnInit } from "@angular/core";
import { VentayrentaService } from "../../../../shared/services/ventayrenta.service";

@Component({
  selector: "app-listado-venta",
  templateUrl: "./listado-venta.component.html",
  styleUrl: "./listado-venta.component.scss",
})
export class ListadoVentaComponent implements OnInit {
  ventas: any;

  constructor(private ventaYrentaS_: VentayrentaService) {}
  ngOnInit(): void {
    this.obtenerVentas();
  }
  obtenerVentas(): void {
    this.ventaYrentaS_.obtenerVentas().subscribe((res) => {
      this.ventas = res;
    });
  }
}
