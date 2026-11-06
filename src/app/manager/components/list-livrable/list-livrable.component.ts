import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Livrable } from '../../../core/model/livrable';
import { ActivatedRoute, Router } from '@angular/router';
import { ManagerService } from '../../manager.service';
import { livrableUrl } from '../../livrable-types';
import { StorageService } from '../../../_services/storage.service';
import { User } from '../../../core/model/user';
import { LoadingComponent, LoadErrorComponent } from '../../../shared/components/loading/loading.component';
import { LoadState } from '../../../core/load-state';
import { LivrableReviewService, ReviewSummary, reviewKey, lookupReview } from '../../../shared/livrable-review.service';
import { ReviewBadgeComponent } from '../../../shared/components/review-badge/review-badge.component';

@Component({
  selector: 'app-list-livrable',
  standalone: true,
  imports: [
    ReviewBadgeComponent, CommonModule,
    LoadingComponent,
  ],
  templateUrl: './list-livrable.component.html',
  styleUrl: './list-livrable.component.scss',
})
export class ListLivrableComponent implements OnInit {
  private reviewService = inject(LivrableReviewService);
  /** Mention la plus récente de chaque livrable évalué ; chargée sans bloquer la page */
  reviews = new Map<string, ReviewSummary>();

  review(compId: number, consId: number, toolCode: string, itemId: number): ReviewSummary | undefined {
    return lookupReview(this.reviews, compId, consId, toolCode, itemId);
  }


  livrables: Livrable[] = [];
  isLoading = true;
  loadError = false;
  userId!: number;
  userState$!: Observable<LoadState>;
  user$!: Observable<User>;

  constructor(
    private ManagerServices: ManagerService,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    this.reviewService.summary().subscribe(map => this.reviews = map);

    // Le nom du consultant vient de la liste des utilisateurs : on la charge ici
    // pour que la page fonctionne aussi après une actualisation ou depuis un lien direct.
    this.ManagerServices.getUserFromServer();
    this.user$ = this.ManagerServices.getUserById(this.userId);
    this.userState$ = this.ManagerServices.personaState$;

    this.ManagerServices.fetchLivrables(this.userId).subscribe({
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

  trackLivrable(item: Livrable): string {
    return item.tool_code + '-' + item.id_livrable;
  }

  viewLivrable(idComp: number, tool: string, itemId: number) {
    this.storageService.setIdComp(idComp);
    this.storageService.setIdConsultant(this.userId);
    this.router.navigateByUrl(livrableUrl(tool, itemId));
  }

  goBack(): void {
    history.back();
  }

}
