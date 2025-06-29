import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ControlAdministrativaService } from '../../../../../shared/services/control-administrativa.service';

interface Mision {
  _id: string;
  titulo: string;
  contenido: string;
  fecha?: Date;
}

@Component({
  selector: 'app-mision',
  templateUrl: './mision.component.html',
})
export class MisionComponent implements OnInit {
  misionForm!: FormGroup;
  misiones: Mision[] = [];
  editandoId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private misionService: ControlAdministrativaService
  ) {}

  ngOnInit(): void {
    this.misionForm = this.fb.group({
      titulo: ['', Validators.required],
      contenido: ['', Validators.required],
    });

    this.cargarMisiones();
  }

  cargarMisiones() {
    this.misionService.obtenerMisiones().subscribe((res) => {
      this.misiones = res;
    });
  }

  guardarMision() {
    if (this.misionForm.invalid) return;

    const misionData = this.misionForm.value;

    if (this.editandoId) {
      this.misionService
        .actualizarMision(this.editandoId, misionData)
        .subscribe(() => {
          this.cancelarEdicion();
          this.cargarMisiones();
        });
    } else {
      this.misionService.crearMision(misionData).subscribe(() => {
        this.misionForm.reset();
        this.cargarMisiones();
      });
    }
  }

  editarMision(mision: Mision) {
    this.misionForm.patchValue(mision);
    this.editandoId = mision._id || null;
  }

  eliminarMision(id: string) {
    if (confirm('¿Estás seguro de eliminar esta misión?')) {
      this.misionService.eliminarMision(id).subscribe(() => {
        this.cargarMisiones();
      });
    }
  }

  cancelarEdicion() {
    this.editandoId = null;
    this.misionForm.reset();
  }
}
