import { Routes } from '@angular/router';

// Page Components
import { HomeComponent } from './modules/pitchlink/pages/home/home.component';
import { PerfilComponent } from './modules/pitchlink/pages/perfil/perfil.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    },
    {
        path: 'perfil',
        component: PerfilComponent
    }
];
