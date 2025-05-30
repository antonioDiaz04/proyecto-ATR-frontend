import { Component } from '@angular/core';

@Component({
  selector: 'app-data-compra',
  templateUrl: './data-compra.component.html',
  // styleUrl: './data-compra.component.scss'
})
export class DataCompraComponent {
  selectedStore: string = "";
  selectedDate: string = "";
  selectedTime: string = "";
  name: string = "";
  lastName: string = "";
  phone: string = "";
  email: string = "";
}
