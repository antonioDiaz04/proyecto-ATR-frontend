import { data } from 'jquery';
import { SessionService } from './../../../../shared/services/session.service';
import { UsuarioService } from './../../../../shared/services/usuario.service';
import { NotificacionService } from './../../../../shared/services/notification.service';
import { Component } from '@angular/core';
import { response } from 'express';

// Define un tipo para las pestañas
type TabType = 'all' | 'reviews' | 'purchases' | 'rentals' | 'offers';
interface Notification {
  id: number;
  type: 'review' | 'purchase' | 'rental' | 'offer' | 'new_product';
  title: string;
  message: string;
  date: Date;
  status?:
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'completed'
    | 'active'
    | 'expired';
  read: boolean;
  customer?: string;
  product?: string;
  rating?: number;
  price?: number;
  dueDate?: Date;
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
    private uss: UsuarioService,
    private sessionService: SessionService,
    private notificacionesService: NotificacionService
  ) {}

  ngOnInit() { 
    this.getData();
    this.loadNotifications();
  }

  getData(): void {
    const userData = this.sessionService.getId();
    if (userData) {
      this.id = userData;
      if (this.id) {
        this.uss.detalleUsuarioById(this.id).subscribe((data) => {
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
}
