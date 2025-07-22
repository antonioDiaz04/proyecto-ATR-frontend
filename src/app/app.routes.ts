import { Routes } from '@angular/router';
// Asumo que tus guards de rol están definidos en auth.guard.ts,
// o que son funciones CanActivateFn exportadas individualmente.
// Si no están en auth.guard.ts, ajusta la ruta.
import { adminGuard, titularGuard, clientGuard,  } from './shared/guards/auth.guard'; // Agregué AuthGuard si tienes uno general

export const routes: Routes = [
    // 1. Ruta de inicio (default)
    // Cuando la aplicación arranca sin una ruta específica,
    // queremos que el AuthGuard general se encargue de decidir a dónde ir.
    // Esto es crucial para la redirección inicial si ya hay sesión.
    {
        path: '',
        // Este `canActivate` del AuthGuard general se ejecutará al cargar la ruta raíz.
        // Dentro de AuthGuard, puedes verificar la sesión y redirigir
        // a /auth/login si no hay sesión, o a la home de un rol si la hay.
        // canActivate: [AuthGuard], // Asumo que tienes un AuthGuard general
        loadChildren: () => import('../app/modules/public/public.module').then(m => m.PublicModule),
        // Si public.module no necesita autenticación, puedes quitar el canActivate aquí,
        // y manejar la redirección al login en la ruta '' mediante un redirectTo a 'auth/login'
        // si el AuthGuard no es suficientemente sofisticado para manejarlo desde el inicio.
        // PERO, la mejor práctica es que el AuthGuard de la ruta raíz maneje la lógica de inicio.
    },
    // Alternativa para la ruta raíz si no quieres que el AuthGuard la active directamente:
    // {
    //   path: '',
    //   redirectTo: 'auth/login', // Redirige directamente al login si no se especifica ruta.
    //                             // El AuthGuard de las rutas protegidas se encargará del resto.
    //   pathMatch: 'full'
    // },

    // 2. Rutas de Autenticación
    // Estas rutas NO deben tener guards de canActivate directamente aquí,
    // ya que son para usuarios NO AUTENTICADOS.
    // La lógica para REDIRIGIR A UN USUARIO YA LOGUEADO FUERA DE ESTAS RUTAS
    // debe estar en tu AuthGuard general (como lo mostré en la respuesta anterior).
    {
        path: 'auth',
        loadChildren: () => import('../app/modules/auth/auth.module').then(m => m.AuthModule)
    },

    // 3. Rutas Protegidas por Rol
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

    // 4. Rutas de Error
    // Redirige a un componente real para mostrar el error.
    // Asumo que tienes un módulo/componente para 500 y 404.
    // {
    //     path: '500', // Esta debería ser una ruta a un componente de error 500
    //     loadChildren: () => import('./modules/error/error.module').then(m => m.ErrorModule), // Ejemplo: un módulo de errores
    //     // O si es un componente standalone:
    //     // component: InternalServerErrorComponent
    // },
    // {
    //     path: '404', // Esta debería ser una ruta a un componente de error 404
    //     loadChildren: () => import('./modules/error/error.module').then(m => m.ErrorModule), // Ejemplo
    //     // O si es un componente standalone:
    //     // component: NotFoundComponent
    // },
    {
        path: '**', // Ruta wildcard para capturar cualquier otra ruta no definida
        redirectTo: '/404' // Redirige a la página 404
    },
];