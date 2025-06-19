import { Component, OnInit } from "@angular/core";
import { SessionService } from "../../../../shared/services/session.service";
import { ERol } from "../../../../shared/constants/rol.enum";
import { VentayrentaService } from "../../../../shared/services/ventayrenta.service";

@Component({
  selector: "app-compras",
  templateUrl: "./compras.component.html",
  styleUrls: ["./compras.component.scss"],
})
export class ComprasComponent implements OnInit {
  userROL!: string;
  userData!: string;
  searchTerm: string = ""; // Término de búsqueda

  bolsaDeCompras!: any[]
  totalCompras = {
    subtotal: 850,
    impuestos: 136,
    envio: 50,
    totalPagar: 1036,
  };

  constructor(
    private sessionService: SessionService,
    private comprayrentaS_: VentayrentaService
  ) {}

  ngOnInit(): void {
    // this.isUserLoggedIn();
    if (this.isUserLoggedIn()) {
      this.obtenerComprasById(this.userData);
    } else {
    }
  }

  isUserLoggedIn(): boolean {
    const userData = this.sessionService.getUserData();
    if (userData) {
      this.userData = userData._id;
      alert(userData._id);
      this.userROL = userData.rol;
      return this.userROL === ERol.CLIENTE;
    }
    return false;
  }

  // Método para filtrar productos
  get filteredProducts() {
    return this.bolsaDeCompras.filter((producto) =>
      producto.nombre.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  obtenerComprasById(usuarioId: string) {
    this.comprayrentaS_
      .obtenerProductosCompradoByIdUser(usuarioId)
      .subscribe((response) => {
        this.bolsaDeCompras = response.map(item=>({
            id: item._id,
            isRecogido: item.isRecogido,
            estado: item.isRecogido,
            nombre: item.nombre,
            imagen:item.imagen,
            precio: item.precio,
            cantidad: item.cantidad,
            total: item.total,
            fechaCompra: item.fechaCompra,
            fechaRecogida: item.fechaRecogida,
        }));
      });
  }
  volver() {
    window.history.back();
  }
}
