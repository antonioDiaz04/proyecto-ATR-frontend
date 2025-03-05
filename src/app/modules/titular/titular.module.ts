import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TitularRoutingModule } from './titular-routing.module';
import { TitularComponent } from './titular.component';
import { HistorialComponent } from './views/historial/historial.component';
import { VentasComponent } from './views/historial/ventas/ventas.component';
import { RentasComponent } from './views/historial/rentas/rentas.component';
import { InicioView } from './views/inicio/inicio.view';
import { DashboardView } from './views/dashboard/dashboard.view';

import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

@NgModule({
  declarations: [
    TitularComponent,
    HistorialComponent,
    VentasComponent,
    RentasComponent,
    InicioView,
    DashboardView
  ],
  imports: [TableModule,ButtonModule ,
    CommonModule,ChartModule,
    TitularRoutingModule
  ]
})
export class TitularModule { }
