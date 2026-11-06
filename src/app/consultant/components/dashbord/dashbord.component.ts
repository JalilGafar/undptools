import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, forkJoin, of, switchMap } from 'rxjs';
import { ConsultantService } from '../../consultant.service';
import { StorageService } from '../../../_services/storage.service';
import { Company } from '../../../core/model/company';
import { CompanyLogoPipe, DEFAULT_COMPANY_LOGO } from '../../../core/company-logo.pipe';
import { TOOL_GROUPS, ToolStatus } from '../../../shared/tools.catalog';
import { LivrableReviewService, ReviewSummary, overallState, reviewKey } from '../../../shared/livrable-review.service';
import { ReviewBadgeComponent } from '../../../shared/components/review-badge/review-badge.component';
import { LoadingComponent, LoadErrorComponent } from '../../../shared/components/loading/loading.component';

type Filter = 'amelio' | 'nouveau' | null;

/** Mentions reçues par un livrable (un outil, ou une minute de réunion) */
interface Mentions {
  /** 1 si le livrable est validé par les deux instances (Bureau Pays et RBLAC), sinon 0 */
  valide: number;
  /** 1 si au moins une instance demande des améliorations, sinon 0 */
  ameliorer: number;
  unseen: boolean;
  /** Au moins un avis (mention ou commentaire) */
  has: boolean;
  review?: ReviewSummary;
}

interface MinuteRow extends Mentions { id: number; date: string; }

interface ToolRow extends Mentions {
  code: string;            // « 1D »
  name: string;            // « Diagnostic intégral »
  route: string;
  status: ToolStatus;
  filled: boolean;
  updatedAt: string | null;
  /** 1B / 2B : une ligne par minute de l'étape (chaque minute est un livrable) */
  minutes: MinuteRow[] | null;
  etape: number | null;
}

interface GroupView {
  label: string;
  icon: string;
  rows: ToolRow[];
  open: boolean;
  /** Part des outils actifs de l'étape déjà remplis (0-100), null s'il n'y a aucun outil actif */
  progress: number | null;
}

interface FeedbackItem extends Mentions {
  label: string;
  route: string;
  minuteId: number | null;
}

/**
 * Tableau de bord d'une entreprise vue par son consultant : où il en est (outils remplis, minutes),
 * les retours des managers, et la prochaine action à mener.
 */
@Component({
  selector: 'app-dashbord',
  standalone: true,
  imports: [CommonModule, RouterLink, CompanyLogoPipe, ReviewBadgeComponent, LoadingComponent, LoadErrorComponent],
  templateUrl: './dashbord.component.html',
  styleUrl: './dashbord.component.scss'
})
export class DashbordComponent implements OnInit {

  private destroyRef = inject(DestroyRef);

  company: Company | null = null;
  isLoading = true;
  loadError = false;

  groups: GroupView[] = [];
  feedback: FeedbackItem[] = [];
  next: ToolRow | null = null;

  totalLivrables = 0;
  nbAmeliorer = 0;
  nbNouveau = 0;

  filter: Filter = null;

  private userId = 0;

