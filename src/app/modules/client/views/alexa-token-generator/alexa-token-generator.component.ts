import { inject, Injectable } from '@angular/core';
import { Component } from '@angular/core';
import { AuthService } from '../../../auth/commons/services/auth.service';
import { SessionService } from '../../../../shared/services/session.service';

@Component({
  selector: 'app-alexa-token-generator',
  templateUrl: './alexa-token-generator.component.html',
  styleUrls: ['./alexa-token-generator.component.scss'],
})
export class AlexaTokenGeneratorComponent {
  token: string = '----';
  copyMessage: string = '';

  constructor(
    private sessionService: SessionService,
    private authService: AuthService
  ) {}

  generateToken(): void {
    const randomToken = Math.floor(1000 + Math.random() * 9000); // 4 dígitos
    this.token = randomToken.toString();
    this.copyMessage = '';

    const usuarioId = this.sessionService.getId() || '';
    console.log(usuarioId);
    this.authService.guardarToken(usuarioId, this.token).subscribe({
      next: () => {
        console.log('Token guardado correctamente');
      },
      error: (err) => {
        console.error('Error al guardar token:', err);
      },
    });
  }

  copyToken(): void {
    if (this.token && this.token !== '----') {
      navigator.clipboard.writeText(this.token);
      this.copyMessage = '¡Token copiado!';
      setTimeout(() => (this.copyMessage = ''), 2000);
    }
  }
}
