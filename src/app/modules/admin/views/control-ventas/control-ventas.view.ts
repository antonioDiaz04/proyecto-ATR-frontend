import { Component } from '@angular/core';

@Component({
  selector: 'app-control-ventas',
  templateUrl: './control-ventas.view.html',
  // styleUrl: './control-ventas.view.scss'
})
export class ControlVentasView {
  
  pasoActual: number = 1;

  cambiarPaso(paso: number): void {
    if (paso >= 1 && paso <= 3) {
      this.pasoActual = paso;
    }
  }
}
