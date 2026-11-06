import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ManagerService } from '../../manager.service';
import { livrableUrl } from '../../livrable-types';
import { StorageService } from '../../../_services/storage.service';
import { Company } from '../../../core/model/company';
import { LivrableGlobal } from '../../../core/model/livrable-global';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { LoadState } from '../../../core/load-state';
import { LivrableReviewService, ReviewSummary, reviewKey, lookupReview } from '../../../shared/livrable-review.service';
import { ReviewBadgeComponent } from '../../../shared/components/review-badge/review-badge.component';

@Component({
  selector: 'app-company-livrables',
  standalone: true,
  imports: [ReviewBadgeComponent, CommonModule, LoadingComponent],
  templateUrl: './company-livrables.component.html',
  styleUrl: './company-livrables.component.scss',
})
export class CompanyLivrablesComponent implements OnInit, OnDestroy {
  private reviewService = inject(LivrableReviewService);
  /** Mention la plus récente de chaque livrable évalué ; chargée sans bloquer la page */
  reviews = new Map<string, ReviewSummary>();

  review(compId: number, consId: number, toolCode: string, itemId: number): ReviewSummary | undefined {
    return lookupReview(this.reviews, compId, consId, toolCode, itemId);
  }


  companyId!: number;
  company$!: Observable<Company | null>;
  companyState$!: Observable<LoadState>;
  livrables: LivrableGlobal[] = [];
  isLoading = true;
  loadError = false;

  constructor(
    private managerService: ManagerService,
    private storageService: StorageService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.companyId = Number(this.route.snapshot.paramMap.get('id'));
    this.reviewService.summary().subscribe(map => this.reviews = map);

    this.managerService.clearSelectedCompany();
    this.managerService.getCompanyDetailById(this.companyId);
    this.company$ = this.managerService.selectedCompany$;
    this.companyState$ = this.managerService.selectedCompanyState$;

    this.managerService.fetchCompanyLivrables(this.companyId).subscribe({
      next: livrables => {
        this.livrables = livrables;
        this.isLoading = false;
      },
      error: () => {
        this.loadError = true;
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.managerService.clearSelectedCompany();
  }

  trackLivrable(item: LivrableGlobal): string {
    return item.tool_code + '-' + item.id_livrable;
  }

  viewLivrable(item: LivrableGlobal): void {
    this.storageService.setIdComp(item.comp_id);
    this.storageService.setIdConsultant(item.cons_id);
    this.router.navigateByUrl(livrableUrl(item.tool_code, item.id_livrable));
  }

  goBack(): void {
    history.back();
  }
}
