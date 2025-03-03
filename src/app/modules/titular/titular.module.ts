import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TitularRoutingModule } from './titular-routing.module';
import { TitularComponent } from './titular.component';
import { HistorialComponent } from './views/historial/historial.component';
import { VentasComponent } from './views/historial/ventas/ventas.component';
import { RentasComponent } from './views/historial/rentas/rentas.component';
import { InicioView } from './views/inicio/inicio.view';
import { DashboardView } from './views/dashboard/dashboard.view';


@NgModule({
  declarations: [
    TitularComponent,
    HistorialComponent,
    VentasComponent,
    RentasComponent,
    InicioView,
    DashboardView
  ],
  imports: [
    CommonModule,
    TitularRoutingModule
  ]
})
export class TitularModule { }
