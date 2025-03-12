import { computed, Injectable, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
 // Señal para manejar los productos en el carrito
 private dressItemsSignal = signal<any[]>([]);
  // Subject para notificar cambios en el carrito
  private cartUpdated = new Subject<void>();
  cartUpdated$ = this.cartUpdated.asObservable();

 // Señal computada para el contador de productos
 dressItemCount = computed(() => this.dressItemsSignal().length);

 // Subject para notificar cambios en el carrito

 constructor(private messageService: MessageService) {}
 // Método para agregar un producto al carrito
  // Método para agregar un producto al carrito
   // Método para agregar un producto al carrito
   addToCart(producto: any) {
    const currentItems = this.dressItemsSignal();

    // Verificar si el producto ya está en el carrito
    const isProductInCart = currentItems.some((item) => item.id === producto.id);

    if (isProductInCart) {
      // Mostrar alerta si el producto ya está en el carrito
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'El producto ya está en el carrito',
      });
    } else {
      // Agregar el producto al carrito si no está duplicado
      this.dressItemsSignal.set([...currentItems, producto]);

      // Mostrar notificación personalizada
      this.messageService.add({
        severity: 'success',
        summary: 'Producto agregado',
        detail: `${producto.nombre} se ha agregado al carrito`,
        life: 5000, // Duración de la notificación en milisegundos
        data: producto, // Enviar datos del producto para la notificación personalizada
      });

      this.cartUpdated.next(); // Notificar que el carrito ha cambiado
    }
  }
  // Método para eliminar un producto del carrito
  removeFromCart(id: string) {
    const currentItems = this.dressItemsSignal();
    const updatedItems = currentItems.filter((item) => item.id !== id);
    this.dressItemsSignal.set(updatedItems);
    this.cartUpdated.next(); // Notificar que el carrito ha cambiado
  }
 // Método para obtener los productos del carrito
 getCartItems() {
   return this.dressItemsSignal();
 }

 // Método para inicializar el carrito con datos existentes
 initializeCart(items: any[]) {
   this.dressItemsSignal.set(items);
 }


//  this.messageService.add({
//   severity: 'success',
//   summary: 'Producto agregado',
//   detail: `${producto.nombre} se ha agregado al carrito`,
//   life: 5000, // Duración de la notificación en milisegundos
//   data: producto, // Enviar datos del producto para la notificación personalizada
//   content: `
//     <div class="product-notification">
//       <img src="${producto.imagenPrincipal}" alt="${producto.nombre}" class="product-image" />
//       <div class="product-details">
//         <h4>${producto.nombre}</h4>
//         <p>${producto.precio}</p>
//       </div>
//       <div class="product-actions">
//         <button (click)="goToCart()">Ir al carrito</button>
//         <button (click)="login()">Iniciar sesión</button>
//       </div>
//     </div>
//   `,
// });
}
