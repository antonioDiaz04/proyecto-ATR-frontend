import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// import { CollapsedStateService } from '../../../../shared/services/collapsed-state.service';


@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.view.html',
  // styleUrl: './configuracion.view.scss'
})
export class ConfiguracionView {
  tabs = [
    { path: '', title: 'Resumen', icon: 'pi pi-home', exact: true },
    { path: 'perfil-administrador', title: 'Perfil Admin', icon: 'pi pi-user' },
    { path: 'ajustes-generales', title: 'Ajustes', icon: 'pi pi-sliders-h' },
    { path: 'documentos-legales', title: 'Documentos', icon: 'pi pi-file' },
    { path: 'notificaciones', title: 'Notificaciones', icon: 'pi pi-bell' },
    { path: 'perfil-empresa', title: 'Empresa', icon: 'pi pi-building' }
  ];

  constructor(private router: Router, private route: ActivatedRoute) {}

  isActiveTab(path: string): boolean {
    if (path === '') {
      return this.router.url === '/admin/configuracion';
    }
    return this.router.url.includes(`/admin/configuracion/${path}`);
  }
}