import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EntreprisesComponent } from './components/entreprises/entreprises.component';
import { DashbordComponent } from './components/dashbord/dashbord.component';
import { DocumentaionComponent } from './components/documentaion/documentaion.component';
import { T1aComponent } from './components/tools/t1a/t1a.component';
import { T1bComponent } from './components/tools/t1b/t1b.component';
import { T1cComponent } from './components/tools/t1c/t1c.component';
import { T1dComponent } from './components/tools/t1d/t1d.component';
import { T1eaComponent } from './components/tools/t1ea/t1ea.component';
import { T1ebComponent } from './components/tools/t1eb/t1eb.component';
import { T1fComponent } from './components/tools/t1f/t1f.component';
import { T1gComponent } from './components/tools/t1g/t1g.component';
import { T1hComponent } from './components/tools/t1h/t1h.component';
import { T1iComponent } from './components/tools/t1i/t1i.component';
import { T1lComponent } from './components/tools/t1l/t1l.component';
import { InmotionComponent } from './components/tools/inmotion/inmotion.component';
import { EvaluationComponent } from './components/tools/evaluation/evaluation.component';
import { AttributComponent } from './components/tools/attribut/attribut.component';
import { T2aComponent } from './components/tools/t2a/t2a.component';
import { T2bComponent } from './components/tools/t2b/t2b.component';
import { T2cComponent } from './components/tools/t2c/t2c.component';
import { T2dComponent } from './components/tools/t2d/t2d.component';
import { T2eComponent } from './components/tools/t2e/t2e.component';
import { T2fComponent } from './components/tools/t2f/t2f.component';
import { T2gComponent } from './components/tools/t2g/t2g.component';
import { ConsulHomeComponent } from './components/consul-home/consul-home.component';
import { AddCompanyComponent } from './components/add-company/add-company.component';

const routes: Routes = [
  {path: '', component: ConsulHomeComponent},
  {path: 'companies', component: EntreprisesComponent},
  {path: 'newcompany', component: AddCompanyComponent},
  {path: 'dashbord/:id', component: DashbordComponent},
  {path: 'documentation', component: DocumentaionComponent},
  
  {path: 'tool/inmotion', component: InmotionComponent},
  {path: 'tool/evaluation', component: EvaluationComponent},
  {path: 'tool/attribut', component: AttributComponent},

  {path: 'tool/t1a', component: T1aComponent},
  {path: 'tool/t1b', component: T1bComponent},
  {path: 'tool/t1c', component: T1cComponent},
  {path: 'tool/t1d', component: T1dComponent},
  {path: 'tool/t1ea', component: T1eaComponent},
  {path: 'tool/t1eb', component: T1ebComponent},
  {path: 'tool/t1f', component: T1fComponent},
  {path: 'tool/t1g', component: T1gComponent},
  {path: 'tool/t1h', component: T1hComponent},
  {path: 'tool/t1i', component: T1iComponent},
  {path: 'tool/t1l', component: T1lComponent},
  
  {path: 'tool/t2a', component: T2aComponent},
  {path: 'tool/t2b', component: T2bComponent},
  {path: 'tool/t2c', component: T2cComponent},
  {path: 'tool/t2d', component: T2dComponent},
  {path: 'tool/t2e', component: T2eComponent},
  {path: 'tool/t2f', component: T2fComponent},
  {path: 'tool/t2g', component: T2gComponent},

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConsultantRoutingModule { }
