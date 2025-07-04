import { SessionService } from '../../../../shared/services/session.service';
import { Component, OnInit } from '@angular/core';
import { NotificacionService } from '../../../../shared/services/notification.service';
import { UsuarioService } from '../../../../shared/services/usuario.service';

interface Notificacion {
  _id: string;
  titulo: string;
  contenido: string;
  fecha: string;
  tipo: string;
  estado: 'leido' | 'no_leido';
  seleccionada?: boolean;
  datosAdicionales?: {
    icon?: string;
    image?: string;
    actions?: { action: string; title: string; icon?: string }[];
  };
}

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.component.html'
})
export class NotificacionesComponent implements OnInit {
  notificaciones: Notificacion[] = [];
  notificacionesFiltradas: Notificacion[] = [];
  data: any = {};
  id!: string;
  
  // Filtros
  filtroEstado: string = 'todos';
  filtroTipo: string = 'todos';
  tiposDisponibles = ['info', 'advertencia', 'alerta', 'error', 'exito'];

  constructor(
    private usuarioService: UsuarioService,
    private sessionService: SessionService,
    private notificacionesService: NotificacionService
  ) {
        // this.notificaciones.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
  }

  ngOnInit() { 
    this.getData();
    this.loadNotifications();
  }

  getData(): void {
    const userData = this.sessionService.getId();
    if (userData) {
      this.id = userData;
      if (this.id) {
        this.usuarioService.detalleUsuarioById(this.id).subscribe((data) => {
          this.data = data;
        });
      }
    }
  }

 loadNotifications(): void {
    this.notificacionesService.obtenerNotificacionesPorUsuario(this.id).subscribe((response) => {
      if (response && response.success && Array.isArray(response.data)) {
        this.notificaciones = response.data;
        console.log('success', response);
        if (response.data.length > 0) {
          const first = response.data[0];
          console.log('data', first);
          console.log('0', first._id);
          console.log('usuario', first.usuario);
          console.log('titulo', first.titulo);
          console.log('contenido', first.contenido);
          console.log('estado', first.estado);
          console.log('tipo', first.tipo);
          console.log('prioridad', first.prioridad);
          if (first.datosAdicionales) {
            console.log('datosAdicionales', first.datosAdicionales);
            console.log('icon', first.datosAdicionales.icon);
            if (first.datosAdicionales.actions) {
              first.datosAdicionales.actions.forEach((action: any, idx: number) => {
                console.log(`${idx}`, action.action, action.title);
              });
            }
          }
          if (first.vibrate) {
            first.vibrate.forEach((v: any, idx: number) => {
              console.log('vibrate', idx, v);
            });
          }
          console.log('fecha', first.fecha);
          console.log('__v', first.__v);
        }
      } else {
        // this.notificaciones = Notificacion[];
        console.log('No notifications found or invalid response');
      }
    });
  }

  aplicarFiltros(): void {
    this.notificacionesFiltradas = this.notificaciones.filter(noti => {
      const cumpleEstado = this.filtroEstado === 'todos' || noti.estado === this.filtroEstado;
      const cumpleTipo = this.filtroTipo === 'todos' || noti.tipo === this.filtroTipo;
      return cumpleEstado && cumpleTipo;
    });
  }

  obtenerIconoTipo(tipo: string): string {
    const tipos = {
      info: 'ℹ️',
      advertencia: '⚠️',
      alerta: '⚠️',
      error: '❌',
      exito: '✅'
    };
    return tipos[tipo as keyof typeof tipos] || '🔔';
  }

  marcarComoLeido(id: string): void {
    const noti = this.notificaciones.find(n => n._id === id);
    if (noti && noti.estado === 'no_leido') {
      noti.estado = 'leido';
      this.notificacionesService.marcarComoLeido(id).subscribe();
      this.aplicarFiltros();
    }
  }

  seleccionarTodas(): void {
    const todasSeleccionadas = this.notificacionesFiltradas.every(n => n.seleccionada);
    this.notificacionesFiltradas.forEach(n => n.seleccionada = !todasSeleccionadas);
  }

  marcarSeleccionadasComoLeidas(): void {
    const idsSeleccionadas = this.notificacionesFiltradas
      .filter(n => n.seleccionada && n.estado === 'no_leido')
      .map(n => n._id);
    
    if (idsSeleccionadas.length > 0) {
      this.notificacionesService.marcarVariasComoLeidas(idsSeleccionadas).subscribe(() => {
        this.loadNotifications(); // Recargar notificaciones después de actualizar
      });
    }
  }

  manejarAccion(id: string, accion: string): void {
    // Aquí puedes implementar la lógica para cada acción
    console.log(`Acción "${accion}" en notificación ${id}`);
    
    // Ejemplo: si la acción es "view_cart", podrías navegar al carrito
    if (accion === 'view_cart') {
      // this.router.navigate(['/carrito']);
    }
    
    // Marcar como leído al interactuar
    this.marcarComoLeido(id);
  }


  scannerActivo = false;
  vincularMensaje = '';
  vincularExito = false;
  wearToken: string = '';
  wearDeviceId: string = '';
  usuarioActualId: string = '';
  
  activarScanner() {
    this.vincularMensaje = '';
    this.vincularExito = false;
    this.scannerActivo = true;
  }

  vincularDispositivo() {
    const payload = {
      usuarioId: this.usuarioActualId,
      token: this.wearToken,
      deviceId: this.wearDeviceId,
    };

    console.log(payload);
    this.usuarioService.vincularDispositivo(payload).subscribe({
      next: () => {
        this.vincularExito = true;
        this.vincularMensaje = '¡Dispositivo vinculado exitosamente!';
      },
      error: (err) => {
        console.error(err);
        this.vincularExito = false;
        this.vincularMensaje = 'Error al vincular el dispositivo.';
      },
    });
  }

  onCodeResult(result: string) {
    this.scannerActivo = false;
    const partes = result.split('|');

    if (partes.length === 2) {
      this.wearToken = partes[0];
      this.wearDeviceId = partes[1];

      const usuarioId = this.sessionService.getId(); // O donde guardes tu sesión
      if (usuarioId) {
        this.usuarioActualId = usuarioId;
        this.vincularDispositivo();
      } else {
        this.vincularMensaje = 'No se pudo obtener el ID del usuario';
        this.vincularExito = false;
      }
    } else {
      this.vincularMensaje = 'QR inválido';
      this.vincularExito = false;
    }
  }
}
