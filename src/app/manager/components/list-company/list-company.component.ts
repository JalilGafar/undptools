import { Component, OnInit } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Company } from '../../../core/model/company';
import { ManagerService } from '../../manager.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-list-company',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './list-company.component.html',
  styleUrl: './list-company.component.scss'
})
export class ListCompanyComponent implements OnInit {

  
  companies$!: Observable<Company[]>;
  userId!: number;

  constructor(
    private ManagerServices: ManagerService,
    private route: ActivatedRoute,
    private appRout: Router
  ){}
  
  ngOnInit(): void {

    this.route.params.pipe(
      tap(params   => this.userId =  params['id'])
    ).subscribe();

    if (this.userId == 999999) {
      this.ManagerServices.getCompanyFromServer();
    } else {
      this.ManagerServices.getCompanyFromConsultantId(this.userId)
    }

    this.companies$ = this.ManagerServices.company$;
    
  }

  NewCompany(){
    this.appRout.navigateByUrl('manager/newCompany');
  }
}
