import { Component, Injectable, OnInit } from '@angular/core';
import { DatosEmpresaService } from '../../../../shared/services/datos-empresa.service';
import { subscribe } from 'diagnostics_channel';
import AOS from 'aos';

@Component({
  selector: 'app-politicas',
  templateUrl: './politicas.component.html',
  // styleUrl: './politicas.component.scss',
})
export class PoliticasComponent implements OnInit {
  data: any;
  today: any;
  politicas: any;
  constructor(private datosEmpresaService_: DatosEmpresaService) { }
  ngOnInit(): void {
    AOS.init({
      duration: 650, // Duración de la animación en milisegundos
      once: true, // Si `true`, la animación solo se ejecuta una vez
    });
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.datosEmpresaService_.getPoliticas().subscribe(
      (data) => {
        this.data = data;

        this.politicas = Array.isArray(this.data) 
        ? this.data.filter((politic: any) => politic.estado === "vigente") 
        : [];
      
      console.log(this.politicas);
      
      },
      (error) => {
        console.log('error', error.message);
      }
    );
  }
}
