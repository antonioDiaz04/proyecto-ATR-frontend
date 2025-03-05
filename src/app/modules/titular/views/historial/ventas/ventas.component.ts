import { Component } from "@angular/core";

@Component({
  selector: "app-ventas",
  templateUrl: "./ventas.component.html",
  styleUrls: ["./ventas.component.scss"],
})
export class VentasComponent {
  ventas = [
    {
      fecha: "2024-03-01",
      producto: "Vestido de Verano",
      cantidad: 10,
      total: 500,
      metodoPago: "Tarjeta",
    },
    {
      fecha: "2024-03-02",
      producto: "Vestido de Noche",
      cantidad: 5,
      total: 250,
      metodoPago: "Efectivo",
    },
    {
      fecha: "2024-03-03",
      producto: "Vestido Casual",
      cantidad: 20,
      total: 600,
      metodoPago: "Transferencia",
    },
    {
      fecha: "2024-03-04",
      producto: "Vestido Elegante",
      cantidad: 50,
      total: 750,
      metodoPago: "Tarjeta",
    },
  ];

  generarReporte() {
    console.log("Generando reporte de ventas...");
    // Aquí puedes agregar lógica para descargar un PDF o exportar a Excel
  }
}
