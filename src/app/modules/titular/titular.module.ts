import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TitularRoutingModule } from './titular-routing.module';
import { TitularComponent } from './titular.component';
import { HistorialComponent } from './views/historial/historial.component';
import { VentasComponent } from './views/historial/ventas/ventas.component';
import { RentasComponent } from './views/historial/rentas/rentas.component';
//import { InicioComponent } from "./views/inicio/inicio.component";
import { DashboardView } from './views/dashboard/dashboard.view';
import { EstadisticaComponent } from './views/estadistica/estadistica.component';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MVVComponent } from './views/listados/mvv/mvv.component';
import { MisionComponent } from './views/mvv/mision/mision.component';
import { VisionComponent } from './views/mvv/vision/vision.component';
import { ValoresComponent } from './views/mvv/valores/valores.component';

@NgModule({
  declarations: [
    TitularComponent,
    HistorialComponent,
    VentasComponent,
    RentasComponent,
    //InicioComponent,
    DashboardView,
    MVVComponent,
    MisionComponent,
    VisionComponent,
    ValoresComponent,
    EstadisticaComponent,
  ],
  imports: [
    TableModule,
    ButtonModule,
    CommonModule,
    ChartModule,
    TitularRoutingModule,
    ReactiveFormsModule,
    FormsModule,
  ],
})
export class TitularModule {}
