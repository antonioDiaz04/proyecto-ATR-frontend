import { Component, OnInit } from '@angular/core';
import { SessionService } from '../../../../shared/services/session.service';
import { ERol } from '../../../../shared/constants/rol.enum';

@Component({
  selector: 'app-compras',
  templateUrl: './compras.component.html',
  styleUrls: ['./compras.component.scss']
})
export class ComprasComponent implements OnInit {
  userROL!: string;
  searchTerm: string = ''; // Término de búsqueda

  bolsaDeCompras = [
    { 
      id: 1,
      isRecogido: true,
      estado: "pendiente_pago", 
      nombre: "Producto A", 
      imagen: "https://img.ltwebstatic.com/images3_pi/2025/01/02/8f/1735797060971f7de5e5b9fb67239efd71b70baa24_thumbnail_560x.webp", 
      precio: 150, 
      cantidad: 2, 
      total: 300,
      fechaCompra: new Date(),
      fechaRecogida: new Date(new Date().setDate(new Date().getDate() + 3))
    },
    { 
      id: 1,
      isRecogido: true,
      estado: "pendiente_pago", 
      nombre: "Producto A", 
      imagen: "https://img.ltwebstatic.com/images3_pi/2025/01/02/8f/1735797060971f7de5e5b9fb67239efd71b70baa24_thumbnail_560x.webp", 
      precio: 150, 
      cantidad: 2, 
      total: 300,
      fechaCompra: new Date(),
      fechaRecogida: new Date(new Date().setDate(new Date().getDate() + 3))
    },
    { 
      id: 1,
      isRecogido: true,
      estado: "pendiente_pago", 
      nombre: "Producto A", 
      imagen: "https://img.ltwebstatic.com/images3_pi/2025/01/02/8f/1735797060971f7de5e5b9fb67239efd71b70baa24_thumbnail_560x.webp", 
      precio: 150, 
      cantidad: 2, 
      total: 300,
      fechaCompra: new Date(),
      fechaRecogida: new Date(new Date().setDate(new Date().getDate() + 3))
    },
    { 
      id: 1,
      isRecogido: true,
      estado: "pendiente_pago", 
      nombre: "Producto A", 
      imagen: "https://img.ltwebstatic.com/images3_pi/2025/01/02/8f/1735797060971f7de5e5b9fb67239efd71b70baa24_thumbnail_560x.webp", 
      precio: 150, 
      cantidad: 2, 
      total: 300,
      fechaCompra: new Date(),
      fechaRecogida: new Date(new Date().setDate(new Date().getDate() + 3))
    },
    // Puedes agregar más productos aquí
  ];
  
  totalCompras = {
    subtotal: 850,
    impuestos: 136,
    envio: 50,
    totalPagar: 1036
  };
  
  constructor(private sessionService: SessionService) {}

  ngOnInit(): void {
    this.isUserLoggedIn();
  }

  isUserLoggedIn(): boolean {
    const userData = this.sessionService.getUserData();
    if (userData) {
      alert(userData._id);
      this.userROL = userData.rol;
      return this.userROL === ERol.CLIENTE;
    }
    return false;
  }

  // Método para filtrar productos
  get filteredProducts() {
    return this.bolsaDeCompras.filter(producto => 
      producto.nombre.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
  volver() {
    window.history.back();
  }
}
