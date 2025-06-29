import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TitularComponent } from './titular.component';
import { RentasComponent } from './views/historial/rentas/rentas.component';
import { VentasComponent } from './views/historial/ventas/ventas.component';
import { DashboardView } from './views/dashboard/dashboard.view';
import { MVVComponent } from './views/listados/mvv/mvv.component';
// import { MisionComponent } from './views/mvv/mision/mision.component';
import { EstadisticaComponent } from './views/estadistica/estadistica.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '',
    component: TitularComponent,
    children: [
      {
        path: 'home',
        component: DashboardView,
      },

      {
        path: 'historial-rentas',
        component: RentasComponent,
      },
      {
        path: 'historial-ventas',
        component: VentasComponent,
      },
      {
        path: 'Empresa',
        component: MVVComponent,
        // component: MisionComponent,
      },
      {
        path: 'Estadisticas',
        component: EstadisticaComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TitularRoutingModule {}
