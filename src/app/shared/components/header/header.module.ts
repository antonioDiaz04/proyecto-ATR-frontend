import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http'; // Add HttpClientModule if needed

// PrimeNG Modules
import { SidebarModule } from 'primeng/sidebar';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';

// Components
import { HeaderComponent } from './header.component';
import { LoginModalComponent } from '../login-modal/login-modal.component'; // Adjust the path as needed
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { ProductoService } from '../../services/producto.service';

@NgModule({
  declarations: [
    HeaderComponent
  ],
  imports: [NgxUiLoaderModule,
    LoginModalComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule, // Add HttpClientModule if needed
    SidebarModule,
    InputTextModule,
    FloatLabelModule,
    InputNumberModule,
    ConfirmDialogModule,
    MessageModule,
    ToastModule,
  ],
  exports: [
    HeaderComponent, // Export the component if it will be used in other modules
  ],
  providers: [
    // Add any services if needed
  ],
})
export class HeaderModule { }