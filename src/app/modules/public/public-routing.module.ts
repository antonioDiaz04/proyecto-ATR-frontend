import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeView } from './views/home/home.view';
import path from 'path';
import { PublicComponent } from './public.component';
import { AcercaDeView } from './views/acerca-de/acerca-de.view';
import { ConfigView } from './views/config/config.view';
import { DetailsProductView } from './views/details-product/details-product.view';
import { PerfilView } from './views/perfil/perfil.view';
import { TerminosComponent } from './views/terminos/terminos.component';
import { PoliticasComponent } from './views/politicas/politicas.component';
import { CitasProbadorView } from './views/citas-probador/citas-probador.view';
import { ResultsComponent } from './views/results/results.component';
import { NotFoundComponent } from './views/not-found/not-found.component';
import { Error500Component } from './views/error500/error500.component';
import { TagComponent } from './components/tag/tag.component';
import { ProcessRentaComponent } from './views/process-renta/process-renta.component';
// import { ComprasComponent } from "./views/compras/compras.component";
import { ProcessCompraComponent } from './views/process-compra/process-compra.component';
import { MisionVisionComponent } from './views/mision-vision/mision-vision.component';
import { PreguntasComponent } from './views/preguntas/preguntas.component';
import { NuevosLlegadasView } from './views/nuevos-llegadas/nuevos-llegadas.view';
import { LookAccesorioComponent } from './views/look-accesorio/look-accesorio.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full',
  },
  {
    path: '',
    component: PublicComponent,
    children: [
      {
        path: 'inicio',
        component: HomeView,
        data: {
          title: 'inicio',
          breadcrumb: 'inicio',
        },
      },
      {
        path: 'AcercaDe',
        component: AcercaDeView,
        data: {
          title: 'AcercaDe',
          breadcrumb: 'Acerca de la empresa',
        },
      },
      {
        path: 'Nuevos',
        component: NuevosLlegadasView,
        data: {
          title: 'Nuevos',
          breadcrumb: 'Nuevos',
        },
      },
      {
        path: 'terminos',
        component: TerminosComponent,
        data: {
          title: 'terminos',
          breadcrumb: 'terminos',
        },
      },
      {
        path: 'Preguntas',
        component: PreguntasComponent,
        data: {
          title: 'Preguntas',
          breadcrumb: 'Preguntas',
        },
      },
      {
        path: 'politicas',
        component: PoliticasComponent,
        data: {
          title: 'politicas',
          breadcrumb: 'politicas',
        },
      },
      {
        path: 'look',
        component: LookAccesorioComponent,
        data: {
          title: 'look',
          breadcrumb: 'look',
        },
      },
      {
        path: 'search',
        component: ResultsComponent,
        data: { title: 'search', breadcrumb: 'busqueda' },
      },
      {
        path: 'search/:query',
        component: ResultsComponent,
        data: {
          title: 'search',
          breadcrumb: 'productos',
        },
      },
      {
        path: 'Mi-perfil',
        component: PerfilView,
        data: {
          title: 'Mi perfil',
          breadcrumb: 'Mi perfil',
        },
      },
      {
        path: 'MisionVision',
        component: MisionVisionComponent,
        data: {
          title: 'Misión y Visión',
          breadcrumb: 'Misión y Visión',
        },
      },
      {
        path: 'CitasProbador',
        component: CitasProbadorView,
        data: {
          title: 'carrito',
          breadcrumb: 'carrito',
        },
      },
      { path: 'Config', component: ConfigView },
      {
        path: 'Detail/:id',
        component: DetailsProductView,
        data: {
          title: 'Detalle del Producto',
          breadcrumb: 'Detalle del Producto',
        },
      },
      {
        path: 'continuarRenta/:id',
        component: ProcessRentaComponent,
      },
      {
        path: 'continuarCompra/:id',
        component: ProcessCompraComponent,
        // data: {
        //   title: "Renata de producto",
        //   breadcrumb: "Renta del Producto",
        // },
      },
      {
        path: '404',
        component: NotFoundComponent,
        data: {
          title: 'pagina no encontrada',
          breadcrumb: 'pagina no encontrada',
        },
      },
      {
        path: '500',
        component: Error500Component,
        data: {
          title: 'error del servidor',
          breadcrumb: '500',
        },
      },
      {
        path: 'carga',
        component: Error500Component,
        data: {
          title: 'carga',
          breadcrumb: 'carga',
        },
      },
      {
        path: 'Servicios',
        component: TagComponent,
        data: {
          title: 'servicios y ayuda',
          breadcrumb: 'Servicios',
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PublicRoutingModule {}
