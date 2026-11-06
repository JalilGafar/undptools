import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest, map, Observable } from 'rxjs';
import { ManagerService } from '../../manager.service';
import { livrableUrl } from '../../livrable-types';
import { StorageService } from '../../../_services/storage.service';
import { User } from '../../../core/model/user';
import { Company } from '../../../core/model/company';
import { Livrable } from '../../../core/model/livrable';
import { AvatarPipe, CompanyLogoPipe } from '../../../core/company-logo.pipe';
import { LoadingComponent, LoadErrorComponent } from '../../../shared/components/loading/loading.component';
import { LoadState } from '../../../core/load-state';
import { LivrableReviewService, ReviewSummary, reviewKey, lookupReview } from '../../../shared/livrable-review.service';
import { ReviewBadgeComponent } from '../../../shared/components/review-badge/review-badge.component';

@Component({
  selector: 'app-consultant-profile',
  standalone: true,
  imports: [ReviewBadgeComponent, LoadingComponent, LoadErrorComponent, CommonModule, RouterLink, CompanyLogoPipe, AvatarPipe],
  templateUrl: './consultant-profile.component.html',
  styleUrl: './consultant-profile.component.scss'
})
export class ConsultantProfileComponent implements OnInit {
  private reviewService = inject(LivrableReviewService);
  /** Mention la plus récente de chaque livrable évalué ; chargée sans bloquer la page */
  reviews = new Map<string, ReviewSummary>();

  review(compId: number, consId: number, toolCode: string, itemId: number): ReviewSummary | undefined {
    return lookupReview(this.reviews, compId, consId, toolCode, itemId);
  }


  consultantId!: number;
  isAdmin = false;

  state$!: Observable<LoadState>;
  user$!: Observable<User>;
  companies$!: Observable<Company[]>;
  livrables$!: Observable<Livrable[]>;
  companiesCount$!: Observable<number>;
  livrableCount$!: Observable<number>;

  constructor(
    private managerService: ManagerService,
    private storageService: StorageService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const roles = this.storageService.getUser()?.roles ?? [];
    this.isAdmin = roles.includes('ROLE_ADMIN');

    this.consultantId = +this.route.snapshot.paramMap.get('id')!;
    this.reviewService.summary().subscribe(map => this.reviews = map);

    this.managerService.getUserFromServer();
    this.user$ = this.managerService.persona$.pipe(
      map(users => users.find(u => u.id === this.consultantId)!)
    );

    this.managerService.getCompanyFromConsultantId(this.consultantId);
    this.companies$ = this.managerService.company$;
    this.companiesCount$ = this.companies$.pipe(map(list => list.length));

    this.managerService.clearLivrables();
    this.managerService.getLivrableFromUserId(this.consultantId);
    this.livrables$ = this.managerService.livrable$;
    this.livrableCount$ = this.livrables$.pipe(map(list => list.length));

    // La page s'affiche quand le profil, les entreprises et les livrables sont tous arrivés
    this.state$ = combineLatest([
      this.managerService.personaState$,
      this.managerService.companyState$,
      this.managerService.livrablesState$,
    ]).pipe(map(states => ({ loading: states.some(s => s.loading), error: states.some(s => s.error) })));
  }

  viewLivrable(idComp: number, tool: string, itemId: number): void {
    this.storageService.setIdComp(idComp);
    this.storageService.setIdConsultant(this.consultantId);
    this.router.navigateByUrl(livrableUrl(tool, itemId));
  }
}
