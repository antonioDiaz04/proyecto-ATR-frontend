import { Routes } from '@angular/router';
// Asumo que tus guards de rol están definidos en auth.guard.ts,
// o que son funciones CanActivateFn exportadas individualmente.
// Si no están en auth.guard.ts, ajusta la ruta.
import { adminGuard, titularGuard, clientGuard, } from './shared/guards/auth.guard'; // Agregué AuthGuard si tienes uno general

export const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('../app/modules/public/public.module').then(m => m.PublicModule),
    },
    {
        path: 'auth',
        loadChildren: () => import('../app/modules/auth/auth.module').then(m => m.AuthModule)
    },
    {
        path: 'admin',
        canActivate: [adminGuard], // Solo usuarios con rol de administrador
        loadChildren: () => import('../app/modules/admin/admin.module').then(m => m.AdminModule)
    },
    {
        // Ruta para clientes autenticados
        path: 'cuenta', // Buen nombre para la sección del cliente
        canActivate: [clientGuard], // Solo usuarios con rol de cliente
        loadChildren: () => import('../app/modules/client/client.module').then(m => m.ClientModule)
    },
    {
        path: 'titular',
        canActivate: [titularGuard], // Solo usuarios con rol de titular
        loadChildren: () => import('../app/modules/titular/titular.module').then(m => m.TitularModule)
    },
    {
        path: '**', // Ruta wildcard para capturar cualquier otra ruta no definida
        redirectTo: '/404' // Redirige a la página 404
    },
];