  constructor(
    private consultantService: ConsultantService,
    private reviewService: LivrableReviewService,
    private storageService: StorageService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.userId = this.storageService.getUser()?.id ?? 0;

    this.route.params.pipe(
      switchMap(params => {
        const id = +params['id'];
        this.isLoading = true;
        this.loadError = false;
        return forkJoin({
          company: this.consultantService.fetchCompany(id),
          dashboard: this.consultantService.fetchDashboard(id),
          // Les pastilles ne doivent jamais bloquer la page : en cas d'échec, aucune mention
          reviews: this.reviewService.summary().pipe(catchError(() => of(new Map<string, ReviewSummary>()))),
        }).pipe(catchError(() => { this.loadError = true; this.isLoading = false; return of(null); }));
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(data => {
      if (!data) return;
      this.company = data.company;
      this.storageService.setIdComp(data.company.id);
      // Vague clôturée : l'entreprise (et tous ses outils) passe en lecture seule pour le consultant
      this.storageService.setCompanyLocked(data.company.vague_statut === 'cloturee' ? (data.company.vague_nom ?? 'La vague') : null);
      this.storageService.setIdConsultant(this.userId);
      this.build(data.dashboard, data.reviews);
      this.isLoading = false;
    });
  }

  // ── Construction des données affichées ──────────────────────────────────────

  private mentions(reviews: Map<string, ReviewSummary>, tool: string, itemId = 0): Mentions {
    const r = reviews.get(reviewKey(this.company!.id, this.userId, tool, itemId));
    const state = overallState(r);
    return { valide: state === 'valide' ? 1 : 0, ameliorer: state === 'ameliorer' ? 1 : 0, unseen: !!r?.unseen, has: !!r && (r.nb_comments > 0 || state !== 'none'), review: r };
  }

  private build(
    dash: { tools: Record<string, { updated_at: string }>; minutes: { id: number; etape: number; date_reunion: string; updated_at: string }[] },
    reviews: Map<string, ReviewSummary>
  ): void {
    const feedback: FeedbackItem[] = [];
    let total = dash.minutes.length;    // chaque minute de réunion est un livrable

    this.groups = TOOL_GROUPS.map((g, index) => {
      const etape = index === 0 ? null : index;      // 0 = pré-diagnostic, puis étapes 1 à 4
      const rows: ToolRow[] = g.children.map(t => {
        // Les outils transversaux (minute de réunion) n'ont pas de code : leur libellé est le même à chaque étape
        const [code, ...rest] = t.label.split(' ');
        const plain = index === 0 || t.route === 't1b' || t.route.startsWith('tqw');
        const base = { code: plain ? '' : code, name: plain ? t.label : rest.join(' '), route: t.route, status: t.status, etape };
        if (t.route === 't1b') {
          const minutes: MinuteRow[] = dash.minutes
            .filter(m => m.etape === etape)
            .map(m => ({ id: m.id, date: m.date_reunion, ...this.mentions(reviews, 't1b', m.id) }));
          return {
            ...base, filled: minutes.length > 0, updatedAt: null, minutes,
            valide: minutes.reduce((n, m) => n + m.valide, 0),
            ameliorer: minutes.reduce((n, m) => n + m.ameliorer, 0),
            unseen: minutes.some(m => m.unseen),
            has: minutes.some(m => m.has)
          };
        }
        const info = dash.tools[t.route];
        if (info && t.status === 'active') total++;
        return { ...base, filled: !!info, updatedAt: info?.updated_at ?? null, minutes: null, ...this.mentions(reviews, t.route) };
      });

      // Retours des managers : un élément par livrable évalué (outil, ou minute)
      rows.forEach(r => {
        if (r.minutes) {
          r.minutes.filter(m => m.has).forEach(m => feedback.push({
            label: `${r.code} Minutes du ${this.fmtDate(m.date)}`, route: r.route, minuteId: m.id,
            valide: m.valide, ameliorer: m.ameliorer, unseen: m.unseen, has: true, review: m.review
          }));
        } else if (r.has) {
          feedback.push({ label: `${r.code} ${r.name}`.trim(), route: r.route, minuteId: null, valide: r.valide, ameliorer: r.ameliorer, unseen: r.unseen, has: true, review: r.review });
        }
      });

      const active = rows.filter(r => r.status === 'active');
      return {
        label: g.label, icon: g.icon, rows, open: active.length > 0,
        progress: active.length ? Math.round(active.filter(r => r.filled).length / active.length * 100) : null
      };
    });

    // Les nouveautés d'abord, puis ce qui est à améliorer
    this.feedback = feedback.sort((a, b) => Number(b.unseen) - Number(a.unseen) || Number(b.ameliorer > 0) - Number(a.ameliorer > 0));
    this.totalLivrables = total;
    this.nbAmeliorer = feedback.filter(f => f.ameliorer > 0).length;
    this.nbNouveau = feedback.filter(f => f.unseen).length;
    this.next = this.groups.flatMap(g => g.rows).find(r => r.status === 'active' && !r.filled) ?? null;
  }

  /** Vague clôturée : l'entreprise se consulte, on n'y saisit plus */
  get locked(): boolean { return this.company?.vague_statut === 'cloturee'; }

  // ── Filtres (tuiles) ────────────────────────────────────────────────────────

  setFilter(f: Exclude<Filter, null>): void {
    this.filter = this.filter === f ? null : f;
    // Sous un filtre, les étapes qui contiennent des résultats s'ouvrent
    if (this.filter) this.groups.forEach(g => g.open = true);
  }

  private matches(m: Mentions): boolean {
    return this.filter === 'amelio' ? m.ameliorer > 0 : this.filter === 'nouveau' ? m.unseen : true;
  }

  rowVisible(r: ToolRow): boolean {
    if (!this.filter) return true;
    return r.minutes ? r.minutes.some(m => this.matches(m)) : this.matches(r);
  }

  minuteVisible(m: MinuteRow): boolean {
    return this.matches(m);
  }

  groupVisible(g: GroupView): boolean {
    return !this.filter || g.rows.some(r => this.rowVisible(r));
  }

  feedbackVisible(f: FeedbackItem): boolean {
    return this.matches(f);
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  open(route: string, queryParams?: Record<string, string | number>): void {
    this.router.navigate(['/consultant/tool', route], { queryParams });
  }

  openMinute(minuteId: number): void {
    this.open('t1b', { minute: minuteId });
  }

  newMinute(etape: number): void {
    this.open('t1b', { new: 1, etape });
  }

  openFeedback(f: FeedbackItem): void {
    f.minuteId ? this.openMinute(f.minuteId) : this.open(f.route);
  }

  openNext(): void {
    const r = this.next;
    if (!r) return;
    r.minutes ? this.newMinute(r.etape ?? 1) : this.open(r.route);
  }

  toggle(g: GroupView): void {
    g.open = !g.open;
  }

  fmtDate(iso: string): string {
    const [y, m, d] = iso.slice(0, 10).split('-');
    return `${d}/${m}/${y}`;
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
