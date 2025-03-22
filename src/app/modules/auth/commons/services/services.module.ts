import { NgModule } from '@angular/core';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

@NgModule({ declarations: [], imports: [], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class AuthServicesModule { }
