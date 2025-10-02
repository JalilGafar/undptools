import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ConsultantService } from '../../consultant.service';
import { Company } from '../../../core/model/company';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../../_services/storage.service';
import { AddCompanyComponent } from '../add-company/add-company.component';

@Component({
  selector: 'app-entreprises',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    AddCompanyComponent
  ],
  templateUrl: './entreprises.component.html',
  styleUrl: './entreprises.component.scss'
})
export class EntreprisesComponent implements OnInit {

  companies$!: Observable<Company[]>;
  currentUser: any;

  constructor(
     private ConsultantServices: ConsultantService,
     private storageService: StorageService,
     private router : Router
  ){}

  ngOnInit(): void {

    this.currentUser = this.storageService.getUser();
   this.ConsultantServices.getCompanyForConslFromServer(this.currentUser.id);

   this.companies$ = this.ConsultantServices.company$;

   
  }

  companySelect(id:number){
      this.router.navigateByUrl('/consultant/dashbord/'+id);
  }

}


