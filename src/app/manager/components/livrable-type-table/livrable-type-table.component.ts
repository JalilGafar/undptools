import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ManagerService } from '../../manager.service';
import { livrableUrl } from '../../livrable-types';
import { StorageService } from '../../../_services/storage.service';
import { LivrableGlobal } from '../../../core/model/livrable-global';
import { LIVRABLE_TYPES, groupOf } from '../../livrable-types';
import { LoadingComponent, LoadErrorComponent } from '../../../shared/components/loading/loading.component';
import { LoadState } from '../../../core/load-state';
import { LivrableReviewService, ReviewSummary, reviewKey, lookupReview } from '../../../shared/livrable-review.service';
import { ReviewBadgeComponent } from '../../../shared/components/review-badge/review-badge.component';

type SortableColumn = 'company' | 'consultant' | 'ville' | 'secteur' | 'date' | 'updated_at';
type SortDirection = 'asc' | 'desc';

interface ColumnDef {
  key: SortableColumn;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-livrable-type-table',
  standalone: true,
  imports: [
    ReviewBadgeComponent, LoadingComponent,
    LoadErrorComponent,
    CommonModule,
  ],
  templateUrl: './livrable-type-table.component.html',
  styleUrl: './livrable-type-table.component.scss',
})
export class LivrableTypeTableComponent implements OnInit {
  private reviewService = inject(LivrableReviewService);
  /** Mention la plus récente de chaque livrable évalué ; chargée sans bloquer la page */
  reviews = new Map<string, ReviewSummary>();

  review(compId: number, consId: number, toolCode: string, itemId: number): ReviewSummary | undefined {
    return lookupReview(this.reviews, compId, consId, toolCode, itemId);
  }


  livrables$!: Observable<LivrableGlobal[]>;
  state$!: Observable<LoadState>;
  typeLabel = '';

  readonly columns: ColumnDef[] = [
    { key: 'company',    label: 'Entreprise',                    icon: 'bi-building' },
    { key: 'consultant', label: 'Consultant',                    icon: 'bi-person-badge' },
    { key: 'ville',      label: 'Ville',                         icon: 'bi-geo-alt' },
    { key: 'secteur',    label: "Secteur d'activité",            icon: 'bi-tags' },
    { key: 'date',       label: 'Date de création',              icon: 'bi-calendar-plus' },
    { key: 'updated_at', label: 'Dernière modification',         icon: 'bi-calendar-check' },
  ];

  sortKey: SortableColumn = 'updated_at';
  sortDir: SortDirection = 'desc';

  constructor(
    private managerService: ManagerService,
    private storageService: StorageService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    const toolCode = this.route.snapshot.paramMap.get('type') ?? '';
    this.reviewService.summary().subscribe(map => this.reviews = map);
    this.typeLabel = LIVRABLE_TYPES.find(t => t.tool_code === toolCode)?.label ?? toolCode;

    this.managerService.getAllLivrables();
    this.state$ = this.managerService.allLivrablesState$;
    this.livrables$ = this.managerService.allLivrables$.pipe(
      map(livrables => livrables.filter(l => groupOf(l) === toolCode))
    );
  }

  sortBy(key: SortableColumn): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDir = 'asc';
    }
  }

  sortIcon(key: SortableColumn): string {
    if (this.sortKey !== key) return 'bi-arrow-down-up';
    return this.sortDir === 'asc' ? 'bi-sort-up' : 'bi-sort-down';
  }

  sortedData(data: LivrableGlobal[]): LivrableGlobal[] {
    const dir = this.sortDir === 'asc' ? 1 : -1;
    const key = this.sortKey;
    return [...data].sort((a, b) => {
      const va = (a[key] ?? '').toString().toLowerCase();
      const vb = (b[key] ?? '').toString().toLowerCase();
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
  }

  initials(name: string): string {
    return (name ?? '').trim().charAt(0).toUpperCase() || '?';
  }

  viewLivrable(item: LivrableGlobal) {
    this.storageService.setIdComp(item.comp_id);
    this.storageService.setIdConsultant(item.cons_id);
    this.router.navigateByUrl(livrableUrl(item.tool_code, item.id_livrable));
  }

  goBack(): void {
    history.back();
  }
}
