import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing.module';
import { FooterComponent } from './components/footer/footer.component';
import { HomeView } from './views/home/home.view';
// import { HeaderComponent } from '../public/components/header/header.component';
import { AdminComponent } from './admin.component';
import { RouterModule } from '@angular/router';
import { ClientesService } from '../../shared/services/clientes.service';
import { SessionService } from '../../shared/services/session.service';
import { StorageService } from '../../shared/services/storage.service';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
// import { CrudTerminosCondicionesView } from './views/crud-terminos-condiciones/crud-terminos-condiciones.view';
import { ControlClientesView } from './views/control-clientes/control-clientes.view';
import { ControlProductosView } from './views/control-productos/control-productos.view';
import { ControlVentasView } from './views/control-ventas/control-ventas.view';
import { ControlRentasView } from './views/control-rentas/control-rentas.view';
import { HistorialView } from './views/historial/historial.view';
import { RegistroRentaComponent } from './components/registro-renta/registro-renta.component';
import { ListadoRentaComponent } from './components/listado-renta/listado-renta.component';
import { RegistroVentaComponent } from './components/registro-venta/registro-venta.component';
import { RegistoProductoComponent } from './components/registo-producto/registo-producto.component';
import { RegistroTerminosCondicionesComponent } from './components/registro-terminos-condiciones/registro-terminos-condiciones.component';
import { ListadoPoliticaComponent } from './components/listado-politica/listado-politica.component';
import { ListadoProductosComponent } from './components/listado-productos/listado-productos.component';
import { ListadoVentaComponent } from './components/listado-venta/listado-venta.component';
import { ListadoComentarioComponent } from './components/listado-comentario/listado-comentario.component';
import { ConfiguracionView } from './views/configuracion/configuracion.view';
import { ReportesView } from './views/reportes/reportes.view';
import { PoliticasView } from './views/politicas/politicas.view';
import { ListadoClientesComponent } from './components/listado-clientes/listado-clientes.component';
import { ControlAdministrativaService } from '../../shared/services/control-administrativa.service';
import { PerfilAdministradorComponent } from './components/perfil-administrador/perfil-administrador.component';
import { AjustesGeneralesComponent } from './components/ajustes-generales/ajustes-generales.component';
import { NotificacionesComponent } from './components/notificaciones/notificaciones.component';
import { UsuarioService } from '../../shared/services/usuario.service';
import { DatosEmpresaService } from '../../shared/services/datos-empresa.service';
import { HeaderComponent } from './components/header/header.component';
import { provideClientHydration } from '@angular/platform-browser';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import {  ToastrModule } from 'ngx-toastr';
import { TabViewModule } from 'primeng/tabview';
import { AvatarModule } from 'primeng/avatar';
import { PaginatorModule } from 'primeng/paginator';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { MessageService } from 'primeng/api';
import { Toast } from '../../shared/services/toast.service';
import { ToastModule } from 'primeng/toast';
import { ProductoService } from '../../shared/services/producto.service';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { HeaderPrincipalComponent } from './components/header-principal/header-principal.component';
import { RegistroPoliComponent } from './components/registro-poli/registro-poli.component';
import { AddAccesorioComponent } from './components/add-accesorio/add-accesorio.component';
import { ListadoAccesorioComponent } from './components/listado-accesorio/listado-accesorio.component';
import { ControlAccesorioView } from './views/control-accesorio/control-accesorio.view';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AsignarAccesoriosVestidoComponent } from './components/asignar-accesorios-vestido/asignar-accesorios-vestido.component';
import { PickListModule } from 'primeng/picklist';
import { ConstrolAccesoriosVestidoView } from './views/constrol-accesorios-vestido/constrol-accesorios-vestido.view';
import { AsignarAcsVestidoRentaComponent } from './components/asignar-acs-vestido-renta/asignar-acs-vestido-renta.component';
import { ListadoAcsVestidoRentaComponent } from './components/listado-acs-vestido-renta/listado-acs-vestido-renta.component';
import { VentayrentaService } from '../../shared/services/ventayrenta.service';
import { CategoriaComponent } from './components/categoria/categoria.component';
import { CategoriaService } from '../../shared/services/categoria.service';
import { ChartModule } from 'primeng/chart';

const VIEWS = [HomeView, FooterComponent];

const MATERIALS = [ChartModule, DragDropModule,ButtonModule, DropdownModule, InputTextModule, CardModule,CalendarModule, InputNumberModule, ToastrModule,TabViewModule,
  AvatarModule, PaginatorModule,AvatarGroupModule, DialogModule,TableModule,IconFieldModule,InputIconModule
]
@NgModule({
  declarations: [
    VIEWS,

    
    AdminComponent,


    ListadoClientesComponent,
    ControlClientesView,
    ControlProductosView,
    ControlVentasView,
    ControlRentasView,
    HistorialView,
    RegistroRentaComponent,
    ListadoRentaComponent,
    HeaderComponent,
    FooterComponent,
    RegistroVentaComponent,
    RegistoProductoComponent,
    RegistroTerminosCondicionesComponent,
    ListadoPoliticaComponent,
    ListadoProductosComponent,
    ListadoVentaComponent,
    ListadoComentarioComponent,
    ConfiguracionView,
    ReportesView,
    PoliticasView,
    ListadoClientesComponent,
    PerfilAdministradorComponent,
    AjustesGeneralesComponent,
    NotificacionesComponent,
    HeaderPrincipalComponent,
    RegistroPoliComponent,
    AddAccesorioComponent,
    ListadoAccesorioComponent,
    ControlAccesorioView,
    AsignarAccesoriosVestidoComponent,
    ConstrolAccesoriosVestidoView,
    AsignarAcsVestidoRentaComponent,
    ListadoAcsVestidoRentaComponent,
    CategoriaComponent,

  ],
  imports: [ MATERIALS,ReactiveFormsModule,ToastModule ,CommonModule, AdminRoutingModule, FormsModule,HttpClientModule,],
  providers: [VentayrentaService,
    UsuarioService,
    ControlAdministrativaService,
    ClientesService,
    StorageService,CategoriaService,
    SessionService,ProductoService,
    DatosEmpresaService,Toast, MessageService, provideClientHydration(), [provideHttpClient(withFetch())],
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AdminModule {}
