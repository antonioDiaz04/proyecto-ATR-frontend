import { TitularModule } from './modules/titular/titular.module';
import { Routes } from '@angular/router';
import { adminGuard } from './shared/guards/auth.guard';
import { titularGuard } from './shared/guards/auth.guard';
import { clientGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
    {
      path: '',
      redirectTo: '',
      pathMatch: 'full',
    },
    {
      path: '',
      loadChildren: () => import('../app/modules/public/public.module').then(m => m.PublicModule),
      // canActivate: [SomeGuard], // Si necesitas algún guard
    },
  {
    path: 'admin',
    // canActivate: [adminGuard],
    loadChildren: () => import('../app/modules/admin/admin.module').then(m=>m.AdminModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('../app/modules/auth/auth.module').then(m=>m.AuthModule)
  },
  {
  // canActivate: [clientGuard], // Solo usuarios autenticados pueden acceder
    path: 'cuenta',
    loadChildren: () => import('../app/modules/client/client.module').then(m=>m.ClientModule)
  },
  {
    path: 'titular',
    // canActivate: [titularGuard] ,
    loadChildren: () => import('../app/modules/titular/titular.module').then(m=>m.TitularModule)
  },
  {
    path: '500', // Ruta para error 500
    redirectTo: '/500'
  },
  {
    path: '**', // Ruta wildcard para capturar cualquier otra ruta no definida
    redirectTo:'/404' // Redirige a la ruta 'public'
  },
];
