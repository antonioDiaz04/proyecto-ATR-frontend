import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {



  constructor(private Location: Location, private router: Router) {

    // This is the constructor of the AuthComponent
    // You can initialize any properties or services here

  }


  atras() {
    // This method is called when the "atras" button is clicked
    // You can implement any logic you need here
    this.Location.back();
  }
}

