import { Component, OnInit } from '@angular/core';
import { VentayrentaService } from '../../../../shared/services/ventayrenta.service';

@Component({
  selector: 'app-listado-renta',
  templateUrl: './listado-renta.component.html',
  styleUrl: './listado-renta.component.scss'
})
export class ListadoRentaComponent implements OnInit {

   rentas: any;
  
    constructor(private ventaYrentaS_: VentayrentaService) {}
    ngOnInit(): void {
      this.obtenerVentas();
    }
    obtenerVentas(): void {
      this.ventaYrentaS_.obtenerRentas().subscribe((res) => {
        this.rentas = res;
      });
    }
}
