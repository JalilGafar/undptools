import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ConsultantService } from '../../consultant.service';
import { Company } from '../../../core/model/company';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../../_services/storage.service';

@Component({
  selector: 'app-entreprises',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
  ],
  templateUrl: './entreprises.component.html',
  styleUrl: './entreprises.component.scss'
})
export class EntreprisesComponent implements OnInit {

  companies$!: Observable<Company[]>;
  currentUser: any;

  rawData = `[ 
{
          plage: "0",
          label: "L'entreprise n'appartient pas aux secteurs de la production, du traitement, de l'agriculture, du tourisme"
        },
        {
          plage: "5",
          label: "L'entreprise appartient aux secteurs de la production textile, de l'agro-business, du tourisme"
        }
]`;

  converted = '';

  constructor(
    private ConsultantServices: ConsultantService,
    private storageService: StorageService,
    private router: Router
  ) { }




  ngOnInit(): void {

    // this.storageService.setVisibleToolsTrue();
    this.storageService.setVisibleToolsFalse();

    this.currentUser = this.storageService.getUser();
    this.ConsultantServices.getCompanyForConslFromServer(this.currentUser.id);

    this.companies$ = this.ConsultantServices.company$;
    this.convertJson();

  }

  //////CONVERT ARRAY TO MYSQL JSON DATA
  convertJson() {
    this.converted = this.ConsultantServices.transformToMysqlJsonString(this.rawData);
    console.log(this.converted);
  }

  ngOnDestroy(): void {
    // this.storageService.setVisibleToolsFalse();
  }

  companySelect(id: number) {
    this.router.navigateByUrl('/consultant/dashbord/' + id);
  }

}


