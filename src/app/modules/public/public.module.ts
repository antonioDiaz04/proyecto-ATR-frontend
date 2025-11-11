import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { PublicRoutingModule } from './public-routing.module';
import { PublicComponent } from './public.component';
import { HomeView } from './views/home/home.view';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { SidebarModule } from 'primeng/sidebar';
import { AcercaDeView } from './views/acerca-de/acerca-de.view';
import { FooterComponent } from './components/footer/footer.component';
import { PerfilView } from './views/perfil/perfil.view';
import { MenuModule } from 'primeng/menu';
import { CheckboxModule } from 'primeng/checkbox';
import { DetailsProductView } from './views/details-product/details-product.view';
import { SkeletonModule } from 'primeng/skeleton';
import { CarritoView } from './views/carrito/carrito.view';
import { DatosEmpresaService } from '../../shared/services/datos-empresa.service';
import { ControlAdministrativaService } from '../../shared/services/control-administrativa.service';
import { TabMenuModule } from 'primeng/tabmenu';
import { GalleriaModule } from 'primeng/galleria';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { Toast, ToastrService } from 'ngx-toastr';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { SignUpService } from '../auth/commons/services/sign-up.service';
import { UsuarioService } from '../../shared/services/usuario.service';
import { TagComponent } from './components/tag/tag.component';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { PaginatorModule } from 'primeng/paginator';
import { ThemeServiceService } from '../../shared/services/theme-service.service';
import { ProductoService } from '../../shared/services/producto.service';
import { TransactionService } from '../../shared/services/transaction.service';
import { InputGroupModule } from 'primeng/inputgroup';
import { SessionService } from '../../shared/services/session.service';
import { mensageservice } from '../../shared/services/mensage.service';
import { SignInService } from '../auth/commons/services/sign-in.service';
import { PasswordModule } from 'primeng/password';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { PoliticasComponent } from './views/politicas/politicas.component';
import { TerminosComponent } from './views/terminos/terminos.component';
import { CitasProbadorView } from './views/citas-probador/citas-probador.view';
import { ResultsComponent } from './views/results/results.component';
import { HeroImgComponent } from './components/hero-img/hero-img.component';
import { IndexedDbService } from './commons/services/indexed-db.service';
import { FigureComponent } from './components/figure/figure.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { NotFoundComponent } from './views/not-found/not-found.component';
import { Error500Component } from './views/error500/error500.component';
import { SidevarComponent } from './components/sidevar/sidevar.component';
import { CargaComponent } from './components/carga/carga.component';
import { CarouselModule } from 'primeng/carousel';
import { ProductosComponent } from './views/productos/productos.component';
const MATERIALS = [
  PasswordModule,
  InputMaskModule,
  ImageModule,
  InputTextModule,
  FormsModule,
  InputGroupModule,
  AvatarModule,
  AvatarGroupModule,
  PaginatorModule,
  OverlayPanelModule,
  TieredMenuModule,
  SkeletonModule,
  CardModule,
  TabMenuModule,
  ButtonModule,
  DialogModule,
  SidebarModule,
  CheckboxModule,
  MenuModule,
];
const COMPONENTS = [FooterComponent];
const VIEWS = [
  HomeView,
  PublicComponent,
  PerfilView,
  AcercaDeView,
  DetailsProductView,
  DataCompraComponent,
];

import { ImageModule } from 'primeng/image';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { ProcessRentaComponent } from './views/process-renta/process-renta.component';
import { DataCompraComponent } from './views/data-compra/data-compra.component';
import { InformacionUserComponent } from './views/informacion-user/informacion-user.component';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ProcessCompraComponent } from './views/process-compra/process-compra.component';
import { VentayrentaService } from '../../shared/services/ventayrenta.service';
import { RentasComponent } from './views/rentas/rentas.component';
import { AccesoriosComponent } from './components/accesorios/accesorios.component';
import { CartService } from '../../shared/services/cart.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageModule } from 'primeng/message';
import { ComentariosComponent } from './components/comentarios/comentarios.component';
import { CsrfInterceptor } from '../../shared/services/csrf.interceptor';
import { HeaderModule } from '../../shared/components/header/header.module';
import { MisionVisionComponent } from './views/mision-vision/mision-vision.component';
import { PreguntasComponent } from './views/preguntas/preguntas.component';
import { NotificacionService } from '../../shared/services/notification.service';
import { ReseniaService } from '../../shared/services/resenia.service';
import { NuevosLlegadasView } from './views/nuevos-llegadas/nuevos-llegadas.view';
import { IncluyeAccesorioView } from './views/incluye-accesorio/incluye-accesorio.view';
import { LookAccesorioComponent } from './views/look-accesorio/look-accesorio.component';

import { NetworkModalComponent } from '../../network-modal/network-modal.component';
// 🚨 Importaciones de NGRX que debes agregar
import { StoreModule } from '@ngrx/store';
// import { EffectsModule } from '@ngrx/effects';

// 🚨 Placeholder para tu lógica NgRx (DEBES CREAR ESTOS ARCHIVOS)
// import { productReducers } from './commons/store/products/product.reducers';
// import { ProductEffects } from './commons/store/products/product.effects';
// Si el archivo del componente usa selectores, agrégalos aquí.

// import { IncluyeAccesorioView } from './view/incluye-accesorio/incluye-accesorio.view';
@NgModule({
  declarations: [VIEWS,NetworkModalComponent,COMPONENTS, CarritoView, TagComponent, PoliticasComponent, TerminosComponent, CitasProbadorView, ResultsComponent, HeroImgComponent, FigureComponent, BreadcrumbComponent, NotFoundComponent, Error500Component, SidevarComponent, CargaComponent, ProductosComponent, ProcessRentaComponent, DataCompraComponent, InformacionUserComponent, ProcessCompraComponent, RentasComponent, AccesoriosComponent, ComentariosComponent, MisionVisionComponent, PreguntasComponent, NuevosLlegadasView, IncluyeAccesorioView, LookAccesorioComponent],
  exports:[COMPONENTS],
  imports: [HeaderModule,InputTextModule,FloatLabelModule,
    InputNumberModule,ConfirmDialogModule,MessageModule,
    CalendarModule,TableModule,NgxImageZoomModule,GalleriaModule,CarouselModule,
    CommonModule,ReactiveFormsModule,
    PublicRoutingModule,HttpClientModule, 
    // 🚨 REGISTRO DE NGRX STORE PARA ESTE MÓDULO (FEATURE) 🚨
    // 'productsFeature' es el nombre de la porción del estado.
    // StoreModule.forFeature('productsFeature', productReducers), 
    
    // 🚨 REGISTRO DE NGRX EFFECTS PARA ESTE MÓDULO 🚨
    // EffectsModule.forFeature([ProductEffects]),
    
    ...MATERIALS,
    ToastModule,
  ], schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: CsrfInterceptor,
    multi: true, // Permite múltiples interceptores
  },VentayrentaService,Toast,MessageService,provideClientHydration(), [provideHttpClient(withFetch())],
  SessionService,ReseniaService,
  mensageservice,
  UsuarioService,ProductoService,
  TransactionService,
  ToastrService,CartService,NotificacionService,
  MessageService,IndexedDbService,
  ConfirmationService,SignInService,
  SignUpService,UsuarioService,DatosEmpresaService,ControlAdministrativaService,ThemeServiceService],
})
export class PublicModule {}
