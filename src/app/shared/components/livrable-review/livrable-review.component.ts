import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../../_services/storage.service';
import {
  INSTANCE_ARTICLE, INSTANCE_LABEL, LivrableReview, LivrableReviewService, ReviewInstance, ReviewStatus
} from '../../livrable-review.service';

interface Seal { instance: ReviewInstance; review: LivrableReview | null; }

/**
 * Évaluation d'un livrable, à placer en bas de la page d'un outil : <app-livrable-review toolCode="t1d" />.
 *  - Deux instances évaluent : le Bureau Pays (administrateur) et le RBLAC (évaluateur). Chacune pose une mention « Validé » ou
 *    « À améliorer » ; la plus récente de ses membres fait foi. Le modérateur commente seulement.
 *  - Chacun voit, en tête, la mention de chaque instance (consultant compris), puis tous les avis avec leur instance.
 *  - Le consultant auteur du livrable est en lecture seule ; il ne voit rien tant qu'aucun avis n'existe.
 * Le livrable évalué est celui de l'entreprise et du consultant courants (StorageService).
 */
@Component({
  selector: 'app-livrable-review',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './livrable-review.component.html',
  styleUrl: './livrable-review.component.scss'
})
export class LivrableReviewComponent implements OnInit {

  @Input({ required: true }) toolCode!: string;
  /** Pour 1B : id de la minute évaluée (chaque minute est un livrable) ; ignoré pour les autres outils */
  @Input() itemId = 0;

  reviews: LivrableReview[] = [];
  /** Peut commenter (équipe de supervision) */
  canReview = false;
  /** Peut poser une mention (administrateur pour le Bureau Pays, évaluateur pour le RBLAC) */
  canEvaluate = false;
  /** Instance au nom de laquelle l'utilisateur connecté évalue */
  myInstance: ReviewInstance | null = null;
  loaded = false;
  loadError = false;

  // Formulaire (avis de l'utilisateur connecté)
  status: ReviewStatus | null = null;
  comment = '';
  editing = false;
  saving = false;
  formError = '';
  confirmDeleteId: number | null = null;

  readonly maxComment = 2000;

  private compId = 0;
  private consId = 0;

  constructor(private reviewService: LivrableReviewService, private storage: StorageService) { }

  ngOnInit(): void {
    const userId = this.storage.getUser()?.id ?? 0;
    this.compId = this.storage.CompanyId;
    this.consId = this.storage.ConsultantId || userId;
    if (!this.compId || !this.consId) { this.loaded = true; return; }
    this.refresh();
  }

  get mine(): LivrableReview | undefined {
    return this.reviews.find(r => r.mine);
  }

  get others(): LivrableReview[] {
    return this.reviews.filter(r => !r.mine);
  }

  /** Mention de chaque instance : l'avis le plus récent qui porte une mention (les avis arrivent du plus récent au plus ancien) */
  get seals(): Seal[] {
    return (['bureau_pays', 'rblac'] as ReviewInstance[]).map(instance => ({
      instance,
      review: this.reviews.find(r => r.instance === instance && r.status) ?? null
    }));
  }

  instanceLabel(i: ReviewInstance): string { return INSTANCE_LABEL[i]; }
  instanceArticle(i: ReviewInstance): string { return INSTANCE_ARTICLE[i]; }

  statusLabel(s: ReviewStatus): string {
    return s === 'valide' ? 'Validé' : 'À améliorer';
  }

  /** Qui parle : l'instance pour les avis du Bureau Pays et du RBLAC, sinon le rôle de l'auteur */
  authorityOf(r: LivrableReview): string {
    if (r.instance) return INSTANCE_LABEL[r.instance];
    return r.reviewer_role === 'moderator' ? 'Modérateur' : r.reviewer_role === 'admin' ? 'Bureau Pays' : r.reviewer_role === 'evaluateur' ? 'RBLAC' : 'Équipe de supervision';
  }

  private refresh(): void {
    this.reviewService.list(this.compId, this.consId, this.toolCode, this.itemId).subscribe({
      next: res => {
        this.reviews = res.reviews;
        this.canReview = res.canReview;
        this.canEvaluate = res.canEvaluate;
        this.myInstance = res.instance;
        this.loaded = true;
        this.loadError = false;
      },
      error: () => { this.loaded = true; this.loadError = true; }
    });
  }

  startEdit(): void {
    const m = this.mine;
    this.status = m?.status ?? null;
    this.comment = m?.comment ?? '';
    this.formError = '';
    this.editing = true;
  }

  cancelEdit(): void {
    this.editing = false;
    this.formError = '';
  }

  /** Toucher la mention choisie l'efface : l'avis devient un simple commentaire */
  pick(status: ReviewStatus): void {
    this.status = this.status === status ? null : status;
  }

  save(): void {
    const comment = this.comment.trim();
    if (!this.status && !comment) {
      this.formError = this.canEvaluate ? 'Choisissez une mention ou écrivez un commentaire.' : 'Écrivez votre commentaire.';
      return;
    }
    if (this.status === 'a_ameliorer' && !comment) {
      this.formError = "Indiquez au consultant ce qu'il faut améliorer.";
      return;
    }
    this.saving = true;
    this.formError = '';
    this.reviewService.save(this.compId, this.consId, this.toolCode, this.itemId, this.canEvaluate ? this.status : null, comment).subscribe({
      next: () => { this.saving = false; this.editing = false; this.refresh(); },
      error: err => {
        this.saving = false;
        this.formError = err?.error?.message ?? 'Enregistrement impossible. Réessayez.';
      }
    });
  }

  askDelete(id: number): void { this.confirmDeleteId = id; }
  cancelDelete(): void { this.confirmDeleteId = null; }

  confirmDelete(): void {
    if (this.confirmDeleteId === null) return;
    const id = this.confirmDeleteId;
    this.reviewService.remove(id).subscribe({
      next: () => { this.confirmDeleteId = null; this.editing = false; this.refresh(); },
      error: err => { this.confirmDeleteId = null; this.formError = err?.error?.message ?? 'Suppression impossible. Réessayez.'; }
    });
  }
}
