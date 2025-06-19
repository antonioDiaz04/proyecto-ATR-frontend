import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth.component';
import { SignInView } from './view/sign-in/sign-in.view';
import { VerificarCodigoView } from './view/verificar-codigo/verificar-codigo.view';
import { RegistroView } from './view/registro/registro.view';
import { RecuperarByEmailComponent } from './view/recuperar-by-email/recuperar-by-email.component';
const routes: Routes = [
  {
    path: '',
    component: AuthComponent,
    children: [
      { path: 'Sign-in', component: SignInView },
      { path: 'Sign-up', component: RegistroView },
      { path: 'forgot-password', component: RecuperarByEmailComponent },
      { path: 'Activar-cuenta', component: VerificarCodigoView },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  
})
export class AuthRoutingModule {}
