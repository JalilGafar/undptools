import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SupervisorComponent } from './layout/supervisor/supervisor.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';

export const routes: Routes = [
    // { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },

    { path: '', component: HomeComponent },
    { path: 'supervisor', component: SupervisorComponent },
    { path: 'consultant', loadChildren: () => import('./consultant/consultant.module').then(m => m.ConsultantModule) },
];
