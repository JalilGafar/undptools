import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ConsultantService } from '../../../consultant.service';
import { StorageService } from '../../../../_services/storage.service';
import { LivrableReviewComponent } from '../../../../shared/components/livrable-review/livrable-review.component';
import { LoadingComponent, LoadErrorComponent } from '../../../../shared/components/loading/loading.component';
import { PreviewBannerComponent } from '../../../../shared/components/preview-banner/preview-banner.component';
import { DOMAINES_QW, QuickWinsResponse, QwAction, RESPONSABLES_QW, STATUTS_QW, StatutQw } from '../../../../core/model/quickwins';
import { hasManagerRole } from '../../../../core/roles';

/** Une action telle qu'affichée : la fiche enregistrée plus l'état d'affichage (carte dépliée, impact ouvert) */
interface Row extends QwAction {
  open: boolean;
  impactOpen: boolean;
}

type Filter = StatutQw | null;

/**
 * Outil transversal « Registre des Quick Wins » : les petites actions d'amélioration rapides d'une entreprise, avec leur avancement.
 * Un registre par étape (route tqw1 à tqw4), un par consultant et par entreprise. Là où le tableur propose 10 lignes à 9 colonnes,
 * chaque action est une carte : l'avancement se change d'un toucher, le suivi d'impact (indicateur avant / après) s'ouvre à la demande.
 * Les managers et modérateurs consultent en lecture seule.
 */
@Component({
  selector: 'app-tqw',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LivrableReviewComponent, LoadingComponent, LoadErrorComponent, PreviewBannerComponent],
  templateUrl: './tqw.component.html',
  styleUrl: './tqw.component.scss'
})
export class TqwComponent implements OnInit, OnDestroy {

  readonly statuts = STATUTS_QW;
  readonly domaines = DOMAINES_QW;
  readonly responsables = RESPONSABLES_QW;
  readonly etapesList = [1, 2, 3, 4];

  /** Étape du registre (1 à 4), donnée par la route */
  etape = 1;

  rows: Row[] = [];
  dateDebut: string | null = null;
  docsCrees: string | null = null;
  docsPartages: string | null = null;

  companyId = 0;
  companyName = '';
  consultantName = '';

  isLoading = true;
  loadError = false;
  isSaving = false;
  readOnly = true;
  /** Aperçu manager : registre vierge, utilisable mais jamais enregistré */
  preview = false;
  filter: Filter = null;
  /** Ligne dont la suppression attend une confirmation */
  confirmRemove: Row | null = null;

  alertMessage = '';
  alertType: 'success' | 'danger' = 'success';

  private consultantId = 0;
  private userId = 0;
  private today = new Date().toISOString().slice(0, 10);

  constructor(
    private toolService: ConsultantService,
    private storageService: StorageService,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: object,
  ) { }

  ngOnInit(): void {
    this.etape = Number(this.route.snapshot.data['etape']) || 1;
    this.setPrintMode(true);

    const user = this.storageService.getUser();
    this.userId = user.id;
    const isManagerRole = hasManagerRole(user.roles);
    this.consultantId = this.storageService.ConsultantId === 0 ? this.userId : this.storageService.ConsultantId;
    this.companyId = this.storageService.CompanyId;
    // Un manager qui ouvre l'outil depuis le menu (sans entreprise) le voit comme un consultant, sans pouvoir enregistrer
    this.preview = isManagerRole && !this.companyId;
    // Seul le consultant concerné modifie ; un manager ou un autre utilisateur consulte en lecture seule
    this.readOnly = !this.preview && (isManagerRole || this.consultantId !== this.userId || this.storageService.CompanyLocked);

    if (!this.companyId) {
      if (this.preview) this.fill({ etape: this.etape, data: null, actions: [], company: null, consultant: null });
      this.isLoading = false;
      return;
    }
    this.load();
  }

  ngOnDestroy(): void {
    this.setPrintMode(false);
  }

  // Masque l'en-tête et le pied de page du site à l'impression de cette page (règle dans styles.scss)
  private setPrintMode(on: boolean): void {
    if (isPlatformBrowser(this.platformId)) document.body.classList.toggle('print-profil', on);
  }

  load(): void {
    this.isLoading = true;
    this.loadError = false;
    this.toolService.fetchQuickWins(this.consultantId, this.companyId, this.etape).subscribe({
      next: data => { this.fill(data); this.isLoading = false; },
      error: () => { this.loadError = true; this.isLoading = false; }
    });
  }

  private fill(data: QuickWinsResponse): void {
    this.companyName = data.company?.name ?? '';
    this.consultantName = data.consultant?.username ?? '';
    this.dateDebut = data.data?.date_debut ?? (this.readOnly ? null : this.today);
    this.docsCrees = data.data?.docs_crees ?? null;
    this.docsPartages = data.data?.docs_partages ?? null;
    this.rows = data.actions.map(a => ({ ...a, open: false, impactOpen: this.hasImpact(a) }));
    // Registre vide : une première action prête à être remplie ; une seule action : elle est ouverte
    if (!this.readOnly && this.rows.length === 0) this.rows.push(this.blank(true));
    if (this.rows.length === 1) this.rows[0].open = true;
  }

