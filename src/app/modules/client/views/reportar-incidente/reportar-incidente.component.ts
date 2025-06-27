import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SessionService } from '../../../../shared/services/session.service';
import { UsuarioService } from '../../../../shared/services/usuario.service';

@Component({
  selector: 'app-reportar-incidente',
  templateUrl: './reportar-incidente.component.html',
  styleUrl: './reportar-incidente.component.scss',
})
export class ReportarIncidenteComponent implements OnInit {
  reporteForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private sessionService: SessionService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    const id = this.sessionService.getId();

    if (!id) {
      console.error('No se encontró el ID de sesión');
      return;
    }

    // Inicializar el formulario ANTES de cargar datos
    this.reporteForm = this.fb.group({
      nombre: [''],
      email: ['', [Validators.required, Validators.email]],
      tipo: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
    });

    // Obtener los datos del usuario y llenar el formulario
    this.usuarioService.detalleUsuarioById(id).subscribe((usuario) => {
      if (usuario) {
        console.log('Datos usuario:', usuario);
        this.reporteForm.patchValue({
          nombre: `${usuario.nombre} ${usuario.apellidos ?? ''}`.trim(),
          email: usuario.email,
        });
      }
    });
  }

  enviarReporte() {
    if (this.reporteForm.valid) {
      const id = this.sessionService.getId();
      this.usuarioService.enviarReporte(this.reporteForm.value, id).subscribe(
        (response) => {
          console.log('Reporte enviado exitosamente:', response);
          this.reporteForm.reset();
        },
        (error) => {
          console.error('Error al enviar el reporte:', error);
        }
      );
    } else {
      this.reporteForm.markAllAsTouched();
    }
  }
}
