import {
  AfterViewInit,
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
  Renderer2,
  ElementRef,
} from '@angular/core';
import { UsuarioService } from '../../../../shared/services/usuario.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientesService } from '../../../../shared/services/clientes.service';
import { ActivatedRoute, Router } from '@angular/router';
// import { NgxUiLoaderService } from 'ngx-ui-loader';
// import { SessionService } from '../../../../shared/services/session.service';
import { Cliente } from '../../../../shared/interfaces/client.interface';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { isPlatformBrowser } from '@angular/common';
import { response } from 'express';
import Swal from 'sweetalert2';
import { SessionService } from '../../../../shared/services/session.service';
declare const $: any;

@Component({
  selector: 'app-listado-clientes',
  templateUrl: './listado-clientes.component.html',
  styleUrls: [
    '../../../../shared/styles/tablePrime.scss',
    '../../../../shared/styles/form.scss',
  ],
})
export class ListadoClientesComponent implements OnInit {
  data!: any;
  visible: boolean = false;
  totalRecords: number = 0;
  rows: number = 5; // Número de registros por página
  first: number = 0; // Índice del primer registro de la página actual

  listUsuario?: Cliente;
  idCliente!: string;
  id!: string | null;
  clienteForm!: FormGroup;
  allClients: Cliente[] = [];
  selectedClient!: Cliente;
  paginatedUser: Cliente[] = [];
  usuarioId: any; // Para almacenar temporalmente el ID del usuario a eliminar

  isVisible = false;

  ngOnInit() {
    this.getUsuario();
    this.updatePaginatedUser();
  }

  constructor(
    private us: UsuarioService,
    // private render2: Renderer2,
    // private mapService: MapaClientDetailUbacionService,
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object,
    // private mapaService}: MapaService,
    private UserS: ClientesService,
    private elementRef: ElementRef,
    private router: ActivatedRoute,
    private rou: Router,
    public sessionService: SessionService // private toast: Toast,
  ) // private ngxUiLoaderService: NgxUiLoaderService,

  {
    this.clienteForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', Validators.required],
      // estatus: ['', Validators.required],
      telefono: ['', Validators.required],
      password: ['', Validators.required],
    });
    this.id = this.router.snapshot.paramMap.get('id');
  }

  getUsuario() {
    // this.ngxUiLoaderService.start();
    // const userData = this.sessionService.getId();
    // const idPurificadora = userData;

    this.us.getUsuarios().subscribe(
      (data: Cliente[]) => {
        console.log('Data received:', data);
        if (Array.isArray(data)) {
          this.allClients = data; // Ensure it's an array
        } else {
          this.allClients = []; // Fallback to empty array
          console.error('Unexpected data format:', data);
        }
        this.totalRecords = this.allClients.length;
        this.updatePaginatedUser();
        // this.ngxUiLoaderService.stop(); // Stop the loader when done
      },
      (error) => {
        console.log('ocurrió un error al obtener la información', error);
        // this.ngxUiLoaderService.stop(); // Stop the loader in case of error
      }
    );
  }

  // getUsuario() {
  //   this.us.getUsuarios().subscribe((res) => {
  //     console.log(res);
  //     this.data = res;
  //   });
  // }

  filterText: string = '';
  eliminarUsuario(id: any) {
    this.usuarioId = id; // Almacena el ID del usuario que se quiere eliminar
    $('.basic.test.modal')
      .modal({
        closable: false, // Evita cerrar haciendo clic fuera del modal
        onApprove: () => {
          // this.us.eliminarUsuario(id)
          this.confirmarEliminar(); // Ejecuta la confirmación cuando se aprueba
        },
      })
      .modal('show'); // Muestra el modal
  }

  confirmarEliminar() {
    // this.usuarioId = id;
    this.us.eliminarUsuario(this.usuarioId).subscribe((response) => {
      this.getUsuario(); // Actualiza la lista de usuarios después de eliminar uno
      Swal.fire(
        'Eliminado',
        'El usuario se ha eliminado correctamente.',
        'success'
      );
      this.usuarioId = null; // Resetea el ID del usuario que se quiere eliminar para evitar problemas con el siguiente clic en el botón de eliminar
    });
    console.log(`Usuario con ID ${this.usuarioId} eliminado.`);
    // Aquí puedes llamar a tu servicio para eliminar el usuario
  }

  onGlobalFilter(event: Event) {
    // const value = event.target as HTMLInputElement;
    const value = (event.target as HTMLInputElement).value.toLowerCase();

    if (value) {
      const filteredData = this.allClients.filter(
        (c) =>
          c.nombre.toLowerCase().includes(value) ||
          c.email.toLowerCase().includes(value) ||
          c.telefono.toLowerCase().includes(value) ||
          c.municipio.toLowerCase().includes(value) ||
          c.colonia.toLowerCase().includes(value)
      );

      this.totalRecords = filteredData.length;
      this.paginatedUser = filteredData.slice(
        this.first,
        this.first + this.rows
      );
    } else {
      this.totalRecords = this.allClients.length;
      this.paginatedUser = this.allClients.slice(
        this.first,
        this.first + this.rows
      );

      // this.dt2.filterGlobal(input.value, "contains");
    }
  }

  redirectToAdmin(route: string): void {
    console.log(route);
    if (route === 'login') {
      this.rou.navigate(['/auth/login']); // Navegación hacia la página de inicio de sesión
    } else {
      this.rou.navigate(['/admin', route]); // Navegación hacia otras páginas públicas
    }
  }

  
add(){
    this.visible = true;
}

  editar(id: any) {
    this.visible = true;
    this.idCliente = this.router.snapshot.params['id'];
    if (id !== null) {
      // Decodifica la contraseña

      console.log('actualizar....');
      this.UserS.detalleClienteById(id).subscribe((data) => {
        this.listUsuario = data;
        // const decodedPassword = this.sessionService.descifrarTexto(
        //   data.password
        // );
        // console.log(decodedPassword);
        this.clienteForm.setValue({
          nombre: data.nombre,
          email: data.email,
          // // estatus: data.estatus,
          telefono: data.telefono,
          password: '',
        });
      });
    }
  }
  // resaltado de texto letra o palabra entonctrada
  highlightText(text: string): string {
    if (!this.filterText) {
      return text; // Si no hay texto a filtrar, regresa el texto original.
    }

    const regex = new RegExp(`(${this.filterText})`, 'gi'); // Crea una expresión regular para encontrar el texto de búsqueda.
    return text.replace(regex, '<strong>$1</strong>'); // Reemplaza las coincidencias con el texto en negritas.
  }

  actualizarCliente(id: any) {
    if (this.clienteForm.valid) {
      this.UserS.updateUsuario(id, this.clienteForm.value).subscribe(
        (response) => {
          this.getUsuario();
          this.visible = false;

          // this.Toast.showToastPmNgInfo("Usuario actualizado");

          console.log('Usuario actualizado:', response);
        },
        (error) => {
          console.error('Error al actualizar el usuario:', error);
        }
      );
    }
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.updatePaginatedUser();
  }

  updatePaginatedUser() {
    console.log();
    this.paginatedUser = this.allClients.slice(
      this.first,
      this.first + this.rows
    );
  }
}
