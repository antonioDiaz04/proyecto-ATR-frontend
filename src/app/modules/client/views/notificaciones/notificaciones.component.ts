import { Component } from '@angular/core';

interface Notification {
  id: number;
  type: 'comment' | 'product';
  message: string;
  date: Date;
  priority: 'high' | 'medium' | 'low';
  status?: 'pending' | 'approved' | 'rejected' | 'purchased' | 'returned';
}

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.component.html',
  styleUrl: './notificaciones.component.scss'
})
export class NotificacionesComponent {
notifications: Notification[] = [
    {
      id: 1,
      type: 'comment',
      message: 'Tu comentario ha sido aprobado.',
      date: new Date('2023-10-25T10:00:00'),
      priority: 'medium',
      status: 'approved'
    },
    {
      id: 2,
      type: 'product',
      message: 'El producto "Zapatos deportivos" ha sido comprado.',
      date: new Date('2023-10-24T15:30:00'),
      priority: 'high',
      status: 'purchased'
    },
    {
      id: 3,
      type: 'product',
      message: 'El producto "Camiseta negra" está pendiente de revisión.',
      date: new Date('2023-10-23T09:15:00'),
      priority: 'low',
      status: 'pending'
    },
    {
      id: 4,
      type: 'product',
      message: 'El producto "Pantalón azul" ha sido devuelto.',
      date: new Date('2023-10-22T14:45:00'),
      priority: 'medium',
      status: 'returned'
    },
    {
      id: 5,
      type: 'comment',
      message: 'Tu comentario ha sido enviado.',
      date: new Date('2023-10-21T12:00:00'),
      priority: 'low',
      status: 'pending'
    }
  ];

  // Ordenar notificaciones por fecha (más reciente primero)
  constructor() {
    this.notifications.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  // Eliminar una notificación por su ID
  deleteNotification(id: number): void {
    this.notifications = this.notifications.filter(notification => notification.id !== id);
  }
}