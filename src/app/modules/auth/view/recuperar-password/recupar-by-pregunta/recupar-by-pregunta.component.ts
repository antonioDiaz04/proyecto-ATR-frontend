import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { mensageservice } from '../../../../../shared/services/mensage.service';
import { Router } from '@angular/router';
import { UsuarioService } from '../../../../../shared/services/usuario.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recupar-by-pregunta',
  templateUrl: './recupar-by-pregunta.component.html',
  // styleUrl: './recupar-by-pregunta.component.scss'
})
export class RecuparByPreguntaComponent {
    @Output() regresar = new EventEmitter<void>(); // Emitir evento para regresar
  esFrmCorreo = true; // Mostrar formulario de correo
  esFrmPreguntaSecreta = false; // Mostrar formulario de pregunta secreta
  esFrmResetPassword = false; // Mostrar formulario de actualización de contraseña
  isLoading!:any
  nombreUsuario = ''; // Nombre del usuario
  preguntaSecreta = ''; // Pregunta secreta del usuario
  coincidenPasswords: boolean = true;
  faltantes: string[] = []; // Lista de requisitos faltantes
  passwordStrengthMessage: string = ''; // Mensaje dinámico que se muestra debajo del campo

  frmbuscarCorreo = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  frmPreguntaSecreta = new FormGroup({
    respuesta: new FormControl('', [Validators.required]),
  });

  frmActualizaPassword = new FormGroup({
    nueva: new FormControl('', [Validators.required]),
    confirma: new FormControl('', [Validators.required]),
  });
constructor(
    public msg: mensageservice,
    private router: Router,
    private usuarioService: UsuarioService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService
  ) {}


  validacionesPassword = {
    tieneMinuscula: false,
    tieneMayuscula: false,
    tieneNumero: false,
    tieneSimbolo: false,
    longitudMinima: false,
    longitudMayor5: false,
    tiene5CaracteresDiferentes: false,
  };

  enviarYbuscarCorreo() {
    this.isLoading = true; // Activar el estado de carga
    const email = this.frmbuscarCorreo.get('email')?.value; // Obtener el correo del formulario
  
    // Verificar si el correo es válido
    if (!email) {
      this.isLoading = false;
      this.toastr.error('Por favor, ingresa un correo electrónico válido.', 'Error');
      return;
    }
  
    // Llamar al servicio para obtener la pregunta secreta
    this.usuarioService.getPreguntaSecreta(email).subscribe(
      (response) => {
        if (response && response.preguntaSecreta) {
          this.isLoading = false; // Desactivar el estado de carga
  
          // Ocultar el formulario de correo y mostrar el formulario de pregunta secreta
          this.esFrmCorreo = false;
          this.esFrmPreguntaSecreta = true;
  
          // Asignar la pregunta secreta a una variable para mostrarla en el formulario
          this.preguntaSecreta = response.preguntaSecreta;
  
          // Mostrar un mensaje de éxito
          this.toastr.info('Pregunta secreta encontrada.', 'Éxito');
        } else {
          this.isLoading = false;
          this.esFrmCorreo = true; // Mantener el formulario de correo visible
          this.toastr.error('No se encontró un usuario con ese correo.', 'Error');
        }
      },
      (error) => {
        this.isLoading = false;
        console.error('Error al buscar el correo:', error);
        this.toastr.error('Ocurrió un error al buscar el correo.', 'Error');
      }
    );
  }
 // Paso 2: Verificar la respuesta de la pregunta secreta
verificarRespuesta() {
  if (this.frmPreguntaSecreta.valid) {
    this.isLoading = true; // Activar el estado de carga

    const email = this.frmbuscarCorreo.get('email')?.value; // Obtener el correo del formulario
    const respuesta = this.frmPreguntaSecreta.get('respuesta')?.value; // Obtener la respuesta del formulario

    // Verificar si el correo y la respuesta están presentes
    if (!email || !respuesta) {
      this.isLoading = false;
      this.toastr.error('Por favor, completa todos los campos.', 'Error');
      return;
    }

    // Llamar al servicio para verificar la respuesta
    this.usuarioService.verificarRespuestaSecreta(email, respuesta).subscribe(
      (response) => {
        this.isLoading = false; // Desactivar el estado de carga

        if (response && response.valido) { // Si la respuesta es válida
          this.esFrmPreguntaSecreta = false;
          this.esFrmResetPassword = true;
          this.toastr.success('Respuesta correcta. Puedes actualizar tu contraseña.', 'Éxito');
        } else {
          this.toastr.error('Respuesta incorrecta. Intenta de nuevo.', 'Error');
        }
      },
      (error) => {
        this.isLoading = false;
        console.error('Error al verificar la respuesta:', error);
        this.toastr.error('Ocurrió un error al verificar la respuesta.', 'Error');
      }
    );
  }
}

