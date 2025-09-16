import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SupervisorComponent } from './layout/supervisor/supervisor.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ManagerLoginComponent } from './auth/manager-login/manager-login.component';
import { ProgramComponent } from './shared/components/program/program.component';

export const routes: Routes = [
    // { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'manLogin', component: ManagerLoginComponent },
    { path: 'register', component: RegisterComponent },

    { path: '', component: HomeComponent },
    { path: 'supervisor', component: SupervisorComponent },
    { path: 'program', component: ProgramComponent },
    { path: 'consultant', loadChildren: () => import('./consultant/consultant.module').then(m => m.ConsultantModule) },
    { path: 'manager', loadChildren: () => import('./manager/manager.module').then(m => m.ManagerModule) }
];
