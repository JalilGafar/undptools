import { Component, Input } from '@angular/core';
import { INSTANCE_LABEL, ReviewInstance, ReviewStatus, ReviewSummary } from '../../livrable-review.service';

interface Mark { instance: ReviewInstance; status: ReviewStatus; }

/**
 * Mentions d'un livrable, avec l'instance qui les a posées : « Validé · Bureau Pays », « À améliorer · RBLAC ».
 * Chacun (consultant, manager) voit ainsi d'où vient une validation. Un livrable seulement commenté affiche « n commentaire(s) » ;
 * un point « Nouveau » signale une évaluation que le consultant n'a pas encore ouverte. Rien ne s'affiche sans avis.
 */
@Component({
  selector: 'app-review-badge',
  standalone: true,
  template: `
    @if (review) {
      @for (m of marks; track m.instance) {
        <span class="rb" [class.ok]="m.status === 'valide'" [class.warn]="m.status === 'a_ameliorer'">
          <i class="bi" [class.bi-check-circle-fill]="m.status === 'valide'" [class.bi-exclamation-circle-fill]="m.status === 'a_ameliorer'"></i>
          {{ m.status === 'valide' ? 'Validé' : 'À améliorer' }}<span class="rb-by"> · {{ label(m.instance) }}</span>
        </span>
      }
      @if (pending && marks.length === 1) {
        <span class="rb wait"><i class="bi bi-hourglass-split"></i> {{ label(marks[0].instance === 'bureau_pays' ? 'rblac' : 'bureau_pays') }} : en attente</span>
      }
      @if (!marks.length && review.nb_comments) {
        <span class="rb note"><i class="bi bi-chat-left-text"></i> {{ review.nb_comments }} commentaire{{ review.nb_comments > 1 ? 's' : '' }}</span>
      }
      @if (review.unseen && (marks.length || review.nb_comments)) { <span class="rb-new" aria-label="Nouvelle évaluation">Nouveau</span> }
    }
  `,
  styles: [`
    :host { display: inline-flex; flex-wrap: wrap; align-items: center; gap: .3rem; }
    .rb { display: inline-flex; align-items: center; gap: .3rem; padding: .15rem .6rem; border-radius: 999px;
          font-size: .75rem; font-weight: 700; white-space: nowrap; }
    .rb.ok   { color: #0f9d58; background: #e6f6ee; }
    .rb.warn { color: #d97706; background: #fdf1de; }
    .rb.note { color: #475569; background: #eef2f7; font-weight: 600; }
    .rb.wait { color: #0e7490; background: #e0f2f7; font-weight: 600; }
    .rb-by   { font-weight: 600; opacity: .85; }
    .rb-new  { padding: 0 .4rem; border-radius: 999px; background: #dc3545; color: #fff; font-size: .65rem; font-weight: 700; }
  `]
})
export class ReviewBadgeComponent {
  /** Résumé des avis du livrable (voir LivrableReviewService.summary) ; absent = pas d'avis */
  @Input() review: ReviewSummary | null | undefined;
  /** Signale l'instance qui n'a pas encore évalué quand l'autre a déjà posé sa mention */
  @Input() pending = false;

  /** Mentions posées, Bureau Pays d'abord */
  get marks(): Mark[] {
    const r = this.review;
    if (!r) return [];
    const out: Mark[] = [];
    if (r.bp_status) out.push({ instance: 'bureau_pays', status: r.bp_status });
    if (r.rblac_status) out.push({ instance: 'rblac', status: r.rblac_status });
    return out;
  }

  label(i: ReviewInstance): string { return INSTANCE_LABEL[i]; }
}
