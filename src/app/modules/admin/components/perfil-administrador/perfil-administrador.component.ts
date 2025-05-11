import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ValidationErrors,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { UsuarioService } from '../../../../shared/services/usuario.service';
import { SessionService } from '../../../../shared/services/session.service';
import { emailValidator } from '../../../../shared/pipes/validators';

@Component({
  selector: 'app-perfil-administrador',
  templateUrl: './perfil-administrador.component.html',
  styleUrls: ['./perfil-administrador.component.scss'],
  providers: [MessageService],
})
export class PerfilAdministradorComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  profileForm: FormGroup;
  selectedFile: File | null = null;
  editMode = false;
  profileImg: string  =
    'https://res.cloudinary.com/dxmhlxdxo/image/upload/v1743916178/Imagenes%20para%20usar%20xD/gxvcu5gik59c0uu7zz4p.png';
  loading = false;
  id: string | null = null;

  uploadProgress: number | null = null;
  @ViewChild('fileInput') fileInput: any;

  estadoCuenta: any = {
    estado: '',
    fechaUltimoIntentoFallido: null,
    intentosFallidos: 0,
    intentosPermitidos: 5,
    tiempoDeBloqueo: 0,
    vecesDeBloqueos: 0,
  };

  //para el contador de palabras de input direcion
  currentChars: number = 0;
  maxChars: number = 200;

  @ViewChild('scrollContainer', { static: true }) scrollContainer!: ElementRef;
  headerHidden = false;
  private scrollListener: () => void = () => {};

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private sessionService: SessionService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.profileForm = this.fb.group(
      {
        nombre: ['', [Validators.required, Validators.maxLength(50)]],
        apellidos: ['', [Validators.required, Validators.maxLength(50)]],
        edad: [null, [Validators.min(18), Validators.max(100)]],
        direccion: ['', [Validators.maxLength(200)]],
        telefono: ['', [Validators.required, this.telefonoValidator()]],
        correo: ['', [Validators.required, emailValidator]],
        contrasena: ['', [Validators.minLength(8)]],
        confirmarContrasena: [''],
        fechaDeRegistro: [''],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  ngAfterViewInit() {
    this.setupScrollListener();
  }

  private telefonoValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const phoneRegex = /^[0-9]{10,12}$/;
      return phoneRegex.test(value) ? null : { invalidPhone: true };
    };
  }
  passwordMatchValidator(formGroup: FormGroup): ValidationErrors | null {
    const password = formGroup.get('contrasena');
    const confirmPassword = formGroup.get('confirmarContrasena');

    if (!password || !confirmPassword) {
      return null;
    }

    // Solo validar si ambos campos tienen valor
    if (password.value || confirmPassword.value) {
      return password.value === confirmPassword.value
        ? null
        : { mismatch: true };
    }
    return null;
  }

  ngOnInit(): void {
    this.loadUserData();
    this.setupScrollListener();
  }

  updateCharCount(event: any) {
    this.currentChars = event.target.value.length;
  }

  loadUserData(): void {
    this.loading = true;
    this.id = this.sessionService.getId();

    if (this.id) {
      this.usuarioService.detalleUsuarioById(this.id).subscribe({
        next: (data) => {
          this.profileImg = data.fotoDePerfil || '';

          this.profileForm.patchValue({
            nombre: data.nombre || '',
            apellidos: data.apellidos || '',
            edad: data.edad,
            direccion: data.direccion || '',
            telefono: data.telefono || '',
            correo: data.email || '',
            password: data.password || '',
            fechaDeRegistro: data.fechaDeRegistro,
          });

          this.estadoCuenta = data.estadoCuenta || {
            estado: 'activa',
            fechaUltimoIntentoFallido: null,
            intentosFallidos: 0,
            intentosPermitidos: 5,
            tiempoDeBloqueo: 0,
            vecesDeBloqueos: 0,
          };
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar datos:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los datos del perfil',
          });
          this.loading = false;
        },
      });
    }
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    if (!this.editMode) {
      this.loadUserData(); // Recargar datos si se cancela la edición
    } else {
      // Habilitar campos al entrar en modo edición
      Object.keys(this.profileForm.controls).forEach((control) => {
        this.profileForm.get(control)?.enable();
      });
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validaciones
      if (file.size > 2 * 1024 * 1024) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'La imagen no debe exceder los 2MB',
        });
        return;
      }

      if (!file.type.match(/image\/(jpeg|png|jpg)/)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Solo se permiten imágenes JPEG, JPG o PNG',
        });
        return;
      }

      this.selectedFile = file;
      console.log(this.selectedFile);

      // Mostrar vista previa
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImg = e.target.result;
      };
      reader.readAsDataURL(file);

      this.uploadFile();
    }
  }

  uploadFile(): void {
    if (!this.id || !this.selectedFile) return;

    const formData = new FormData();
    console.log(this.selectedFile);
    formData.append('profileImg', this.selectedFile, this.selectedFile.name);

    // this.usuarioService.actualizarUsuarioConFoto(this.id, formData).subscribe({
    //   next: (event) => {
    //     if (event.type === HttpEventType.UploadProgress) {
    //       this.uploadProgress = Math.round(
    //         (100 * event.loaded) / (event.total || 1)
    //       );
    //     } else if (event instanceof HttpResponse) {
    //       this.messageService.add({
    //         severity: 'success',
    //         summary: 'Éxito',
    //         detail: 'Foto actualizada correctamente',
    //       });
    //       this.uploadProgress = null;
    //     }
    //   },
    //   error: (error) => {
    //     console.error('Error al actualizar la foto', error);
    //     this.messageService.add({
    //       severity: 'error',
    //       summary: 'Error',
    //       detail: error.error?.message || 'Error al actualizar la foto',
    //     });
    //     this.uploadProgress = null;
    //   },
    // });
  }

  getInitials(name: string | null | undefined): string {
    if (!name) return 'AD';
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  saveChanges(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor complete todos los campos requeridos correctamente',
      });
      return;
    }

    if (!this.id) return;

    this.loading = true;

    const formData = new FormData();
    const formValue = this.profileForm.value;

    // Agregar campos del formulario
    Object.keys(formValue).forEach((key) => {
      if (
        key !== 'confirmarContrasena' &&
        formValue[key] !== null &&
        formValue[key] !== undefined
      ) {
        formData.append(key, formValue[key]);
      }
    });

    // Si hay una nueva contraseña
    if (formValue.contrasena) {
      formData.append('password', formValue.contrasena);
    }

    console.log(this.profileForm.value);

    this.usuarioService.actualizarDatosUsuario(this.id, formData).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Perfil actualizado correctamente',
        });
        this.editMode = false;
        this.loading = false;
        this.loadUserData();
      },
      error: (error) => {
        console.error('Error al actualizar:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al actualizar el perfil',
        });
        this.loading = false;
      },
    });
  }

  logout(): void {
    this.sessionService.removeToken();
    this.router.navigate(['/auth/login']);
    this.messageService.add({
      severity: 'info',
      summary: 'Sesión cerrada',
      detail: 'Has salido del sistema correctamente',
    });
  }

  // Helper para acceder fácil a los controles del formulario
  get f() {
    return this.profileForm.controls;
  }

  private setupScrollListener() {
    const container = this.scrollContainer.nativeElement;
    let lastScroll = 0;
    const scrollThreshold = 10; // Umbral en píxeles para considerar el cambio

    this.scrollListener = () => {
      const currentScroll = container.scrollTop;

      // Determinar dirección del scroll
      const scrollingDown = currentScroll > lastScroll;

      // Solo activar después de pasar un umbral mínimo
      if (Math.abs(currentScroll - lastScroll) < 5) {
        return; // Ignorar movimientos mínimos
      }

      if (scrollingDown && currentScroll > 60 && !this.headerHidden) {
        // Ocultar si se hace scroll hacia abajo después de 60px
        this.headerHidden = true;
      } else if ((!scrollingDown || currentScroll <= 30) && this.headerHidden) {
        // Mostrar si se hace scroll hacia arriba o se llega al top
        this.headerHidden = false;
      }

      lastScroll = currentScroll <= 0 ? 0 : currentScroll;
    };

    container.addEventListener('scroll', this.scrollListener);
  }
  ngOnDestroy() {
    // Importante: remover el event listener al destruir el componente
    if (this.scrollListener && this.scrollContainer?.nativeElement) {
      this.scrollContainer.nativeElement.removeEventListener(
        'scroll',
        this.scrollListener
      );
    }
  }
}