  private blank(open: boolean): Row {
    return {
      action: null, domaine: null, responsable: 'Consultant', echeance: null, statut: 'a_faire',
      indicateur: null, valeur_avant: null, valeur_apres: null, commentaires: null, open, impactOpen: false
    };
  }

  private hasImpact(a: QwAction): boolean {
    return !!(a.indicateur || a.valeur_avant || a.valeur_apres || a.commentaires);
  }

  // ── Résumé (se met à jour au fil des changements) ───────────────────────────

  count(statut: StatutQw): number {
    return this.rows.filter(r => r.statut === statut && this.isFilled(r)).length;
  }

  /** Une carte est comptée dès qu'elle contient quelque chose (une carte vierge n'est pas une action) */
  private isFilled(r: Row): boolean {
    return !!(r.action?.trim() || r.domaine || r.echeance || r.indicateur || r.valeur_avant || r.valeur_apres || r.commentaires || r.statut !== 'a_faire');
  }

  get total(): number {
    return this.rows.filter(r => this.isFilled(r)).length;
  }

  /** Part des actions terminées, en % */
  get progress(): number {
    return this.total ? Math.round(this.count('termine') / this.total * 100) : 0;
  }

  get overdue(): number {
    return this.rows.filter(r => this.isOverdue(r)).length;
  }

  isOverdue(r: Row): boolean {
    return !!r.echeance && r.echeance < this.today && r.statut !== 'termine';
  }

  setFilter(f: StatutQw): void {
    this.filter = this.filter === f ? null : f;
  }

  visible(r: Row): boolean {
    return !this.filter || r.statut === this.filter;
  }

  statutOf(value: StatutQw) {
    return this.statuts.find(s => s.value === value) ?? this.statuts[0];
  }

  // ── Actions sur les cartes ──────────────────────────────────────────────────

  toggle(r: Row): void {
    r.open = !r.open;
  }

  setStatut(r: Row, statut: StatutQw): void {
    if (this.readOnly) return;
    r.statut = statut;
    // Une action terminée : on propose tout de suite de noter le résultat obtenu
    if (statut === 'termine' && (r.indicateur || r.valeur_avant)) r.impactOpen = true;
  }

  /** Un toucher sur la pastille d'une carte repliée fait avancer le statut : en attente → en cours → terminé */
  advance(r: Row, event: Event): void {
    event.stopPropagation();
    if (this.readOnly) return;
    const order: StatutQw[] = ['a_faire', 'en_cours', 'termine'];
    this.setStatut(r, order[(order.indexOf(r.statut) + 1) % order.length]);
  }

  addAction(): void {
    this.filter = null;
    const row = this.blank(true);
    this.rows.push(row);
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => document.getElementById('qw-' + (this.rows.length - 1))?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
    }
  }

  askRemove(r: Row): void {
    this.confirmRemove = r;
  }

  remove(r: Row): void {
    this.rows = this.rows.filter(x => x !== r);
    this.confirmRemove = null;
    if (!this.rows.length) this.rows.push(this.blank(true));
  }

  numberOf(r: Row): number {
    return this.rows.indexOf(r) + 1;
  }

  /** Texte de la carte repliée */
  titleOf(r: Row): string {
    return r.action?.trim() || 'Nouvelle action';
  }

  // ── Enregistrement ──────────────────────────────────────────────────────────

  save(): void {
    this.alertMessage = '';
    if (this.readOnly || this.preview || this.isSaving) return;
    const payload = {
      cons_id: this.userId,
      comp_id: this.companyId,
      etape: this.etape,
      date_debut: this.dateDebut || null,
      docs_crees: this.docsCrees,
      docs_partages: this.docsPartages,
      actions: this.rows.map(r => ({
        action: r.action, domaine: r.domaine, responsable: r.responsable, echeance: r.echeance || null, statut: r.statut,
        indicateur: r.indicateur, valeur_avant: r.valeur_avant, valeur_apres: r.valeur_apres, commentaires: r.commentaires
      }))
    };
    this.isSaving = true;
    this.toolService.saveQuickWins(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.showAlert('Le registre des Quick Wins a été enregistré.', 'success');
      },
      error: err => {
        this.isSaving = false;
        this.showAlert(err.error?.errors?.join(' · ') ?? err.error?.message ?? 'Une erreur est survenue. Veuillez réessayer.', 'danger');
      }
    });
  }

  print(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    // À l'impression, toutes les cartes sont dépliées
    const states = this.rows.map(r => [r.open, r.impactOpen] as const);
    this.rows.forEach(r => { r.open = true; r.impactOpen = true; });
    setTimeout(() => { window.print(); this.rows.forEach((r, i) => { r.open = states[i][0]; r.impactOpen = states[i][1]; }); }, 50);
  }

  private showAlert(message: string, type: 'success' | 'danger'): void {
    this.alertMessage = message;
    this.alertType = type;
    if (isPlatformBrowser(this.platformId)) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goBack(): void {
    history.back();
  }
}
