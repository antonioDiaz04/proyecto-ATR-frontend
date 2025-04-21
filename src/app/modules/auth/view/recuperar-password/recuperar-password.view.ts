import Swal from 'sweetalert2';
import { Component, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormControl, Validators, FormBuilder } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { mensageservice } from '../../../../shared/services/mensage.service';
import { UsuarioService } from '../../../../shared/services/usuario.service';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'app-recuperacion-password',
  templateUrl: './recuperar-password.view.html',
  styleUrls: ['./recuperar-password.view.scss'],
})
export class RecuperarPasswordView {
    // Variables
    
    constructor(private router:Router){

    }
    mostrarOpciones: boolean = true; // Controla si se muestran las opciones de recuperación
    opcionSeleccionada: string = ''; // Almacena la opción seleccionada ('correo' o 'pregunta')
  
    // Método para seleccionar una opción
    seleccionarOpcion(opcion: string) {
      this.opcionSeleccionada = opcion; // Asignar la opción seleccionada
      this.mostrarOpciones = false; // Ocultar las opciones y mostrar el componente correspondiente
    }
  
    // Método para regresar a la selección de opciones
    regresar() {
      this.opcionSeleccionada = ''; // Reiniciar la opción seleccionada
      this.mostrarOpciones = true; // Mostrar las opciones de nuevo
    }
    inicio() {          
      this.router.navigate(['/inicio']); // Redirige al home del cliente

    }
  
}