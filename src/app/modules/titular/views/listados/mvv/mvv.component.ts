import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
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
  styleUrl:'./mvv.component.scss',
  providers: [MessageService],
})
export class MVVComponent implements OnInit {
  mvvForm!: FormGroup;
  isEditing = false;
  isNewEntry = true;
  originalData: any = null;
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
      fechaVigencia: ['', [this.validateFutureDate]],
      items: this.fb.array([]),
    });

    this.cargarContenido();
  }

  validateFutureDate(control: AbstractControl): ValidationErrors | null {
    const selectedDate = new Date(control.value);
    const today = new Date();

    // Elimina la parte de horas para comparar solo fechas
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return selectedDate < today ? { pastDate: true } : null;
  }

  get valoresItems(): FormArray {
    return this.mvvForm.get('items') as FormArray;
  }

  getDefaultFutureDate(): string {
    const today = new Date();
    const nextMonth = new Date(today.setMonth(today.getMonth() + 1));
    return nextMonth.toISOString().split('T')[0];
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

    const defaultFecha = this.getDefaultFutureDate();

    this.mvvForm.patchValue({
      title: selected?.title || '',
      description: selected?.description || '',
      fechaVigencia: selected?.fechaVigencia || defaultFecha,
    });

    this.valoresItems.clear();
    if (this.selectedOption === 'valores' && selected?.items) {
      selected.items.forEach((valor: string) => {
        this.valoresItems.push(this.fb.control(valor));
      });
    }
  }

  editPolitica(index: number) {
    this.isEditing = true;
    this.selectedPoliticaIndex = index;

    const politica = this.content.politicas[index];

    this.mvvForm.patchValue({
      id: politica._id || '',
      title: politica.titulo,
      description: politica.contenido,
      fechaVigencia: politica.fechaVigencia?.split('T')[0] || '',
    });
  }
  editTermino(index: number) {
    this.isEditing = true;
    this.isNewEntry = false;
    this.selectedPoliticaIndex = index;

    const term = this.content.terminos[index];
    this.originalData = { ...term }; // ✅ Clonar para cancelación

    this.mvvForm.patchValue({
      id: term._id || '',
      title: term.titulo,
      description: term.contenido,
      fechaVigencia: term.fechaVigencia?.split('T')[0] || '',
    });
  }

  editDeslinde(index: number) {
    this.isEditing = true;
    this.isNewEntry = false;
    this.selectedPoliticaIndex = index;

    const deslinde = this.content.deslinde[index];
    this.originalData = { ...deslinde }; // ✅ Clonar para cancelación

    this.mvvForm.patchValue({
      id: deslinde._id || '',
      title: deslinde.titulo,
      description: deslinde.contenido,
      fechaVigencia: deslinde.fechaVigencia?.split('T')[0] || '',
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

    // ✅ Guardar copia del contenido antes de sobreescribirlo
    if (
      this.selectedOption === 'mision' ||
      this.selectedOption === 'vision' ||
      this.selectedOption === 'valores'
    ) {
      this.originalData = { ...this.content[this.selectedOption] };
    } else if (
      this.selectedOption === 'politicas' ||
      this.selectedOption === 'terminos' ||
      this.selectedOption === 'deslinde'
    ) {
      this.originalData = null; // En este caso es un nuevo ítem, no se sobreescribe el arreglo
    }

    const hoy = new Date();
    const unMesDespues = new Date(hoy.setMonth(hoy.getMonth() + 1));
    const fechaPorDefecto = unMesDespues.toISOString().split('T')[0];

    this.mvvForm.reset({
      title: '',
      description: '',
      fechaVigencia: fechaPorDefecto,
    });

    this.valoresItems.clear();
  }

  startEditing() {
    this.isEditing = true;
    const selected = this.content[this.selectedOption];

    this.mvvForm.patchValue({
      title: selected.title || '',
      description: selected.description || '',
      fechaVigencia: selected.fechaVigencia?.split('T')[0] || '',
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
    this.isNewEntry = false;
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

      this.selectOption(this.selectedOption);
    });
  }

  saveChanges() {
    const formValue = this.mvvForm.value;

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
        id ? service.crearVision(data) : service.crearVision(data),
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
          const isArrayBased = ['politicas', 'terminos', 'deslinde'].includes(
            this.selectedOption
          );
          const isNew = !this.mvvForm.value.id;

          if (isArrayBased) {
            const arr = this.content[this.selectedOption];
            const index = res?._id
              ? arr.findIndex((el: any) => el._id === res._id)
              : -1;
            if (index !== -1) {
              arr[index] = res; // actualización
            } else {
              arr.push(res); // nuevo
            }
          } else {
            // Para mision, vision, valores
            this.content[this.selectedOption] = {
              ...this.content[this.selectedOption],
              ...res,
            };
          }

          const detailMsg =
            isArrayBased && isNew
              ? 'Registro creado exitosamente.'
              : 'Cambios guardados correctamente.';

          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: detailMsg,
          });

          // 🟢 Refrescar contenido para ver cambios reflejados
          this.cargarContenido();

          // 🔄 Resetear estado de edición
          this.isEditing = false;
          this.isNewEntry = false;
          this.selectedPoliticaIndex = null;
          this.mvvForm.reset();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Ocurrió un error al guardar',
          });
        },
      });
    }
  }
}
