import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientRoutingModule } from './client-routing.module';
import { PerfilComponent } from './views/cuenta/perfil/perfil.component';
import { RentasComponent } from './views/cuenta/rentas/rentas.component';
import { ClientComponent } from './client.component';
import { SessionService } from '../../shared/services/session.service';
import { VentayrentaService } from '../../shared/services/ventayrenta.service';
import { ComprasComponent } from './views/cuenta/compras/compras.component';


@NgModule({
  declarations: [
    PerfilComponent,
    RentasComponent,
    ComprasComponent,
    ClientComponent
  ],
  imports: [
    CommonModule,
    ClientRoutingModule
  ]
  ,providers: [
    SessionService,
    VentayrentaService
  ],
})
export class ClientModule { }
