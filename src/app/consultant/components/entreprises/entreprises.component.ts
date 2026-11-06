import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ConsultantService } from '../../consultant.service';
import { Company } from '../../../core/model/company';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../../_services/storage.service';
import { WaveService } from '../../../shared/wave.service';
import { LivrableReviewService, overallState } from '../../../shared/livrable-review.service';
import { AvatarPipe, CompanyLogoPipe, DEFAULT_COMPANY_LOGO } from '../../../core/company-logo.pipe';
import { LoadingComponent, LoadErrorComponent } from '../../../shared/components/loading/loading.component';
import { LoadState } from '../../../core/load-state';

@Component({
  selector: 'app-entreprises',
  standalone: true,
  imports: [
    LoadingComponent,
    LoadErrorComponent,
    RouterLink,
    CommonModule,
    CompanyLogoPipe,
    AvatarPipe,
  ],
  templateUrl: './entreprises.component.html',
  styleUrl: './entreprises.component.scss'
})
export class EntreprisesComponent implements OnInit {

  companies$!: Observable<Company[]>;
  currentUser: any;

  /** Nombre d'outils déjà remplis par entreprise (clé = id entreprise) ; vide tant que non chargé ou en cas d'erreur */
  companyState$!: Observable<LoadState>;

  /** Évaluations reçues par entreprise : nombre de livrables validés / à améliorer, et nouveautés non consultées */
  reviews$: Observable<Record<number, { valide: number; aAmeliorer: number; nouveau: number }>> = of({});
  livrables$: Observable<Record<number, number>> = of({});

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
    private reviewService: LivrableReviewService,
    private router: Router,
    readonly wave: WaveService
  ) { }




  ngOnInit(): void {

    this.currentUser = this.storageService.getUser();
    this.ConsultantServices.getCompanyForConslFromServer(this.currentUser.id);

    this.companies$ = this.ConsultantServices.company$;
    this.reviews$ = this.reviewService.summary().pipe(
      map(items => {
        const byCompany: Record<number, { valide: number; aAmeliorer: number; nouveau: number }> = {};
        items.forEach(i => {
          const c = byCompany[i.comp_id] ??= { valide: 0, aAmeliorer: 0, nouveau: 0 };
          // Un livrable est « validé » quand les deux instances ont validé, « à améliorer » dès qu'une le demande
          const state = overallState(i);
          if (state === 'valide') c.valide++;
          if (state === 'ameliorer') c.aAmeliorer++;
          if (i.unseen) c.nouveau++;
        });
        return byCompany;
      }),
      shareReplay(1)
    );
    this.companyState$ = this.ConsultantServices.companyState$;
    this.livrables$ = this.ConsultantServices.fetchLivrablesSummary().pipe(
      map(res => Object.fromEntries(Object.entries(res.companies).map(([id, tools]) => [id, tools.length]))),
      catchError(() => of({} as Record<number, number>)),
      shareReplay(1)   // une seule requête, même si le gabarit s'abonne plusieurs fois
    );
    this.convertJson();

    this.storageService.setIdConsultant(this.currentUser.id);

  }

  //////CONVERT ARRAY TO MYSQL JSON DATA
  convertJson() {
    this.converted = this.ConsultantServices.transformToMysqlJsonString(this.rawData);
    // console.log(this.converted);
  }

  totalNouveau(reviews: Record<number, { nouveau: number }>): number {
    return Object.values(reviews).reduce((a, r) => a + r.nouveau, 0);
  }

  total(counts: Record<number, number>): number {
    return Object.values(counts).reduce((a, b) => a + b, 0);
  }

  withLivrables(counts: Record<number, number>): number {
    return Object.values(counts).filter(n => n > 0).length;
  }

  companySelect(id: number) {
    this.router.navigateByUrl('/consultant/dashbord/' + id);
  }

  onLogoError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.onerror = null;
    img.src = DEFAULT_COMPANY_LOGO;
  }

  goBack(): void {
    history.back();
  }

}


