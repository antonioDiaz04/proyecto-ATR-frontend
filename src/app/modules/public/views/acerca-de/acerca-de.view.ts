import { DatosEmpresaService } from './../../../../shared/services/datos-empresa.service';
import { ControlAdministrativaService } from './../../../../shared/services/control-administrativa.service';
import { Component, OnInit } from '@angular/core';
import { error } from 'console';

@Component({
  selector: 'app-acerca-de',
  templateUrl: './acerca-de.view.html',
})
export class AcercaDeView implements OnInit {
  displayTermsDialog: boolean = false;
  termsAccepted: boolean = false;
  empresaData: any = {};
  // politicasDePrivacidad: any=[];
  // Mostrar el modal
  // showTermsDialog() {
  // }
  constructor(
    private datosEmpresaService: DatosEmpresaService,
  ) {}

  ngOnInit() {
    this.loadCompanyData(); // Cargar los datos de la empresa al iniciar
  }
  loadCompanyData() {
    this.datosEmpresaService.traerDatosEmpresa().subscribe(
      (data) => {
        console.table(data[0]);
        this.empresaData = data[0]; // Guardar los datos en la variable
      },
      (error) => {
        console.error('Error al cargar los datos de la empresa:', error);
      }
    );
  }
}
