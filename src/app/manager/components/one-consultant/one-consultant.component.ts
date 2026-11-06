import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, switchMap, tap } from 'rxjs';
import { ManagerService } from '../../manager.service';
import { Company } from '../../../core/model/company';
import { CommonModule } from '@angular/common';
import { LoadingComponent, LoadErrorComponent } from '../../../shared/components/loading/loading.component';
import { LoadState } from '../../../core/load-state';

@Component({
  selector: 'app-one-consultant',
  standalone: true,
  imports: [
    LoadingComponent,
    LoadErrorComponent,
    CommonModule
  ],
  templateUrl: './one-consultant.component.html',
  styleUrl: './one-consultant.component.scss'
})
export class OneConsultantComponent implements OnInit {

  companies$!: Observable<Company[]>;
  state$!: Observable<LoadState>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private ManagerServices: ManagerService,
  ) { }

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(async (params) => this.ManagerServices.getCompanyFromConsultantId(+params['id'])),
    ).subscribe();

    this.companies$ = this.ManagerServices.company$;
    this.state$ = this.ManagerServices.companyState$;
  }

  goBack(): void {
    history.back();
  }

}
