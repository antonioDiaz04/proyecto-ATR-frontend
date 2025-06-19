import {
  CUSTOM_ELEMENTS_SCHEMA,
  importProvidersFrom,
  NgModule,Component,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-routing.module';
import { AuthComponent } from './auth.component';
// import { SignInView } from './view/sign-in/sign-in.view';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SignInService } from './commons/services/sign-in.service';
import {
  HttpClientModule,
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { SignUpService } from './commons/services/sign-up.service';
// import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';
import { mensageservice } from '../../shared/services/mensage.service';
import { UsuarioService } from '../../shared/services/usuario.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { PasswordModule } from 'primeng/password';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';

import { DialogModule } from 'primeng/dialog';

import { VerificarCodigoView } from './view/verificar-codigo/verificar-codigo.view';

import { InputOtpModule } from 'primeng/inputotp';
// import { RegistroComponent } from './view/registro/registro.component';
import { RegistroView } from './view/registro/registro.view';
import { SessionService } from '../../shared/services/session.service';
import { PublicModule } from '../public/public.module';
import { InputGroupModule } from 'primeng/inputgroup';
import { NgClass } from '@angular/common';
import { RouterModule } from '@angular/router';
// import { LoginModalComponent } from './view/login-modal/login-modal.component';

import { AngularFireModule } from '@angular/fire/compat';
import { environment } from '../../../environments/environment';
// import { RecuparByPreguntaComponent } from './view/recuperar-password/recupar-by-pregunta/recupar-by-pregunta.component';
import { RecuperarByEmailComponent } from './view/recuperar-by-email/recuperar-by-email.component';
import { HeaderModule } from '../../shared/components/header/header.module';
import { DatosEmpresaService } from '../../shared/services/datos-empresa.service';
import { SignInView } from './view/sign-in/sign-in.view';

@NgModule({
  declarations: [
    AuthComponent,
    VerificarCodigoView,
    RegistroView,RecuperarByEmailComponent, SignInView,
    // LoginModalComponent,
  ],
  imports: [
    InputOtpModule,
    ButtonModule,
    CommonModule,
    DialogModule,
    RouterModule,
    FormsModule,
    DividerModule,
    ReactiveFormsModule,
    AuthRoutingModule,
    StepperModule,
    PasswordModule,
    InputMaskModule,
    InputTextModule,
    InputGroupModule,
    // PublicModule,
    ToastrModule.forRoot(),
    HeaderModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    //para lo del capchat xd
    NgClass,
    RouterModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    // ProductoService,
    // importProvidersFrom(RecaptchaV3Module),
    // {
    //   provide: RECAPTCHA_V3_SITE_KEY,
    //   useValue: '6LereGcqAAAAAOYonCxeWIj-b9XAv8Y3hng--ype',
    // },
    DatosEmpresaService ,
    SignInService,
    SessionService,
    mensageservice,
    UsuarioService,
    ToastrService,
    MessageService,
    ConfirmationService,
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
  ],
})
export class AuthModule {}
