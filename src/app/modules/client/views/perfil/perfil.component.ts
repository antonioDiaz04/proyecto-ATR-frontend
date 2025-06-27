import { StorageService } from './../../../../shared/services/storage.service';
import { Component, OnInit } from '@angular/core';
import { SignInService } from '../../../auth/commons/services/sign-in.service';
import { Router } from '@angular/router';
import { UsuarioService } from '../../../../shared/services/usuario.service';
import { SessionService } from '../../../../shared/services/session.service';




// Define una interfaz para la estructura de tus datos de usuario
interface UserData {
  nombre: string;
  email: string;
  telefono: string;
  fechaRegistro: Date;
  ultimaActualizacion: Date;
  fechaNacimiento?: Date; // Opcional
  direccion?: {
    calle: string;
    ciudad: string;
    estado: string;
    codigoPostal: string;
    pais: string;
  };
  preferencias?: {
    notificacionesEmail: boolean;
    ofertasEspeciales: boolean;
  };
  cuentasSincronizadas?: {
    google: boolean;
    facebook: boolean;
    paypal: boolean;
  };
  resumen?: {
    comprasTotales: number;
    rentasActivas: number;
    notificacionesPendientes: number;
  };
}
@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
})
export class PerfilComponent implements OnInit {
  data: any = {};

  id!: string;
  editMode: boolean = false;

  ngOnInit() {
    this.getData();
  }
  constructor(
    // private ngxService: NgxUiLoaderService,
    private uss: UsuarioService,
    private storageService: StorageService,
    private sessionService: SessionService,
    private router: Router
  ) {}
  toggleEditMode(): void {
    this.editMode = !this.editMode;
    // Puedes agregar lógica para guardar datos aquí
    if (!this.editMode) {
      console.log('Datos guardados:', this.data);
    }
  }

  getData(): void {
    const userData = this.sessionService.getId();
    console.log('userData=>', userData);
    if (userData) {
      this.id = userData;
      console.log('id=>', this.id);
      if (this.id) {
        this.uss.detalleUsuarioById(this.id).subscribe((data) => {
          this.data = {
            ...data,
            preferencias: {
              notificacionesEmail: true,
              ofertasEspeciales: false,
              ...(data.preferencias || {})
            },
            cuentasSincronizadas: {
              google: true,
              facebook: false,
              paypal: true,
              ...(data.cuentasSincronizadas || {})
            },
            resumen: {
              comprasTotales: 15,
              rentasActivas: 2,
              notificacionesPendientes: 3,
              ...(data.resumen || {})
            }
          };
        });
      }
    }
  }


  logout() {
    this.storageService.removeItem('token');
    this.router.navigate(['/auth/login']);
  }

  nombre: string = 'Juan Pérez';
  profileImg: string | null = null; // Imagen por defecto es null
  // muestra las primeras letras del nombre en el avatar
  getInitials(name: string | null | undefined): string {
    if (!name) {
      return 'NA'; // Valor por defecto si no hay nombre
    }
    return name
      .split('')
      .map((word) => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  // cambiar el contenido por una imagen
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImg = e.target.result; // Actualiza con la imagen seleccionada
      };
      reader.readAsDataURL(input.files[0]);
    }
  }



  // now

  
  // Datos de ejemplo para el usuario. En un caso real, esto vendría de un servicio.
  // data: UserData = {
  //   nombre: 'Juan Pérez',
  //   email: 'juan.perez@example.com',
  //   telefono: '+52 55 1234 5678',
  //   fechaRegistro: new Date('2023-01-15T10:00:00Z'),
  //   ultimaActualizacion: new Date(),
  //   fechaNacimiento: new Date('1990-05-20'),
  //   direccion: {
  //     calle: 'Av. Paseo de la Reforma 222',
  //     ciudad: 'Ciudad de México',
  //     estado: 'CDMX',
  //     codigoPostal: '06600',
  //     pais: 'México'
  //   },
  //   preferencias: {
  //     notificacionesEmail: true,
  //     ofertasEspeciales: false
  //   },
  //   cuentasSincronizadas: {
  //     google: true,
  //     facebook: false,
  //     paypal: true
  //   },
  //   resumen: {
  //     comprasTotales: 15,
  //     rentasActivas: 2,
  //     notificacionesPendientes: 3
  //   }
  // };

 
  // Lógica para obtener las iniciales del nombre (si no hay foto de perfil)
  // getInitials(name: string): string {
  //   if (!name) return '';
  //   const parts = name.split(' ');
  //   if (parts.length > 1) {
  //     return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  //   }
  //   return parts[0][0].toUpperCase();
  // }

  // Lógica para manejar el cambio de archivo de la foto de perfil
  

  // Lógica para activar/desactivar notificaciones por correo
  toggleEmailNotifications(): void {
    if (this.data.preferencias) {
      this.data.preferencias.notificacionesEmail = !this.data.preferencias.notificacionesEmail;
      // Aquí podrías llamar a un servicio para guardar este cambio en la base de datos
      console.log('Notificaciones por correo:', this.data.preferencias.notificacionesEmail);
    }
  }

  // Lógica para el botón de cerrar sesión (ejemplo)
 

  // Lógica para manejar la conexión/desconexión de cuentas (ejemplo)
  toggleAccountSync(account: 'google' | 'facebook' | 'paypal'): void {
    if (this.data.cuentasSincronizadas) {
      this.data.cuentasSincronizadas[account] = !this.data.cuentasSincronizadas[account];
      // Aquí llamarías a tu servicio de autenticación para iniciar/cerrar sesión con esa plataforma
      console.log(`${account} sincronizada:`, this.data.cuentasSincronizadas[account]);
    }
  }

  // Puedes añadir métodos para guardar cambios del formulario, etc.
  // saveChanges(): void {
  //   console.log('Guardando cambios:', this.data);
  //   // Aquí llamarías a tu servicio para guardar los datos del perfil
  // }
}
