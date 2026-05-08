import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConsultantService } from '../../consultant.service';
import { Company } from '../../../core/model/company';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-entreprises',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule
  ],
  templateUrl: './entreprises.component.html',
  styleUrl: './entreprises.component.scss'
})
export class EntreprisesComponent implements OnInit {

  companies$!: Observable<Company[]>

  constructor(
     private ConsultantServices: ConsultantService 
  ){}

  ngOnInit(): void {
   this.ConsultantServices.getCompanyFromServer();

   this.companies$ = this.ConsultantServices.comapy$;

   
  }

}


