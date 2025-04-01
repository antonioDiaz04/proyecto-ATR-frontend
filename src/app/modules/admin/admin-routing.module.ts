import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeView } from './views/home/home.view';
import { ControlClientesView } from './views/control-clientes/control-clientes.view';
import { ReportesView } from './views/reportes/reportes.view';
import { ConfiguracionView } from './views/configuracion/configuracion.view';
import { PoliticasView } from './views/politicas/politicas.view';
import { ListadoPoliticaComponent } from './components/listado-politica/listado-politica.component';
import { ControlProductosView } from './views/control-productos/control-productos.view';
import { ListadoProductosComponent } from './components/listado-productos/listado-productos.component';
import { RegistoProductoComponent } from './components/registo-producto/registo-producto.component';
import { ListadoClientesComponent } from './components/listado-clientes/listado-clientes.component';
import { ControlVentasView } from './views/control-ventas/control-ventas.view';
import { ListadoVentaComponent } from './components/listado-venta/listado-venta.component';
import { AdminComponent } from './admin.component';
import { ControlRentasView } from './views/control-rentas/control-rentas.view';
import { ListadoRentaComponent } from './components/listado-renta/listado-renta.component';
import { RegistroRentaComponent } from './components/registro-renta/registro-renta.component';
import { RegistroVentaComponent } from './components/registro-venta/registro-venta.component';
import { PerfilAdministradorComponent } from './components/perfil-administrador/perfil-administrador.component';
import { AjustesGeneralesComponent } from './components/ajustes-generales/ajustes-generales.component';
import { NotificacionesComponent } from './components/notificaciones/notificaciones.component';
import { HistorialPoliticasComponent } from './components/historial-politicas/historial-politicas.component';
import { DocumentosLegalesComponent } from './components/documentos-legales/documentos-legales.component';
import { DeslindeLegalComponent } from './components/deslinde-legal/deslinde-legal.component';
import { PerfilEmpresaComponent } from './components/perfil-empresa/perfil-empresa.component';
import { RegistroTerminosCondicionesComponent } from './components/registro-terminos-condiciones/registro-terminos-condiciones.component';
import { ListadoTerminosCondicionesComponent } from './components/listado-terminos-condiciones/listado-terminos-condiciones.component';
import { HistorialTerminosCondicionesComponent } from './components/historial-terminos-condiciones/historial-terminos-condiciones.component';
import { ListadoDeslindeLegalComponent } from './components/listado-deslinde-legal/listado-deslinde-legal.component';
import { HistorialDeslindeLegalComponent } from './components/historial-deslinde-legal/historial-deslinde-legal.component';
import { adminGuard } from '../../shared/guards/auth.guard';
import { RegistroPoliComponent } from './components/registro-poli/registro-poli.component';
import { AddAccesorioComponent } from './components/add-accesorio/add-accesorio.component';
import { ControlAccesorioView } from './views/control-accesorio/control-accesorio.view';
import { ListadoAccesorioComponent } from './components/listado-accesorio/listado-accesorio.component';
import { AsignarAccesoriosVestidoComponent } from './components/asignar-accesorios-vestido/asignar-accesorios-vestido.component';
import { ListadoAcsVestidoRentaComponent } from './components/listado-acs-vestido-renta/listado-acs-vestido-renta.component';
import { CategoriaComponent } from './components/categoria/categoria.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: 'home',
        component: HomeView,
      },
      {
        path: 'lista-categorias',
        component: CategoriaComponent,
      },
      {
        path: 'cliente',
        component: ControlClientesView,
        children: [
          {
            path: 'lista-clientes',
            component: ListadoClientesComponent,
          },
          {
            path: '',
            redirectTo: 'lista-clientes',
            pathMatch: 'full',
          },  
        ],
      },
      {
        path: 'control-clientes',
        component: ControlClientesView,
        children: [
          {
            path: 'lista-clientes',
            component: ListadoClientesComponent,
          },
          {
            path: '',
            redirectTo: 'lista-clientes',
            pathMatch: 'full',
          },
        ],
      },
      {
        path: 'control-productos',
        component: ControlProductosView,
        children: [
          {
            path: 'lista-productos',
            component: ListadoProductosComponent,
          },
          {
            path: 'registro-producto',
            component: RegistoProductoComponent,
          },
          {
            path: 'edit-producto/:id',
            component: RegistoProductoComponent,
          },
          {
            path: '',
            redirectTo: 'registro-producto',
            pathMatch: 'full',
          },
        ],
      },
      {
        path: 'control-asignar-acs-vestido-renta',
        component: ControlAccesorioView,
        children: [
          {

            path: 'lista-vestidos-acss',
            component: ListadoAcsVestidoRentaComponent,
          },
          {
            path: 'asignar-vestido-accesorio',
            component: AsignarAccesoriosVestidoComponent,
          },
          //   {
          //     path: '',
          //     redirectTo: 'registro-producto',
          //     pathMatch: 'full',
          //   },
        ]     // ],
      },
      {
        path: 'control-Accesorios',
        component: ControlAccesorioView,
        children: [
          {
            path: 'lista-Accesorios',
            component: ListadoAccesorioComponent,
          },
          {
            path: 'registro-Accesorios',
            component: AddAccesorioComponent,
          },
          {
            path: '',
            redirectTo: 'registro-producto',
            pathMatch: 'full',
          },
        ],
      },
      {
        path: 'control-venta',
        component: ControlVentasView,
        children: [
          {
            path: 'lista-venta',
            component: ListadoVentaComponent,
          },
          {
            path: 'registro-venta',
            component: RegistroVentaComponent,
          },
          {
            path: '',
            redirectTo: 'lista-venta',
            pathMatch: 'full',
          },
        ],
      },
      {
        path: 'control-renta',
        component: ControlRentasView,
        children: [
          {
            path: 'lista-renta',
            component: ListadoRentaComponent,
          },
          {
            path: 'registro-renta',
            component: RegistroRentaComponent,
          },
          {
            path: '',
            redirectTo: 'lista-renta',
            pathMatch: 'full',
          },
        ],
      },
      {
        path: 'reportes',
        component: ReportesView,
      },
      {
        path: 'historial',
        component: ReportesView,
      },
      {
        path: 'configuracion',
        component: ConfiguracionView,
        children: [
          {
            path: 'perfil-administrador',
            component: PerfilAdministradorComponent, // El componente que renderiza "Perfil de administrador"
          },
          {
            path: 'ajustes-generales',
            component: AjustesGeneralesComponent, // El componente que renderiza "Ajustes generales"
          },
          {
            path: 'documentos-legales',
            component: DocumentosLegalesComponent, // El componente que renderiza "Ajustes generales"
          },

          {
            path: 'terminos-condiciones',
            component: RegistroTerminosCondicionesComponent, // El componente que renderiza "Condiciones"
          },
          {
            path: 'listado-terminos-condiciones',
            component: ListadoTerminosCondicionesComponent, // El componente que renderiza "Condiciones"
          },
          {
            path: 'listado-politica',
            component: ListadoPoliticaComponent, // El componente que renderiza "Condiciones"
          },
          {
            path: 'registo-politica',
            component: RegistroPoliComponent, // El componente que renderiza "Condiciones"
          },
          {
            path: 'historial-listado-politica/:id',
            component: HistorialPoliticasComponent, // El componente que renderiza "Condiciones"
          },
          {
            path: 'registo-politica',
            component: RegistroPoliComponent, // El componente que renderiza "Condiciones"
          },
          {
            path: 'historial-terminos-condiciones/:id',
            component: HistorialTerminosCondicionesComponent, // El componente que renderiza "Condiciones"
          },
          {
            path: 'historial-deslinde-legal/:id',
            component: HistorialDeslindeLegalComponent, // El componente que renderiza "Condiciones"
          },
          {
            path: 'listado-legal',
            component: ListadoDeslindeLegalComponent, // Componente para manejar el deslinde legal
          },
          {
            path: 'deslinde-legal',
            component: DeslindeLegalComponent, // Componente para manejar el deslinde legal
          },

          {
            path: 'perfil-empresa',
            component: PerfilEmpresaComponent,
          },
          {
            path: '',
            redirectTo: 'lista-clientes',
            pathMatch: 'full',
          },
          {
            path: 'notificaciones',
            component: NotificacionesComponent, // El componente que renderiza "Notificaciones"
          },
          {
            path: '',
            redirectTo: 'perfil-administrador',
            pathMatch: 'full',
          },
        ],
      },
      // {
      //   path: '**', // Ruta wildcard para manejar rutas no encontradas
      //   redirectTo: 'inicio', // O puedes redirigir a otra ruta
      // },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule { }
