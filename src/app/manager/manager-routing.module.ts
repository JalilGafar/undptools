import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManHomeComponent } from './components/man-home/man-home.component';
import { OneConsultantComponent } from './components/one-consultant/one-consultant.component';
import { ManDashbordComponent } from './components/man-dashbord/man-dashbord.component';
import { ListConsultantComponent } from './components/list-consultant/list-consultant.component';
import { ListCompanyComponent } from './components/list-company/list-company.component';
import { NewCompanyComponent } from './components/new-company/new-company.component';
import { GlobalComponent } from './components/global/global.component';



const routes: Routes = [
  {path: '', component: ManHomeComponent},
  {path: 'manOneConsult/:id', component: OneConsultantComponent},
  {path: 'dashbord', component: ManDashbordComponent},
  {path: 'listconsult', component: ListConsultantComponent},
  {path: 'newCompany', component: NewCompanyComponent},
  {path: 'global', component: GlobalComponent},
  {path: 'listcompany/:id', component: ListCompanyComponent},

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManagertRoutingModule { }
