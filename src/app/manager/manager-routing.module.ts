import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManHomeComponent } from './components/man-home/man-home.component';
import { OneConsultantComponent } from './components/one-consultant/one-consultant.component';
import { ManDashbordComponent } from './components/man-dashbord/man-dashbord.component';
import { ListConsultantComponent } from './components/list-consultant/list-consultant.component';
import { ListCompanyComponent } from './components/list-company/list-company.component';
import { NewCompanyComponent } from './components/new-company/new-company.component';
import { GlobalComponent } from './components/global/global.component';
import { ListLivrableComponent } from './components/list-livrable/list-livrable.component';
import { TooltestComponent } from './components/tooltest/tooltest.component';



const routes: Routes = [
  {path: '', component: ManHomeComponent},
  {path: 'home', component: ManHomeComponent},
  {path: 'manOneConsult/:id', component: OneConsultantComponent},
  {path: 'dashbord', component: ManDashbordComponent},
  {path: 'listconsult', component: ListConsultantComponent},
  {path: 'newCompany', component: NewCompanyComponent},
  {path: 'global', component: GlobalComponent},
  {path: 'Tooltest', component: TooltestComponent},
  {path: 'listcompany/:id', component: ListCompanyComponent},
  {path: 'listLivrable/:id', component: ListLivrableComponent},

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManagertRoutingModule { }
