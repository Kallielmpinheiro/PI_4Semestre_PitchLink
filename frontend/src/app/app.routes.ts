import { Routes } from '@angular/router';

// Page Components
import { HomeComponent } from './modules/pitchlink/pages/home/home.component';
import { PerfilComponent } from './modules/user/pages/perfil/perfil.component';
import { SwingComponent } from './modules/views/cards/pages/swing/swing.component';
import { LayoutComponent } from './modules/views/aplicacao/pages/layout/layout.component';
import { authGuardNotFoundGuard } from './core/guards/not-found/auth-guard-not-found.guard';
import { authGuardSuccessGuard } from './core/guards/success/auth-guard-success.guard';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    },
    {
        path: 'perfil',
        component: PerfilComponent,
        data: { hideNav: true },
        canActivate: [authGuardNotFoundGuard]
    },
    {
        path: 'app',
        component: LayoutComponent,
        canActivate: [authGuardSuccessGuard],
        children: [
            {path:'recs', component: SwingComponent},
            {path:'perfil', component: PerfilComponent}
        ]
    },
    {
        path: '**',
        redirectTo: '',
        pathMatch: 'full'
    }
];
