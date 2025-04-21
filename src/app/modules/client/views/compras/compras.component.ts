import { Component, OnInit } from "@angular/core";
import { SessionService } from "../../../../shared/services/session.service";
import { VentayrentaService } from "../../../../shared/services/ventayrenta.service";
import { ERol } from "../../../../shared/constants/rol.enum";
import { Router } from "@angular/router";
import { Location } from "@angular/common";

@Component({
  selector: "app-compras",
  templateUrl: "./compras.component.html",
  styleUrls: ["../../style.scss"],
})
export class ComprasComponent implements OnInit {
  userROL: string | null = null;
  userData: string | null = null;
  searchTerm: string = "";

  bolsaDeCompras: any[] = [];

  totalCompras = {
    subtotal: 0,
    impuestos: 0,
    descuentos: 0,
    totalPagar: 0,
  };

  constructor(
    private location:Location,
private router:Router,
    private sessionService: SessionService,
    private comprayrentaS_: VentayrentaService
  ) {}

  ngOnInit(): void {
    if (this.isUserLoggedIn()) {
      this.obtenerComprasById(this.userData!);
    }
  }

  private isUserLoggedIn(): boolean {
    const userData = this.sessionService.getUserData();
    if (userData) {
      this.userData = userData._id;
      this.userROL = userData.rol;
      return this.userROL === ERol.CLIENTE;
    }
    return false;
  }

  get filteredProducts() {
    return this.bolsaDeCompras?.filter((producto) =>
      producto?.nombre?.toLowerCase().includes(this.searchTerm.toLowerCase())
    ) || [];
  }

  private obtenerComprasById(usuarioId: string) {
    this.comprayrentaS_
      .obtenerProductosCompradoByIdUser(usuarioId)
      .subscribe((response: any[]) => {
        this.bolsaDeCompras = response.map((venta) => ({
          id: venta._id,
          fechaCompra: venta.fechaVenta,
          estado: venta.estado,
          productos: venta.productos.map((producto: any) => ({
            nombre: producto.producto.nombre,  // Acceder correctamente al nombre del producto
            precio: producto.precioUnitario,  // Precio unitario correcto
            cantidad: producto.cantidad,
            total: producto.cantidad * producto.precioUnitario,  // Calcular total correctamente
            imagen: producto.producto.imagenPrincipal,  // Acceder correctamente a la imagen
          }))
        }));
      });
  }
  

  volver() {
    this.location.back();
  }
  verDetalles(id: number) {
    this.router.navigate(["/Detail/" + id]);
  }
}
