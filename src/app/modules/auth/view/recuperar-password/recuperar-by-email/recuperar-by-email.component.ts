import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { mensageservice } from '../../../../../shared/services/mensage.service';
import { UsuarioService } from '../../../../../shared/services/usuario.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recuperar-by-email',
  templateUrl: './recuperar-by-email.component.html',
  // template:  }},
  // styleUrl: './recuperar-by-email.component.scss'
})
export class RecuperarByEmailComponent {
  @Output() regresar = new EventEmitter<void>(); // Emitir evento para regresar
  isLoading: boolean = false;

  frmSeleccionMetodoRecuperacion: FormGroup;
  frmbuscarCorreo: FormGroup;
  frmVerificacion: FormGroup;
  frmPregunta: FormGroup;
  frmActualizaPassword: FormGroup;
  faltantes: string[] = []; // Lista de requisitos faltantes
  passwordStrengthMessage: string = ''; // Mensaje dinámico que se muestra debajo del campo

  value: string | undefined;
  correoIngresado: string = '';

  esFrmCorreo: boolean = true;
  esFrmWhatsapp: boolean = false;
  esFrmPregunta: boolean = false;
  esfrmVerficacion: boolean = false;
  esFrmResetPassword: boolean = false;
  formularioEnviado: boolean = false;
  coincidenPasswords: boolean = true;
  passwordStrength: string = '';
  strengthColor: string = '';
  constructor(
    public msg: mensageservice,
    private router: Router,
    private usuarioService: UsuarioService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService
  ) {
    this.frmSeleccionMetodoRecuperacion = this.formBuilder.group({
      opcion: new FormControl('pregunta'),
    });
    this.frmbuscarCorreo = this.formBuilder.group({
      email: new FormControl('', [Validators.required, Validators.email]),
    });

    this.frmVerificacion = this.formBuilder.group({
      codigo: new FormControl('', [Validators.required]),
    });

    this.frmPregunta = this.formBuilder.group({
      pregunta: ['', Validators.required], // Hacer que la pregunta sea requerida
      respuesta: ['', Validators.required],
    });

    this.frmActualizaPassword = this.formBuilder.group({
      nueva: new FormControl('', [Validators.required]),
      confirma: new FormControl('', [Validators.required]),
    });
  }

  inputControl: FormControl = new FormControl('');
  ngOnInit() {
    this.inputControl = new FormControl('');
    this.frmbuscarCorreo = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }
  // passwordStrength: string = ''; // variable para almacenar la fuerza de la contraseña

  validacionesPassword = {
    tieneMinuscula: false,
    tieneMayuscula: false,
    tieneNumero: false,
    tieneSimbolo: false,
    longitudMinima: false,
    longitudMayor5: false,
    tiene5CaracteresDiferentes: false,
  };

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

  enviarYbuscarCorreo() {
    this.isLoading = true;
    const email = this.frmbuscarCorreo.get('email')?.value;
    console.log(email);
    this.esFrmCorreo = true;
    this.usuarioService.enviarCodido(email).subscribe(
      (response) => {
        if (response) {
          this.isLoading = false;

          this.esFrmCorreo = false;
          this.toastr.info(`Revisa tu vandeja de correos.`, 'Envio');
          this.esfrmVerficacion = true;
          //     // Aquí puedes implementar más lógica si es necesario, como obtener un token de verificación o actualizar el estado de la aplicación
          this.msg.enviarNotificacion().subscribe({});
        } else {
          this.isLoading = false;
          this.esFrmCorreo = true;
          this.toastr.error('El correo no fue encontrado', 'Error');
          this.esfrmVerficacion = false;
        }
      },
      (error) => {
        this.isLoading = false;
        console.error('No se encontró el correo:', error);
        this.toastr.error('No se encontró el correo', 'Error');
      }
    );
  }

  // comparacion de token en el usuario
  verficarCodigo() {
    this.esFrmCorreo = false;
    const email = this.frmbuscarCorreo.value.email;
    console.log('correo desde html=>', email);
    this.isLoading = true;
    const token = this.frmVerificacion.get('codigo')?.value;
    console.log('token desde html=>', token);

    if (!token || token == null) {
      this.isLoading = false;

      this.toastr.error('Ingrese el código', 'Error de entrada');
    } else {
      this.usuarioService.enviarToken(email, token).subscribe(
        (response) => {
          console.log(response);
          if (response) {
            this.esfrmVerficacion = false;
            // esFrmResetPassword
            this.toastr.success('ya puedes actualizar tu password');
            this.isLoading = false;

            this.esFrmResetPassword = true;
          } else {
            this.isLoading = false;

            this.esFrmCorreo = false;
            this.toastr.error('Codigo incorrecto', 'Error');
            this.esfrmVerficacion = true;
          }
        },
        (error) => {
          this.isLoading = false;

          console.error('EL codigo es incorrecto:', error);
          this.toastr.error('EL codigo es incorrecto', 'Error');
        }
      );
    }
  }

  ValidaPass(nueva: string, confirma: string): boolean {
    return nueva === confirma;
  }

  actualizarPasswordxCorreo() {
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
          this.router.navigate(['/public/inicio']); // Redirige al home del cliente
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

  actualizarPassword() {
    //  if (this.frmSeleccionMetodoRecuperacion.value.opcion == 'whatsapp') {
    //     console.log('actualizarPasswordxWhatsapp');
    //     this.actualizarPasswordxCorreo();
    //   } else if (this.frmSeleccionMetodoRecuperacion.value.opcion == 'correo') {
    //     console.log('actualizarPasswordxCorreo');
    //     this.actualizarPasswordxCorreo();
    //   }
  }
  
  // Método para regresar
  regresarOpciones() {
    this.regresar.emit(); // Emitir evento para regresar
  }


  
    // Método para regresar a la selección de opciones
    regresarCorreo() {
      this.esFrmCorreo = true; // Reiniciar la opción seleccionada
      this.esfrmVerficacion = false; // Mostrar las opciones de nuevo
    }
    regresarVerificacion() {
      this.esfrmVerficacion = true; // Mostrar las opciones de nuevo
      this.esFrmResetPassword = false; // Reiniciar la opción seleccionada
    }
}