  // Paso 3: Actualizar la contraseña
  actualizarPassword() {
     this.esFrmResetPassword = true;
        // const token = this.frmVerificacion.get('codigo')?.value;
        const email = this.frmbuscarCorreo.value.email;
        const nueva = this.frmActualizaPassword.get('nueva')?.value;
        console.log(nueva);
        const confirma = this.frmActualizaPassword.get('confirma')?.value;
    
        // Verifica que las contraseñas sean cadenas
        if (typeof nueva !== 'string' || typeof confirma !== 'string') {
          // Si alguna de las contraseñas no es una cadena, muestra un mensaje de error y retorna
          Swal.fire('Error', 'Las contraseñas no son válidas', 'error');
          // this.esFrmResetPassword = true;
    
          return;
        } else if (nueva !== confirma) {
          Swal.fire('Error', 'Las contraseñas no coinciden', 'error');
          // this.esFrmResetPassword = true;
          return;
        }
    
        // Realiza la actualización de la contraseña
        this.usuarioService.actualizaPasswordxCorreo(email, nueva).subscribe(
          (response) => {
            console.log(response);
            if (response) {
              Swal.fire(
                '¡Operación exitosa!',
                'Se actualizó tu contraseña',
                'success'
              );
              this.router.navigate(['/inicio']); // Redirige al home del cliente
              this.esFrmResetPassword = false;
            } else {
              this.toastr.error('Los datos no fueron encontrados', 'Error');
              this.esFrmResetPassword = true;
            }
          },
          (error) => {
            this.esFrmResetPassword = false;
            console.error('No se encontró coincidencias:', error);
            // this.toastr.error('Error al actualizar la contraseña', 'Error');
          }
        );
  }
  verificarPassword() {
    const password = this.frmActualizaPassword.get('nueva')?.value || '';
    // Contadores de los caracteres presentes
    const mayusculas = (password.match(/[A-Z]/g) || []).length;
    const minusculas = (password.match(/[a-z]/g) || []).length;
    const numeros = (password.match(/[0-9]/g) || []).length;
    const especiales = (password.match(/[!@#$&*]/g) || []).length;

    // Requisitos mínimos
    const mayusculasFaltantes = Math.max(3 - mayusculas, 0);
    const minusculasFaltantes = Math.max(4 - minusculas, 0);
    const numerosFaltantes = Math.max(4 - numeros, 0);
    const especialesFaltantes = Math.max(5 - especiales, 0);
    const longitudFaltante = Math.max(16 - password.length, 0);

    // Generar un mensaje sobre lo que falta
    this.faltantes = []; // Limpiar la lista de faltantes cada vez que se valide la contraseña

    if (longitudFaltante > 0)
      this.faltantes.push(`${longitudFaltante} caracteres más`);
    if (mayusculasFaltantes > 0)
      this.faltantes.push(`${mayusculasFaltantes} letras mayúsculas`);
    if (minusculasFaltantes > 0)
      this.faltantes.push(`${minusculasFaltantes} letras minúsculas`);
    if (numerosFaltantes > 0)
      this.faltantes.push(`${numerosFaltantes} números`);
    if (especialesFaltantes > 0)
      this.faltantes.push(`${especialesFaltantes} caracteres especiales`);

    // Si no faltan requisitos, la contraseña es válida
    if (this.faltantes.length === 0) {
      this.passwordStrengthMessage =
        'Contraseña válida con el formato adecuado';
    } else {
      this.passwordStrengthMessage = `Formato incompleto. Faltan: ${this.faltantes.join(
        ', '
      )}`;
    }
  }
  verificarCoincidencia() {
    const nueva = this.frmActualizaPassword.get('nueva')?.value;
    const confirma = this.frmActualizaPassword.get('confirma')?.value;

    this.coincidenPasswords = nueva === confirma;
  }


  regresarOpciones() {
    this.regresar.emit(); // Emitir evento para regresar
  }

  
    // Método para regresar a la selección de opciones
    regresarCorreo() {
      this.esFrmCorreo = true; // Reiniciar la opción seleccionada
      this.esFrmPreguntaSecreta = false; // Mostrar las opciones de nuevo
    }
    regresarVerificacion() {
      this.esFrmResetPassword = false; // Reiniciar la opción seleccionada
      this.esFrmPreguntaSecreta = true; // Mostrar las opciones de nuevo
    }
}
