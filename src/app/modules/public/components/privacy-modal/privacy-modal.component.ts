import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-privacy-modal',
  templateUrl: './privacy-modal.component.html',
  styles: `

/* src/app/privacy-modal/privacy-modal.component.css */

/* Estilos para un scrollbar más minimalista (solo funciona en algunos navegadores) */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px; /* Ancho del scrollbar */
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1; /* Color del track del scrollbar */
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1; /* Color del "pulgar" del scrollbar (gray-300 de Tailwind) */
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #a0aec0; /* Color al pasar el ratón (gray-400 de Tailwind) */
}`
})
export class PrivacyModalComponent {
@Input() isOpen: boolean = false; // Controla la visibilidad del modal desde el padre
  @Output() closeModal = new EventEmitter<void>(); // Emite un evento cuando el modal debe cerrarse

  constructor() { }

  close(): void {
    this.isOpen = false;
    this.closeModal.emit(); // Notifica al componente padre para que actualice el estado
  }

  // Cierra el modal si se hace clic en el overlay (fuera del contenido)
  closeModalOnClickOutside(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('bg-opacity-50')) {
      this.close();
    }
  }
}
