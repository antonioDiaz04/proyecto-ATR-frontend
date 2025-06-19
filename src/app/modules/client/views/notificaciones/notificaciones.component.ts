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
  templateUrl: './notificaciones.component.html',
  // styleUrls: ['./notificaciones.component.scss']
})
export class NotificacionesComponent {
  activeTab: TabType = 'all';

  // Define las pestañas con el tipo correcto
  tabs: { id: TabType; name: string }[] = [
    { id: 'all', name: 'Todas' },
    { id: 'reviews', name: 'Reseñas' },
    { id: 'purchases', name: 'Compras' },
    { id: 'rentals', name: 'Rentas' },
    { id: 'offers', name: 'Ofertas' },
  ];
  notifications: Notification[] = [
    // Notificaciones de reseñas
    {
      id: 1,
      type: 'review',
      title: 'Reseña aprobada',
      message: 'Tu reseña sobre el vestido de gala ha sido publicada',
      date: new Date('2023-11-15T09:30:00'),
      status: 'approved',
      read: false,
      customer: 'María González',
      product: 'Vestido de gala rojo',
      rating: 5,
    },
    {
      id: 2,
      type: 'review',
      title: 'Nueva reseña recibida',
      message: 'Tienes una nueva reseña pendiente de aprobación',
      date: new Date('2023-11-14T14:15:00'),
      status: 'pending',
      read: false,
      customer: 'Carlos Mendoza',
      product: 'Traje de noche azul',
      rating: 4,
    },

    // Notificaciones de compras
    {
      id: 3,
      type: 'purchase',
      title: 'Compra completada',
      message: 'El pago del vestido de fiesta ha sido procesado',
      date: new Date('2023-11-16T11:20:00'),
      status: 'completed',
      read: false,
      customer: 'Ana López',
      product: 'Vestido de fiesta dorado',
      price: 189.99,
    },
    {
      id: 4,
      type: 'purchase',
      title: 'Envío realizado',
      message: 'Tu pedido ha sido enviado',
      date: new Date('2023-11-13T16:45:00'),
      status: 'completed',
      read: true,
      customer: 'Juan Pérez',
      product: 'Conjunto formal negro',
    },

    // Notificaciones de rentas
    {
      id: 5,
      type: 'rental',
      title: 'Renta activa',
      message: 'Recuerda devolver el vestido antes de la fecha límite',
      date: new Date('2023-11-12T10:00:00'),
      status: 'active',
      read: false,
      customer: 'Laura Sánchez',
      product: 'Vestido de novia',
      dueDate: new Date('2023-11-19'),
    },
    {
      id: 6,
      type: 'rental',
      title: 'Renta completada',
      message: 'El vestido ha sido devuelto satisfactoriamente',
      date: new Date('2023-11-10T13:30:00'),
      status: 'completed',
      read: true,
      customer: 'Pedro Ramírez',
      product: 'Traje de etiqueta',
    },

    // Notificaciones de ofertas
    {
      id: 7,
      type: 'offer',
      title: 'Oferta especial',
      message: '20% de descuento en vestidos de noche esta semana',
      date: new Date('2023-11-16T08:00:00'),
      status: 'active',
      read: false,
      price: 159.99,
    },
    {
      id: 8,
      type: 'offer',
      title: 'Oferta expirada',
      message: 'La oferta en trajes de gala ha finalizado',
      date: new Date('2023-11-09T23:59:00'),
      status: 'expired',
      read: true,
    },

    // Notificaciones de nuevos productos
    {
      id: 9,
      type: 'new_product',
      title: 'Nueva colección',
      message: 'Hemos añadido 12 nuevos vestidos de verano',
      date: new Date('2023-11-15T10:00:00'),
      read: false,
    },
  ];

  scannerActivo = false;
  vincularMensaje = '';
  vincularExito = false;
  wearToken: string = '';
  wearDeviceId: string = '';
  usuarioActualId: string = '';

  constructor(
    private usuarioService: UsuarioService,
    private sessionService: SessionService,
    private notificacionService: NotificacionService
  ) {
    this.notifications.sort((a, b) => b.date.getTime() - a.date.getTime());
    //this.traerNotificacion();
  }

  // traerNotificacion() {
  //   const userId = this.sessionService.getId();
  //   console.log(userId)
  //   this.notificacionService.getNotificacionesId(userId).subscribe(
  //     (data) => {
  //       console.log(data);
  //     },
  //     (error) => {
  //       console.error('Error al cargar las notificaciones', error);
  //     }
  //   );
  // }

  get filteredNotifications() {
    switch (this.activeTab) {
      case 'reviews':
        return this.notifications.filter((n) => n.type === 'review');
      case 'purchases':
        return this.notifications.filter((n) => n.type === 'purchase');
      case 'rentals':
        return this.notifications.filter((n) => n.type === 'rental');
      case 'offers':
        return this.notifications.filter(
          (n) => n.type === 'offer' || n.type === 'new_product'
        );
      default:
        return this.notifications;
    }
  }

  deleteNotification(id: number): void {
    this.notifications = this.notifications.filter((n) => n.id !== id);
  }

  markAsRead(id: number): void {
    const notification = this.notifications.find((n) => n.id === id);
    if (notification) {
      notification.read = true;
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach((n) => (n.read = true));
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'review':
        return 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z';
      case 'purchase':
        return 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z';
      case 'rental':
        return 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z';
      case 'offer':
        return 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4';
      case 'new_product':
        return 'M12 6v6m0 0v6m0-6h6m-6 0H6';
      default:
        return 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9';
    }
  }

  getStatusColor(status?: string): string {
    if (!status) return 'bg-gray-100 text-gray-800';

    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

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
