import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeMintoulComponent } from "./components/home-mintoul/home-mintoul.component";


const routes: Routes = [
    {path: '', component: HomeMintoulComponent},
]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MintoulRoutingModule { }