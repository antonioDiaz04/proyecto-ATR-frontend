import { Component, OnInit } from '@angular/core';
import AOS from 'aos';

@Component({
  selector: 'app-preguntas',
  templateUrl: './preguntas.component.html',
})
export class PreguntasComponent implements OnInit {
// Datos de Preguntas Frecuentes


ngOnInit(): void {
    AOS.init({
        duration: 650, // Duración de la animación en milisegundos
          once: true, // Si `true`, la animación solo se ejecuta una vez
      });
}
faqs = [
  {
    question: '¿Cuáles son los métodos de pago?',
    answer: 'Aceptamos tarjetas (Visa/MasterCard), PayPal y transferencias bancarias.',
    isOpen: false
  },
  {
    question: '¿Cómo realizo devoluciones?',
    answer: 'Dispones de 15 días para solicitar cambios. El producto debe estar en perfecto estado.',
    isOpen: false
  },
  {
    question: '¿Hacen envíos internacionales?',
    answer: 'Sí, enviamos a Latinoamérica y EE.UU. con costos variables por destino.',
    isOpen: false
  }
];


 // Alternar estado de FAQ
 toggleFAQ(index: number): void {
  this.faqs[index].isOpen = !this.faqs[index].isOpen;
}

}
