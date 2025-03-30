import { Routes } from '@angular/router';

// Page Components
import { HomeComponent } from './modules/pitchlink/pages/home/home.component';
import { PerfilComponent } from './modules/user/pages/perfil/perfil.component';
import { authGuard } from './core/guards/auth.guard';
import { SwingComponent } from './modules/views/cards/pages/swing/swing.component';
import { LayoutComponent } from './modules/views/aplicacao/pages/layout/layout.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    },
    {
        path: 'perfil',
        component: PerfilComponent,
        data: { hideNav: true },
        canActivate: [authGuard]
    },
    {
        path: 'app',
        component: LayoutComponent,
        canActivate: [authGuard],
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
