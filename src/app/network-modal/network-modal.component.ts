import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-network-modal',
  templateUrl: './network-modal.component.html',
  standalone:false,
  styleUrls: ['./network-modal.component.scss']
})
export class NetworkModalComponent {
  @Input() visible = false;
  @Output() accept = new EventEmitter<void>();

  onAccept() {
    this.accept.emit();
  }
}
