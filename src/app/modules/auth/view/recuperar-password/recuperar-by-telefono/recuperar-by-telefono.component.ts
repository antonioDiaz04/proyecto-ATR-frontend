import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-recuperar-by-telefono',
  templateUrl: './recuperar-by-telefono.component.html',
  // styleUrl: './recuperar-by-telefono.component.scss'
})
export class RecuperarByTelefonoComponent {

  @Output() regresar = new EventEmitter<void>(); // Emitir evento para regresar
  isLoading: boolean = false; // Estado de carga
  esFrmVerificacion: boolean = false; // Mostrar formulario de verificación de código
  esFrmResetPassword: boolean = false; // Mostrar formulario de restablecimiento de contraseña

  // Formulario para recuperación por teléfono
  frmbuscarTelefono: FormGroup;

  // Formulario para verificación de código
  frmVerificacion: FormGroup;

  // Formulario para restablecer la contraseña
  frmActualizaPassword: FormGroup;

  constructor(private fb: FormBuilder) {
    // Inicializar formulario de teléfono
    this.frmbuscarTelefono = this.fb.group({
      telefono: ['', [Validators.required, Validators.pattern('[0-9]{10}')]] // Validar que sea un número de 10 dígitos
    });

    // Inicializar formulario de verificación de código
    this.frmVerificacion = this.fb.group({
      codigo: ['', [Validators.required, Validators.pattern('[0-9]{6}')]] // Validar que sea un código de 6 dígitos
    });

    // Inicializar formulario de restablecimiento de contraseña
    this.frmActualizaPassword = this.fb.group({
      nueva: ['', [Validators.required, Validators.minLength(8)]],
      confirma: ['', [Validators.required]]
    });
  }

  // Método para enviar el formulario de teléfono
  enviarYbuscarTelefono() {
    if (this.frmbuscarTelefono.valid) {
      this.isLoading = true;
      console.log('SMS enviado:', this.frmbuscarTelefono.value.telefono);
      // Simular una solicitud HTTP
      setTimeout(() => {
        this.isLoading = false;
        this.esFrmVerificacion = true; // Mostrar formulario de verificación de código
      }, 2000);
    }
  }

  // Método para verificar el código
  verificarCodigo() {
    if (this.frmVerificacion.valid) {
      this.isLoading = true;
      console.log('Código verificado:', this.frmVerificacion.value.codigo);
      // Simular una solicitud HTTP
      setTimeout(() => {
        this.isLoading = false;
        this.esFrmResetPassword = true; // Mostrar formulario de restablecimiento de contraseña
      }, 2000);
    }
  }

  // Método para restablecer la contraseña
  actualizarPasswordxTelefono() {
    if (this.frmActualizaPassword.valid) {
      this.isLoading = true;
      console.log('Contraseña actualizada:', this.frmActualizaPassword.value.nueva);
      // Simular una solicitud HTTP
      setTimeout(() => {
        this.isLoading = false;
        alert('Contraseña actualizada con éxito');
      }, 2000);
    }
  }
  
  // Método para regresar
  onRegresar() {
    this.regresar.emit(); // Emitir evento para regresar
  }
}