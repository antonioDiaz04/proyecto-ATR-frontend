import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ControlAdministrativaService } from '../../../../../shared/services/control-administrativa.service';
import { catchError, forkJoin, of } from 'rxjs';

type OptionId =
  | 'mision'
  | 'vision'
  | 'valores'
  | 'politicas'
  | 'terminos'
  | 'deslinde';

@Component({
  selector: 'app-mvv',
  templateUrl: './mvv.component.html',
  providers: [MessageService],
})
export class MVVComponent implements OnInit {
  mvvForm!: FormGroup;
  isEditing = false;
  isNewEntry = true;
  selectedPoliticaIndex: number | null = null;
  selectedOption:
    | 'mision'
    | 'vision'
    | 'valores'
    | 'politicas'
    | 'terminos'
    | 'deslinde' = 'mision';

  options: { id: OptionId; title: string }[] = [
    { id: 'mision', title: 'Misión' },
    { id: 'vision', title: 'Visión' },
    { id: 'valores', title: 'Valores' },
    { id: 'politicas', title: 'Políticas' },
    { id: 'terminos', title: 'Términos y Condiciones' },
    { id: 'deslinde', title: 'Deslinde Legal' },
  ];

  content: any = {
    mision: { title: '', description: '', fechaVigencia: '', _id: null },
    vision: { title: '', description: '', fechaVigencia: '', _id: null },
    valores: { title: '', items: [], fechaVigencia: '', _id: null },
    politicas: [],
    terminos: [],
    deslinde: [],
  };

  constructor(
    private fb: FormBuilder,
    private adminService: ControlAdministrativaService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.mvvForm = this.fb.group({
      id: [''],
      title: [''],
      description: [''],
      fechaVigencia: [''],
      items: this.fb.array([]),
    });

    this.cargarContenido();
  }

  get valoresItems(): FormArray {
    return this.mvvForm.get('items') as FormArray;
  }

  selectOption(option: string) {
    const validOptions: OptionId[] = [
      'mision',
      'vision',
      'valores',
      'politicas',
      'terminos',
      'deslinde',
    ];
    if (!validOptions.includes(option as OptionId)) return;

    this.selectedOption = option as OptionId;
    const selected = this.content[this.selectedOption];

    this.mvvForm.patchValue({
      title: selected?.title || '',
      description: selected?.description || '',
      fechaVigencia: selected?.fechaVigencia || '',
    });

    this.valoresItems.clear();
    if (this.selectedOption === 'valores' && selected?.items) {
      selected.items.forEach((valor: string) => {
        this.valoresItems.push(this.fb.control(valor));
      });
    }

    console.log('Seleccionado:', this.selectedOption, selected);
  }

  editPolitica(index: number) {
    this.isEditing = true;
    this.selectedPoliticaIndex = index;

    const politica = this.content.politicas[index];

    this.mvvForm.patchValue({
      id: politica._id || '',
      title: politica.titulo,
      description: politica.contenido,
      fechaVigencia: politica.fechaVigencia,
    });
  }
  editTermino(index: number) {
    this.isEditing = true;
    this.isNewEntry = false;
    this.selectedPoliticaIndex = index;

    const term = this.content.terminos[index];
    this.mvvForm.patchValue({
      id: term._id || '',
      title: term.titulo,
      description: term.contenido,
      fechaVigencia: term.fechaVigencia,
    });
  }

  editDeslinde(index: number) {
    this.isEditing = true;
    this.isNewEntry = false;
    this.selectedPoliticaIndex = index;

    const deslinde = this.content.deslinde[index];
    this.mvvForm.patchValue({
      id: deslinde._id || '',
      title: deslinde.titulo,
      description: deslinde.contenido,
      fechaVigencia: deslinde.fechaVigencia,
    });
  }
  deleteTermino(index: number) {
    const termino = this.content.terminos[index];

    if (confirm('¿Estás seguro de que deseas eliminar este término?')) {
      const id = termino._id;

      if (!id) {
        this.content.terminos.splice(index, 1);
        return;
      }

      this.adminService.eliminarTerminosYCondiciones(id).subscribe({
        next: () => {
          this.content.terminos.splice(index, 1);
          this.messageService.add({
            severity: 'success',
            summary: 'Eliminado',
            detail: 'El término fue eliminado correctamente',
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo eliminar el término',
          });
        },
      });
    }
  }

  deleteDeslinde(index: number) {
    const deslinde = this.content.deslinde[index];

    if (confirm('¿Estás seguro de que deseas eliminar este deslinde?')) {
      const id = deslinde._id;

      if (!id) {
        this.content.deslinde.splice(index, 1);
        return;
      }

      this.adminService.eliminarDeslindeLegal(id).subscribe({
        next: () => {
          this.content.deslinde.splice(index, 1);
          this.messageService.add({
            severity: 'success',
            summary: 'Eliminado',
            detail: 'El deslinde fue eliminado correctamente',
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo eliminar el deslinde',
          });
        },
      });
    }
  }

  createNew() {
    this.isEditing = true;
    this.isNewEntry = true;

    // ✅ Si la opción es "políticas", limpiar el formulario y el ID
    if (this.selectedOption === 'politicas') {
      this.selectedPoliticaIndex = null;
      this.mvvForm.reset({
        id: '', // <- limpiamos el ID para evitar que se tome como edición
        title: '',
        description: '',
        fechaVigencia: '',
      });
      return;
    }

    // ✅ Si es otra opción (mision, vision, valores, etc.)
    this.content[this.selectedOption] = {
      title: '',
      description: '',
      fechaVigencia: '',
      ...(this.selectedOption === 'valores' ? { items: [] } : {}),
    };

    this.mvvForm.reset({
      id: '',
      title: '',
      description: '',
      fechaVigencia: '',
      items: [],
    });

    this.valoresItems.clear();
  }

