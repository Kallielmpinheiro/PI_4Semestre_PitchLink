import { Routes } from '@angular/router';

// Page Components
import { HomeComponent } from './modules/pitchlink/pages/home/home.component';
import { PerfilComponent } from './modules/user/pages/perfil/perfil.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    },
    {
        path: 'perfil',
        component: PerfilComponent,
        canActivate: [authGuard]
    },
    {
        path: '**',
        redirectTo: '',
        pathMatch: 'full'
    }
];
