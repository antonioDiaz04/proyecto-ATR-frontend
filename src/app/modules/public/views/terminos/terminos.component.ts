import { Component, OnInit } from '@angular/core';
import { DatosEmpresaService } from '../../../../shared/services/datos-empresa.service';
import { ControlAdministrativaService } from '../../../../shared/services/control-administrativa.service';
import { Termino } from '../../../../shared/interfaces/terminosYCondiciones';
import AOS from 'aos';

@Component({
  selector: 'app-terminos',
  templateUrl: './terminos.component.html',
})
export class TerminosComponent implements OnInit {
  terminos: Termino[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  historialTerminos: Termino[] = []; // Tipado adecuado

  constructor(private controlAdministrativaService: ControlAdministrativaService) { }

  ngOnInit(): void {
    this.getData();
    this.cargarTerminos()

    AOS.init({
      duration: 650, // Duración de la animación en milisegundos
      once: true, // Si `true`, la animación solo se ejecuta una vez
    });
  }

  getData() {
    this.isLoading = true;

  }

  cargarTerminos() {
    this.controlAdministrativaService.obtenerTerminosYCondiciones().subscribe({
      next: (response: Termino[]) => {
        this.historialTerminos = response;
        console.log(this.historialTerminos);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar historial:', error);
        this.isLoading = false;
      },
    });
  }

  // Método para formatear el contenido con saltos de línea
  formatContent(content: string): string {
    return content.replace(/\n/g, '<br>');
  }
}