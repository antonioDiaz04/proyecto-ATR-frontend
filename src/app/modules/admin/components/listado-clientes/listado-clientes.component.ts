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
import { ConfirmationService, MessageService } from 'primeng/api';
declare const $: any;

@Component({
  standalone: false,
  selector: 'app-listado-clientes',
  templateUrl: './listado-clientes.component.html',
  // providers: [ConfirmationService, MessageService]
})
export class ListadoClientesComponent implements OnInit {
  // Datos y paginación
  allClients: Cliente[] = [];
  paginatedUser: Cliente[] = [];
  totalRecords: number = 0;
  rows: number = 5;
  first: number = 0;
  filterText: string = '';

  // Formulario y modales
  clienteForm: FormGroup;
  visible: boolean = false;
  listUsuario?: Cliente;

  constructor(
    private clientesService: ClientesService,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.clienteForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      password: ['']
    });
  }

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.clientesService.obtenerCLientes().subscribe({
      next: (data: Cliente[]) => {
        this.allClients = data;
        this.totalRecords = data.length;
        this.updatePaginatedUser();
      },
      error: (error) => {
        console.error('Error al cargar clientes:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los clientes'
        });
      }
    });
  }

  // Filtrado y búsqueda
  onGlobalFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value.toLowerCase();
    this.filterText = value;
    this.first = 0; // Resetear a primera página al filtrar
    this.updatePaginatedUser();
  }

  // Paginación
  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
    this.updatePaginatedUser();
  }

  updatePaginatedUser(): void {
    let filtered = this.allClients;
    
    if (this.filterText) {
      filtered = filtered.filter(c =>
        c.nombre.toLowerCase().includes(this.filterText) ||
        c.email.toLowerCase().includes(this.filterText) ||
        c.telefono.toLowerCase().includes(this.filterText)
      );
    }

    this.totalRecords = filtered.length;
    this.paginatedUser = filtered.slice(this.first, this.first + this.rows);
  }

  // Operaciones CRUD
  add(): void {
    this.listUsuario = undefined;
    this.clienteForm.reset();
    this.visible = true;
  }

  editar(id: string): void {
    this.clientesService.detalleClienteById(id).subscribe({
      next: (data) => {
        this.listUsuario = data;
        this.clienteForm.patchValue({
          nombre: data.nombre,
          email: data.email,
          telefono: data.telefono,
          password: '' // No mostramos la contraseña actual
        });
        this.visible = true;
      },
      error: (error) => {
        console.error('Error al cargar cliente:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el cliente'
        });
      }
    });
  }

  actualizarCliente(id?: string): void {
    if (id && this.clienteForm.valid) {
      this.clientesService.updateUsuario(id, this.clienteForm.value).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Cliente actualizado correctamente'
          });
          this.visible = false;
          this.cargarClientes();
        },
        error: (error) => {
          console.error('Error al actualizar:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el cliente'
          });
        }
      });
    }
  }

  confirmarEliminar(id: string): void {
    this.confirmationService.confirm({
      message: '¿Estás seguro de eliminar este cliente?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => this.eliminarUsuario(id)
    });
  }

  eliminarUsuario(id: string): void {
    this.clientesService.eliminarCliente(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Cliente eliminado correctamente'
        });
        this.cargarClientes();
      },
      error: (error) => {
        console.error('Error al eliminar:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo eliminar el cliente'
        });
      }
    });
  }

  // Utilidades
  highlightText(text: string): string {
    if (!this.filterText) return text;
    const regex = new RegExp(`(${this.filterText})`, 'gi');
    return text.replace(regex, '<strong>$1</strong>');
  }
}