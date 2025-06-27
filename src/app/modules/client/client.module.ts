import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientRoutingModule } from './client-routing.module';
import { PerfilComponent } from './views/perfil/perfil.component';
import { RentasComponent } from './views/rentas/rentas.component';
import { ReportarIncidenteComponent } from './views/reportar-incidente/reportar-incidente.component';
import { ClientComponent } from './client.component';
import { SessionService } from '../../shared/services/session.service';
import { VentayrentaService } from '../../shared/services/ventayrenta.service';
import { ComprasComponent } from './views/compras/compras.component';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../shared/services/storage.service';
import { UsuarioService } from '../../shared/services/usuario.service';
import { provideClientHydration } from '@angular/platform-browser';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { AvatarModule } from 'primeng/avatar';
import { HeaderModule } from '../../shared/components/header/header.module';
import { NotificacionesComponent } from './views/notificaciones/notificaciones.component';
import { DatosEmpresaService } from '../../shared/services/datos-empresa.service';
import { SidenavComponent } from './sidenav/sidenav.component';
import { ProductoService } from '../../shared/services/producto.service';
import { ReseniaService } from '../../shared/services/resenia.service';
import { NotificacionService } from '../../shared/services/notification.service';
import { SidebarModule } from 'primeng/sidebar';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    PerfilComponent,
    RentasComponent,
    ComprasComponent,
    ClientComponent,
    NotificacionesComponent,
    SidenavComponent,
    ReportarIncidenteComponent,
  ],
  imports: [
    HeaderModule,
    SidebarModule,
    CommonModule,
    ButtonModule,
    AvatarModule,
    AvatarGroupModule,
    ClientRoutingModule,
    FormsModule,
    ZXingScannerModule,
    ReactiveFormsModule
  ],
  providers: [
    DatosEmpresaService,
    NotificacionService,
    ProductoService,
    ReseniaService,
    SessionService,
    UsuarioService,
    StorageService,
    VentayrentaService,
    provideClientHydration(),
    [provideHttpClient(withFetch())]
  ],
})
export class ClientModule { }
