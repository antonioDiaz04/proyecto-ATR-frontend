import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-auth-selector',
  templateUrl: './auth-selector.component.html',
  styleUrl: './auth-selector.component.scss',
})
export class AuthSelectorComponent {
  currentStep = 1;
  currentForm: 'login' | 'register' | 'qr' = 'login';
  // Formularios
  personalDataForm: FormGroup;
  otpForm: FormGroup;
  credentialsForm: FormGroup;

  remainingChars = 20;
  faltantes: string[] = [];
  errorMessage = '';
  otpErrorMessage = '';
  otpInvalido = false;
  isLoading = false;
  isFormValid = false;
  coincidenPasswords = true;

  constructor(private fb: FormBuilder) {
    // Inicializa los formularios
    this.personalDataForm = this.fb.group({
      username: [
        '',
        [Validators.required, Validators.pattern(/^[a-zA-Z0-9]+$/)],
      ],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required]],
    });

    this.otpForm = this.fb.group({
      otp0: [''],
      otp1: [''],
      otp2: [''],
      otp3: [''],
    });

    this.credentialsForm = this.fb.group({
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    });
  }

  // Cambiar formulario
  showForm(form: 'login' | 'register' | 'qr') {
    this.currentForm = form;
  }

  // Paso 1
  updateRemainingChars() {
    const value = this.personalDataForm.get('username')?.value || '';
    this.remainingChars = 20 - value.length;
  }

  goToNextStep() {
    if (this.personalDataForm.valid) {
      this.currentStep = 1.5;
    } else {
      this.errorMessage = 'Por favor, completa todos los campos obligatorios.';
    }
  }

  // Paso 1.5
  handleOtpInput(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value.length === 1 && index < 3) {
      const next = document.querySelector<HTMLInputElement>(
        `[formcontrolname='otp${index + 1}']`
      );
      next?.focus();
    }
  }

  verificacionOTP() {
    const code = ['otp0', 'otp1', 'otp2', 'otp3']
      .map((key) => this.otpForm.get(key)?.value)
      .join('');
    if (code === '1234') {
      this.currentStep = 2;
    } else {
      this.otpInvalido = true;
      this.otpErrorMessage = 'Código incorrecto';
    }
  }

  // Paso 2
  verificarPassword() {
    const value = this.credentialsForm.get('password')?.value || '';
    this.faltantes = [];
    if (!/[A-Z]/.test(value)) this.faltantes.push('Una letra mayúscula');
    if (!/[a-z]/.test(value)) this.faltantes.push('Una letra minúscula');
    if (!/[0-9]/.test(value)) this.faltantes.push('Un número');
    if (value.length < 8) this.faltantes.push('Al menos 8 caracteres');
  }

  verificarCoincidencia() {
    const pass = this.credentialsForm.get('password')?.value;
    const confirm = this.credentialsForm.get('confirmPassword')?.value;
    this.coincidenPasswords = pass === confirm;
  }

  goToPreviousStep() {
    this.currentStep = 1.5;
  }

  registroCliente() {
    if (this.credentialsForm.valid && this.coincidenPasswords) {
      // Aquí va la lógica de envío al backend
      alert('¡Registro completo!');
    }
  }
}
