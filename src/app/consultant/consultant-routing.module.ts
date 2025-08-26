import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EntreprisesComponent } from './components/entreprises/entreprises.component';
import { DashbordComponent } from './components/dashbord/dashbord.component';
import { DocumentaionComponent } from './components/documentaion/documentaion.component';

const routes: Routes = [
  {path: '', component: EntreprisesComponent},
  {path: 'dashbord', component: DashbordComponent},
  {path: 'documentation', component: DocumentaionComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConsultantRoutingModule { }
