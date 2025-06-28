import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-mvv',
  templateUrl: './mvv.component.html',
})
export class MVVComponent {
  selectedOption: string = 'mision';
  isEditing: boolean = false;
  originalContent: any;
  
  options = [
    { id: 'mision', title: 'Misión' },
    { id: 'vision', title: 'Visión' },
    { id: 'valores', title: 'Valores' }
  ];

  contentForm!: FormGroup;

  content = {
    mision: {
      title: 'Nuestra Misión',
      description: 'Somos una empresa comprometida con brindar soluciones innovadoras y de calidad a nuestros clientes, superando sus expectativas y contribuyendo al desarrollo sostenible de la sociedad.'
    },
    vision: {
      title: 'Nuestra Visión',
      description: 'Ser reconocidos como líderes en nuestro sector, destacando por nuestra excelencia, innovación y compromiso con nuestros clientes y colaboradores, expandiendo nuestras operaciones a nivel internacional.'
    },
    valores: {
      title: 'Nuestros Valores',
      items: [
        'Integridad en todas nuestras acciones',
        'Compromiso con la excelencia',
        'Innovación constante',
        'Responsabilidad social',
        'Trabajo en equipo',
        'Respeto por las personas'
      ]
    }
  };

  constructor(private fb: FormBuilder) {
    this.originalContent = JSON.parse(JSON.stringify(this.content));
    this.initializeForm();
  }

  initializeForm() {
    this.contentForm = this.fb.group({
      mision: this.fb.group({
        title: [this.content.mision.title, Validators.required],
        description: [this.content.mision.description, Validators.required]
      }),
      vision: this.fb.group({
        title: [this.content.vision.title, Validators.required],
        description: [this.content.vision.description, Validators.required]
      }),
      valores: this.fb.group({
        title: [this.content.valores.title, Validators.required],
        items: this.fb.array(this.content.valores.items.map(item => 
          this.fb.control(item, Validators.required)))
      })
    });
  }

  get valoresItems() {
    return (this.contentForm.get('valores.items') as FormArray);
  }

  addValor() {
    this.valoresItems.push(this.fb.control('', Validators.required));
  }

  removeValor(index: number) {
    this.valoresItems.removeAt(index);
  }

  selectOption(option: string): void {
    if (this.isEditing) {
      if (confirm('¿Tienes cambios sin guardar. ¿Deseas continuar?')) {
        this.cancelEdit();
        this.selectedOption = option;
      }
    } else {
      this.selectedOption = option;
    }
  }

  startEditing() {
    this.isEditing = true;
    // Hacemos una copia del contenido original por si cancelamos
    this.originalContent = JSON.parse(JSON.stringify(this.content));
  }

  saveChanges() {
    if (this.contentForm.valid) {
      this.content = this.contentForm.value;
      this.isEditing = false;
      alert('Cambios guardados correctamente');
    } else {
      alert('Por favor completa todos los campos requeridos');
    }
  }

  cancelEdit() {
    this.content = JSON.parse(JSON.stringify(this.originalContent));
    this.initializeForm();
    this.isEditing = false;
  }

  clearContent() {
    if (confirm('¿Estás seguro de que deseas limpiar este contenido?')) {
      if (this.selectedOption === 'valores') {
        while (this.valoresItems.length !== 0) {
          this.valoresItems.removeAt(0);
        }
        this.addValor(); // Dejamos un campo vacío
      } else {
        const currentGroup = this.contentForm.get(this.selectedOption) as FormGroup;
        currentGroup.patchValue({
          title: '',
          description: ''
        });
      }
    }
  }
}