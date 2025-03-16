import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientComponent } from './client.component';
import { PerfilComponent } from './views/cuenta/perfil/perfil.component';
import { RentasComponent } from './views/cuenta/rentas/rentas.component';
import { ComprasComponent } from './views/cuenta/compras/compras.component';
import { NotificacionesComponent } from './views/cuenta/notificaciones/notificaciones.component';

const routes: Routes = [
    {
      path: "",
      redirectTo: "cuenta",
      pathMatch: "full",
    },
    {
      path: "",
      component: ClientComponent,
      children: [
        {
          path: "perfil",
          component: PerfilComponent
          // data: {
          //   title: "inicio",
          //   breadcrumb: "inicio",
          // },
        },
        {
          path: "compras",
          component: ComprasComponent
          // data: {
          //   title: "inicio",
          //   breadcrumb: "inicio",
          // },
        },
        {
          path: "notificaciones",
          component: NotificacionesComponent
          // data: {
          //   title: "inicio",
          //   breadcrumb: "inicio",
          // },
        },
        {
          path: "rentas",
          component: RentasComponent
          // data: {
          //   title: "inicio",
          //   breadcrumb: "inicio",
          // },
        },
       
      ]
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientRoutingModule { }
