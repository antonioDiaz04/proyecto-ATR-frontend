import { Component } from '@angular/core';
import { FormsModule, ValidationErrors } from '@angular/forms';
import { ControlAdministrativaService } from '../../../../shared/services/control-administrativa.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro-terminos-condiciones',
  templateUrl: './registro-terminos-condiciones.component.html',
  // styleUrls: ['./registro-terminos-condiciones.component.scss'],
})
export class RegistroTerminosCondicionesComponent {
  nuevosTerminos = {
    titulo: '',
    contenido: '',
    fechaVigencia: this.getCurrentDate(),
  };

  constructor(
    private controlAdministrativaService: ControlAdministrativaService,
    private router: Router // Inyecta Router para redireccionar después de registrar
  ) {}

  getCurrentDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  }

  noSpecialCharacters(control: any): ValidationErrors | null {
    // Expresión regular para validar caracteres especiales
    const regex = /^(?!.*<script>)[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]*$/;

    // Si el valor está vacío, no validamos nada (otro validador lo maneja)
    if (!control.value) {
      return null;
    }

    const valid = regex.test(control.value);
    return valid ? null : { invalidCharacters: true }; // Retorna un error si hay caracteres inválidos
  }

  isValidTitle(title: string): boolean {
    // Expresión regular para validar solo letras y espacios
    const regex = /^(?!.*<script>)[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]*$/;

    return regex.test(title) && title.length <= 30; // Verifica que no haya números y que tenga máximo 30 caracteres
  }

  onSubmit() {
    const selectedDate = new Date(this.nuevosTerminos.fechaVigencia);
    const today = new Date();
    const minimumDate = new Date();
    minimumDate.setDate(today.getDate() + 3);

    if (selectedDate < today) {
      Swal.fire(
        'Error',
        'La fecha de vigencia no puede ser una fecha pasada.',
        'error'
      );
      return;
    }

    if (selectedDate < minimumDate) {
      Swal.fire(
        'Error',
        'La fecha de vigencia debe ser al menos 3 días a partir de hoy.',
        'error'
      );
      return;
    }

    // Validar contenido antes de enviar
    if (this.noSpecialCharacters({ value: this.nuevosTerminos.contenido })) {
      Swal.fire(
        'Error',
        'El contenido no debe contener caracteres < o >.',
        'error'
      );
      return;
    }

    // Validar título antes de enviar
    if (!this.isValidTitle(this.nuevosTerminos.titulo)) {
      Swal.fire(
        'Error',
        'El título solo debe contener letras y tener un máximo de 30 caracteres.',
        'error'
      );
      return;
    }

    if (
      this.nuevosTerminos.titulo &&
      this.nuevosTerminos.contenido &&
      this.nuevosTerminos.fechaVigencia
    ) {
      this.controlAdministrativaService
        .registerTerminosYCondiciones(this.nuevosTerminos)
        .subscribe(
          (response) => {
            console.log('Términos registrados con éxito:', response);
            Swal.fire(
              'Términos registrados',
              'Los términos y condiciones se han registrado correctamente.',
              'success'
            );
            // Limpiar el formulario
            this.nuevosTerminos = {
              titulo: '',
              contenido: '',
              fechaVigencia: this.getCurrentDate(),
            };
            this.router.navigate([
              '/admin/configuracion/listado-terminos-condiciones',
            ]);
          },
          (error) => {
            console.error('Error al registrar los términos:', error);
            Swal.fire(
              'Error',
              'Hubo un problema al registrar los términos.',
              'error'
            );
          }
        );
    }
  }
}
