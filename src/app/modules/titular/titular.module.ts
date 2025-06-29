import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FullCalendarModule } from '@fullcalendar/angular';

// Routing
import { TitularRoutingModule } from './titular-routing.module';

//servicios
import { CsrfInterceptor } from '../../shared/services/csrf.interceptor';

// Componentes
import { TitularComponent } from './titular.component';
import { HistorialComponent } from './views/historial/historial.component';
import { VentasComponent } from './views/historial/ventas/ventas.component';
import { RentasComponent } from './views/historial/rentas/rentas.component';
import { DashboardView } from './views/dashboard/dashboard.view';
import { EstadisticaComponent } from './views/estadistica/estadistica.component';
import { MVVComponent } from './views/listados/mvv/mvv.component';
// import { MisionComponent } from './views/mvv/mision/mision.component';
import { VisionComponent } from './views/mvv/vision/vision.component';
import { ValoresComponent } from './views/mvv/valores/valores.component';
import { PropietarioService } from '../../shared/services/propietario.service';
import { ControlAdministrativaService } from '../../shared/services/control-administrativa.service';
import { ApiInterceptor } from '../../shared/services/api-interceptor.service';

@NgModule({
  declarations: [
    TitularComponent,
    HistorialComponent,
    VentasComponent,
    RentasComponent,
    DashboardView,
    MVVComponent,
    // MisionComponent,
    VisionComponent,
    ValoresComponent,
    EstadisticaComponent,
  ],
  imports: [
    CommonModule,
    ChartModule,
    TableModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    TitularRoutingModule,
    HttpClientModule,
    ToastModule,
    FullCalendarModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CsrfInterceptor,
      multi: true, // Permite múltiples interceptores
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptor, // <--- este interceptor agrega el token
      multi: true,
    },
    PropietarioService,
    MessageService,
    ControlAdministrativaService,
  ],
})
export class TitularModule {}
