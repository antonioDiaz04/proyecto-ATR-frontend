import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth.component';
import { SignInView } from './view/sign-in/sign-in.view';
import { RecuperarPasswordView } from './view/recuperar-password/recuperar-password.view';
import { VerificarCodigoView } from './view/verificar-codigo/verificar-codigo.view';
import { RegistroView } from './view/registro/registro.view';
const routes: Routes = [
  {
    path: '',
    component: AuthComponent,
    children: [
      { path: 'Sign-in', component: SignInView },
      { path: 'Sign-up', component: RegistroView },
      { path: 'forgot-password', component: RecuperarPasswordView },
      { path: 'Activar-cuenta', component: VerificarCodigoView },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  
})
export class AuthRoutingModule {}
