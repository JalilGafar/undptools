import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SupervisorComponent } from './layout/supervisor/supervisor.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ManagerLoginComponent } from './auth/manager-login/manager-login.component';
import { ProgramComponent } from './shared/components/program/program.component';
import { AdminGuard } from './core/guard/admin.guard';
import { ManagerGuard } from './core/guard/manager.guard';
import { AuthGuard } from './core/guard/auth.guard';
import { ProfileComponent } from './auth/profile/profile.component';
import { VisitorHomeComponent } from './visiteur/components/visitor-home/visitor-home.component';
import { OnconstructionComponent } from './shared/components/onconstruction/onconstruction.component';

export const routes: Routes = [
    // { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'profile', component: ProfileComponent },
    { path: 'visitor', component: VisitorHomeComponent },
    { path: 'build', component: OnconstructionComponent },

    { path: 'supervisor', component: SupervisorComponent },
    { path: 'program', component: ProgramComponent },
    { path: 'consultant', loadChildren: () => import('./consultant/consultant.module').then(m => m.ConsultantModule), canActivate: [AuthGuard]  },
    { path: 'manager', loadChildren: () => import('./manager/manager.module').then(m => m.ManagerModule), canActivate: [ManagerGuard]  },
    { path: 'mintoul', loadChildren: () => import('./mintoul/mintoul.module').then(m => m.MintoulModule), canActivate: []   },
    { path: 'home', component: HomeComponent },
    { path: '', component: HomeComponent },
    { path:'**', redirectTo:''}
];
