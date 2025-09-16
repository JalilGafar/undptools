import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManHomeComponent } from './components/man-home/man-home.component';
import { OneConsultantComponent } from './components/one-consultant/one-consultant.component';
import { ManDashbordComponent } from './components/man-dashbord/man-dashbord.component';



const routes: Routes = [
  {path: '', component: ManHomeComponent},
  {path: 'manOneConsult', component: OneConsultantComponent},
  {path: 'dashbord', component: ManDashbordComponent},

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManagertRoutingModule { }
