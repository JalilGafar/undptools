import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ConsultantService } from '../../../consultant.service';
import { StorageService } from '../../../../_services/storage.service';
import { LivrableReviewComponent } from '../../../../shared/components/livrable-review/livrable-review.component';
import { LoadingComponent, LoadErrorComponent } from '../../../../shared/components/loading/loading.component';
import { PreviewBannerComponent } from '../../../../shared/components/preview-banner/preview-banner.component';
import { CinqSPhotosComponent } from './cinq-s-photos.component';
import {
  Cinq5SResponse, MODE_EMPLOI_5S, NIVEAUX_5S, Phase5S, PhotoSlot, RECOMMANDATION_5S, SECTIONS_5S, STATUTS_5S
} from '../../../../core/model/cinq-s';
import { hasManagerRole } from '../../../../core/roles';

/**
 * Outil 5S : 5 « S » de 6 critères notés de 1 à 5, scores calculés en direct, plan d'action immédiat et photos avant / après.
 * Deux évaluations par consultant et par entreprise sur la même fiche : initiale (étape 1, route t5s) et finale (étape 4, route t5sf) ; les managers et modérateurs consultent en lecture seule.
 */
@Component({
  selector: 'app-t5s',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LivrableReviewComponent, LoadingComponent, LoadErrorComponent, CinqSPhotosComponent, PreviewBannerComponent],
  templateUrl: './t5s.component.html',
  styleUrl: './t5s.component.scss'
})
export class T5sComponent implements OnInit, OnDestroy {

  readonly sections = SECTIONS_5S;
  readonly niveaux = NIVEAUX_5S;
  readonly statuts = STATUTS_5S;
  readonly modeEmploi = MODE_EMPLOI_5S;
  readonly recommandation = RECOMMANDATION_5S;
  readonly notes5 = [1, 2, 3, 4, 5];
  readonly slots: { slot: PhotoSlot; title: string }[] = [
    { slot: 'avant', title: 'Photos avant' },
    { slot: 'apres', title: 'Photos après' },
  ];

  form!: FormGroup;

  /** Évaluation affichée : initiale (étape 1) ou finale (étape 4), selon la route */
  phase: Phase5S = 'initial';
  /** Évaluation initiale, chargée seulement pour la finale : sert de point de comparaison */
  initial: Cinq5SResponse | null = null;

  companyId = 0;
  companyName = '';
  consultantName = '';

  isLoading = true;
  loadError = false;
  isSaving = false;
  readOnly = true;
  /** Aperçu manager : outil vierge, utilisable mais jamais enregistré */
  preview = false;

  alertMessage = '';
  alertType: 'success' | 'danger' = 'success';

  // Affichage : le premier « S » est ouvert au départ ; les aides (questions suggérées) se déplient à la demande
  openS: number | null = 1;
  helpOpen = new Set<string>();
  showGuide = false;
  showScale = false;

  /** Consultant dont on affiche l'évaluation (lui-même, ou celui choisi par un manager) */
  consultantId = 0;
  private userId = 0;

  constructor(
    private fb: FormBuilder,
    private toolService: ConsultantService,
    private storageService: StorageService,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: object,
  ) { }

  ngOnInit(): void {
    this.phase = this.route.snapshot.data['phase'] === 'final' ? 'final' : 'initial';
    this.setPrintMode(true);
    this.buildForm();

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
      if (this.preview) this.fill({ data: null, notes: [], actions: [] } as unknown as Cinq5SResponse);
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
    this.toolService.fetchCinqS(this.consultantId, this.companyId, this.phase).subscribe({
      next: data => {
        this.companyName = data.company?.name ?? '';
        this.consultantName = data.consultant?.username ?? '';
        this.buildForm();
        this.fill(data);
        if (this.readOnly) this.form.disable();
        this.isLoading = false;
        if (this.phase === 'final') this.loadInitial();
      },
      error: () => { this.loadError = true; this.isLoading = false; }
    });
  }

  /** Pour l'évaluation finale : charge l'évaluation initiale afin d'afficher la progression (échec ignoré) */
  private loadInitial(): void {
    this.toolService.fetchCinqS(this.consultantId, this.companyId, 'initial').subscribe({
      next: data => this.initial = data.data ? data : null,
      error: () => this.initial = null
    });
  }

  // ── Formulaire ──────────────────────────────────────────────────────────────

  private buildForm(): void {
    const notes = this.sections.flatMap(sec => sec.criteres.map((_, i) =>
      this.fb.group({ s: [sec.s], critere: [i + 1], note: [null], observations: [null] })));
    this.form = this.fb.group({
      responsable: [null],
      date_evaluation: [null],
      notes: this.fb.array(notes),
      actions: this.fb.array([])
    });
  }

  get notes(): FormArray {
    return this.form.get('notes') as FormArray;
  }

  get actions(): FormArray {
    return this.form.get('actions') as FormArray;
  }

  /** Groupe du formulaire d'un critère (6 critères par S, numérotés à partir de 1) */
  note(s: number, critere: number): FormGroup {
    return this.notes.at((s - 1) * 6 + (critere - 1)) as FormGroup;
  }

  private newAction(a?: Partial<{ s: number | null; probleme: string | null; action: string | null; date_limite: string | null; statut: string | null; resultat: string | null }>): FormGroup {
    return this.fb.group({
      s: [a?.s ?? null], probleme: [a?.probleme ?? null], action: [a?.action ?? null],
      date_limite: [a?.date_limite ?? null], statut: [a?.statut ?? null], resultat: [a?.resultat ?? null]
    });
  }

  addAction(): void {
    this.actions.push(this.newAction());
  }

  removeAction(index: number): void {
    this.actions.removeAt(index);
  }

  private fill(data: Cinq5SResponse): void {
    this.form.patchValue({
      responsable: data.data?.responsable ?? null,
      date_evaluation: data.data?.date_evaluation ?? new Date().toISOString().slice(0, 10)
    });
    data.notes.forEach(n => this.note(n.s, n.critere).patchValue({ note: n.note, observations: n.observations }));
    data.actions.forEach(a => this.actions.push(this.newAction(a)));
    if (!this.readOnly && this.actions.length === 0) {
      this.addAction();   // un seul plan d'action au départ ; le consultant en ajoute autant qu'il veut
    }
  }

  // ── Notes en boutons ────────────────────────────────────────────────────────

  pick(s: number, critere: number, value: number): void {
    if (this.readOnly) return;
    const control = this.note(s, critere).get('note')!;
    control.setValue(control.value === value ? null : value);   // toucher à nouveau la note choisie l'efface
    control.markAsDirty();
  }

  levelOf(value: number | null): { note: number; label: string } | null {
    if (value === null || value === undefined) return null;
    return this.niveaux[Math.min(5, Math.max(1, Math.round(value))) - 1];
  }

  // ── Scores (comme la fiche : moyenne des critères notés, puis moyenne des S) ──

  /** Moyenne d'un S sur les critères déjà notés ; null si aucun */
  average(s: number): number | null {
    const values = this.sections[s - 1].criteres
      .map((_, i) => this.note(s, i + 1).get('note')!.value as number | null)
      .filter((v): v is number => typeof v === 'number');
    return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
  }

  get globalScore(): number | null {
    const averages = this.sections.map(sec => this.average(sec.s)).filter((v): v is number => v !== null);
    return averages.length ? averages.reduce((a, b) => a + b, 0) / averages.length : null;
  }

  /** Moyenne d'un S lors de l'évaluation initiale (null s'il n'y en a pas) */
  initialAverage(s: number): number | null {
    const values = (this.initial?.notes ?? []).filter(n => n.s === s && typeof n.note === 'number').map(n => n.note as number);
    return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
  }

  get initialGlobal(): number | null {
    const averages = this.sections.map(sec => this.initialAverage(sec.s)).filter((v): v is number => v !== null);
    return averages.length ? averages.reduce((a, b) => a + b, 0) / averages.length : null;
  }

  /** Progression par rapport à l'évaluation initiale, ex. « +0,4 » (null si l'un des deux manque) */
  progress(current: number | null, initial: number | null): { text: string; sign: 'up' | 'down' | 'same' } | null {
    if (current === null || initial === null) return null;
    const diff = Math.round((current - initial) * 10) / 10;
    const text = (diff > 0 ? '+' : '') + diff.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    return { text, sign: diff > 0 ? 'up' : diff < 0 ? 'down' : 'same' };
  }

  get toolCode(): string {
    return this.phase === 'final' ? 't5sf' : 't5s';
  }

  fmt(value: number | null): string {
    return value === null ? '—' : value.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }

  /** Largeur de la barre (0-100 %) pour une moyenne sur 5 */
  pct(value: number | null): number {
    return value === null ? 0 : Math.round(value / 5 * 100);
  }

  // ── Affichage ───────────────────────────────────────────────────────────────

  toggleS(s: number): void {
    this.openS = this.openS === s ? null : s;
  }

  toggleHelp(s: number, critere: number): void {
    const key = `${s}.${critere}`;
    this.helpOpen.has(key) ? this.helpOpen.delete(key) : this.helpOpen.add(key);
  }

  isHelpOpen(s: number, critere: number): boolean {
    return this.helpOpen.has(`${s}.${critere}`);
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  save(): void {
    this.alertMessage = '';
    if (this.readOnly || this.preview) return;
    const v = this.form.getRawValue();
    const payload = {
      cons_id: this.userId,
      comp_id: this.companyId,
      phase: this.phase,
      responsable: v.responsable,
      date_evaluation: v.date_evaluation,
      notes: (v.notes as { s: number; critere: number; note: number | null; observations: string | null }[])
        .filter(n => n.note !== null || n.observations),
      actions: (v.actions as Record<string, unknown>[]).filter(a => a['s'] || a['probleme'] || a['action'] || a['date_limite'] || a['statut'] || a['resultat'])
    };

    this.isSaving = true;
    this.toolService.saveCinqS(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.showAlert("L'évaluation 5S a été enregistrée.", 'success');
      },
      error: err => {
        this.isSaving = false;
        this.showAlert(err.error?.errors?.join(' · ') ?? err.error?.message ?? 'Une erreur est survenue. Veuillez réessayer.', 'danger');
      }
    });
  }

  print(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    // Pour l'impression, tous les « S » sont dépliés
    const previous = this.openS;
    this.openS = 0;
    setTimeout(() => { window.print(); this.openS = previous; }, 50);
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
