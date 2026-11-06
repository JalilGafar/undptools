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
import { T1jComponent } from './components/tools/t1j/t1j.component';
import { T1kComponent } from './components/tools/t1k/t1k.component';
import { T3hComponent } from './components/tools/t3h/t3h.component';
import { T5sComponent } from './components/tools/t5s/t5s.component';
import { TqwComponent } from './components/tools/tqw/tqw.component';
import { TseComponent } from './components/tools/tse/tse.component';
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
import { EditCompanyComponent } from './components/edit-company/edit-company.component';
import { OnconstructionComponent } from '../shared/components/onconstruction/onconstruction.component';

const routes: Routes = [
  {path: '', component: ConsulHomeComponent},
  {path: 'companies', component: EntreprisesComponent},
  {path: 'newcompany', component: AddCompanyComponent},
  {path: 'edit-company/:id', component: EditCompanyComponent},
  {path: 'dashbord/:id', component: DashbordComponent},
  {path: 'documentation', component: DocumentaionComponent},
  
  {path: 'tool/inmotion', component: InmotionComponent},
  {path: 'tool/evaluation', component: EvaluationComponent},
  {path: 'tool/attribut', component: AttributComponent},

  {path: 'tool/t1a', component: OnconstructionComponent},
  {path: 'tool/t1b', component: T1bComponent},
  {path: 'tool/t1c', component: T1cComponent},
  {path: 'tool/t1d', component: T1dComponent},
  {path: 'tool/t1ea', component: T1eaComponent},
  {path: 'tool/t1g', component: T1gComponent},
  {path: 'tool/t1h', component: T1hComponent},
  {path: 'tool/t1i', component: OnconstructionComponent},
  {path: 'tool/t1j', component: T1jComponent},
  {path: 'tool/t1k', component: T1kComponent},
  {path: 'tool/t1l', component: T1lComponent},
  {path: 'tool/t3h', component: T3hComponent},
  {path: 'tool/t5s', component: T5sComponent, data: { phase: 'initial' }},
  {path: 'tool/t5sf', component: T5sComponent, data: { phase: 'final' }},
  {path: 'tool/tse', component: TseComponent, data: { phase: 'initial' }},
  {path: 'tool/tsef', component: TseComponent, data: { phase: 'final' }},
  {path: 'tool/tqw1', component: TqwComponent, data: { etape: 1 }},
  {path: 'tool/tqw2', component: TqwComponent, data: { etape: 2 }},
  {path: 'tool/tqw3', component: TqwComponent, data: { etape: 3 }},
  {path: 'tool/tqw4', component: TqwComponent, data: { etape: 4 }},
  
  {path: 'tool/t2a', component: OnconstructionComponent},
  {path: 'tool/t2b', component: OnconstructionComponent},
  {path: 'tool/t2c', component: OnconstructionComponent},
  {path: 'tool/t2d', component: T2dComponent},
  {path: 'tool/t2e', component: OnconstructionComponent},
  {path: 'tool/t2f', component: OnconstructionComponent},
  // {path: 'tool/t2g', component: T2gComponent},
  {path: 'tool/t2g', component: OnconstructionComponent},
  {path: 'tool/onbuild', component: OnconstructionComponent},

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConsultantRoutingModule { }
