import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientComponent } from './client.component';
import { PerfilComponent } from './views/perfil/perfil.component';
import { RentasComponent } from './views/rentas/rentas.component';
import { ComprasComponent } from './views/compras/compras.component';
import { NotificacionesComponent } from './views/notificaciones/notificaciones.component';
import { ReportarIncidenteComponent } from './views/reportar-incidente/reportar-incidente.component';
import { AlexaTokenGeneratorComponent } from '../client/views/alexa-token-generator/alexa-token-generator.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'perfil',
    pathMatch: 'full',
  },
  {
    path: '',
    component: ClientComponent,
    children: [
      {
        path: 'perfil',
        component: PerfilComponent,
        // data: {
        //   title: "inicio",
        //   breadcrumb: "inicio",
        // },
      },
      {
        path: 'compras',
        component: ComprasComponent,
        // data: {
        //   title: "inicio",
        //   breadcrumb: "inicio",
        // },
      },
      {
        path: 'notificaciones',
        component: NotificacionesComponent,
        // data: {
        //   title: "inicio",
        //   breadcrumb: "inicio",
        // },
      },
      {
        path: 'alexa',
        component: AlexaTokenGeneratorComponent,
        // data: {
        //   title: "inicio",
        //   breadcrumb: "inicio",
        // },
      },
      {
        path: 'rentas',
        component: RentasComponent,
        // data: {
        //   title: "inicio",
        //   breadcrumb: "inicio",
        // },
      },

      {
        path: 'reportar-incidente',
        component: ReportarIncidenteComponent,
        // data: {
        //   title: "inicio",
        //   breadcrumb: "inicio",
        // },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientRoutingModule {}