  startEditing() {
    this.isEditing = true;
    const selected = this.content[this.selectedOption];

    this.mvvForm.patchValue({
      title: selected.title || '',
      description: selected.description || '',
      fechaVigencia: selected.fechaVigencia || '',
    });

    this.valoresItems.clear();
    if (this.selectedOption === 'valores' && selected.items) {
      selected.items.forEach((valor: string) => {
        this.valoresItems.push(this.fb.control(valor));
      });
    }
  }

  cancelEdit() {
    this.isEditing = false;
    this.selectedPoliticaIndex = null;
    this.mvvForm.reset();

    // Solo recargar datos si necesitas restaurar los originales
    if (this.selectedOption === 'politicas') {
      this.selectOption('politicas');
    }
  }

  deletePolitica(index: number) {
    const politica = this.content.politicas[index];

    if (confirm('¿Estás seguro de que deseas eliminar esta política?')) {
      const id = politica._id;

      if (!id) {
        this.content.politicas.splice(index, 1);
        return;
      }

      this.adminService.eliminarPolitica(id).subscribe({
        next: () => {
          this.content.politicas.splice(index, 1);
          this.messageService.add({
            severity: 'success',
            summary: 'Eliminado',
            detail: 'La política fue eliminada correctamente',
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo eliminar la política',
          });
        },
      });
    }
  }

  clearContent() {
    this.mvvForm.reset();
    this.valoresItems.clear();
  }

  addValor() {
    this.valoresItems.push(this.fb.control(''));
  }

  removeValor(index: number) {
    this.valoresItems.removeAt(index);
  }

  cargarContenido() {
    forkJoin({
      mision: this.adminService
        .obtenerMisiones()
        .pipe(catchError(() => of(null))),
      vision: this.adminService
        .obtenerVision()
        .pipe(catchError(() => of(null))),
      valores: this.adminService
        .obtenerValores()
        .pipe(catchError(() => of([]))),
      politicas: this.adminService
        .obtenerPoliticas()
        .pipe(catchError(() => of([]))),
      terminos: this.adminService
        .obtenerTerminosYCondiciones()
        .pipe(catchError(() => of([]))),
      deslinde: this.adminService
        .obtenerDeslindeLegal()
        .pipe(catchError(() => of([]))),
    }).subscribe((res) => {
      console.log('✅ Respuesta completa:', res);

      if (res.mision) this.content.mision = res.mision;
      if (res.vision) this.content.vision = res.vision;
      if (res.valores) this.content.valores = res.valores;

      if (Array.isArray(res.politicas)) {
        this.content.politicas = res.politicas;
      }

      if (Array.isArray(res.terminos)) {
        this.content.terminos = res.terminos;
      }

      if (Array.isArray(res.deslinde)) {
        this.content.deslinde = res.deslinde;
      }

      console.log('✅ Contenido cargado (transformado):', this.content);
      this.selectOption(this.selectedOption);
    });
  }

  saveChanges() {
    const formValue = this.mvvForm.value;

    console.log('📝 Guardando cambios:', formValue);

    const data =
      this.selectedOption === 'valores'
        ? {
            title: formValue.title,
            items: formValue.items,
            fechaVigencia: formValue.fechaVigencia,
          }
        : this.selectedOption === 'mision' || this.selectedOption === 'vision'
        ? { description: formValue.description }
        : {
            title: formValue.title,
            description: formValue.description,
            fechaVigencia: formValue.fechaVigencia,
          };

    const successMsg = 'Cambios guardados exitosamente';
    const errorMsg = 'Ocurrió un error al guardar';

    // ✅ Manejo de ID dinámico según sea objeto único o elemento de arreglo
    const id =
      ['politicas', 'terminos', 'deslinde'].includes(this.selectedOption) &&
      formValue.id
        ? formValue.id
        : this.content[this.selectedOption]?._id;

    const service = this.adminService;

    const calls: any = {
      mision: () =>
        id ? service.actualizarMision(id, data) : service.crearMision(data),
      vision: () =>
        id ? service.actualizarVision(id, data) : service.crearVision(data),
      valores: () =>
        id ? service.actualizarValor(id, data) : service.crearValor(data),
      politicas: () =>
        id
          ? service.actualizarPoliticas(id, data)
          : service.registerPolitica(data),
      terminos: () =>
        id
          ? service.actualizarTerminosYCondiciones(id, data)
          : service.registerTerminosYCondiciones(data),
      deslinde: () =>
        id
          ? service.actualizarDeslindeLegal(id, data)
          : service.registerDeslindeLegal(data),
    };

    if (calls[this.selectedOption]) {
      calls[this.selectedOption]().subscribe({
        next: (res: any) => {
          if (
            ['politicas', 'terminos', 'deslinde'].includes(this.selectedOption)
          ) {
            if (!res?._id) return;
            const arr = this.content[this.selectedOption];
            const index = arr.findIndex((el: any) => el._id === res._id);
            if (index !== -1) {
              arr[index] = res; // ✅ actualiza
            } else {
              arr.push(res); // 🆕 nuevo
            }
          } else {
            if (!res?._id) return;
            this.content[this.selectedOption] = {
              ...this.content[this.selectedOption],
              ...res,
            };
          }

          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: successMsg,
          });

          this.isEditing = false;
          this.isNewEntry = false;
          this.selectedPoliticaIndex = null;
          this.mvvForm.reset();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMsg,
          });
        },
      });
    }
  }
}
