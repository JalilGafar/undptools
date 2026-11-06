import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, tap } from 'rxjs';
import { Company } from '../../../core/model/company';
import { ManagerService } from '../../manager.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { WaveService } from '../../../shared/wave.service';
import { StorageService } from '../../../_services/storage.service';
import { CompanyLogoPipe } from '../../../core/company-logo.pipe';
import { LoadingComponent, LoadErrorComponent } from '../../../shared/components/loading/loading.component';
import { LoadState } from '../../../core/load-state';

@Component({
  selector: 'app-list-company',
  standalone: true,
  imports: [
    LoadingComponent,
    LoadErrorComponent,
    CommonModule,
    RouterLink,
    CompanyLogoPipe
  ],
  templateUrl: './list-company.component.html',
  styleUrl: './list-company.component.scss'
})
export class ListCompanyComponent implements OnInit {

  companies$!: Observable<Company[]>;
  companyState$!: Observable<LoadState>;
  livrablesState$!: Observable<LoadState>;
  userId!: number;
  isAdmin = false;
  livrableCounts = new Map<number, number>();
  private destroyRef = inject(DestroyRef);

  constructor(
    private ManagerServices: ManagerService,
    private route: ActivatedRoute,
    private appRout: Router,
    private storageService: StorageService,
    readonly wave: WaveService
  ){}
  
  ngOnInit(): void {

    const roles: string[] = this.storageService.getUser()?.roles ?? [];
    this.isAdmin = roles.includes('ROLE_ADMIN');

    this.route.params.pipe(
      tap(params   => this.userId =  params['id'])
    ).subscribe();

    if (this.userId == 999999) {
      this.ManagerServices.getCompanyFromServer();
    } else {
      this.ManagerServices.getCompanyFromConsultantId(this.userId)
    }

    this.companies$ = this.ManagerServices.company$;
    this.companyState$ = this.ManagerServices.companyState$;
    this.livrablesState$ = this.ManagerServices.allLivrablesState$;

    // Nombre réel de livrables par entreprise
    this.ManagerServices.getAllLivrables();
    this.ManagerServices.allLivrables$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(livrables => {
      const counts = new Map<number, number>();
      livrables.forEach(l => counts.set(l.comp_id, (counts.get(l.comp_id) ?? 0) + 1));
      this.livrableCounts = counts;
    });
    
  }

  NewCompany(){
    this.appRout.navigateByUrl('manager/newCompany');
  }
}
