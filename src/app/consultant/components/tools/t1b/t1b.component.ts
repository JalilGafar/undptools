import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConsultantService } from '../../../consultant.service';
import { StorageService } from '../../../../_services/storage.service';
import { MinuteDetail, MinutePayload, MinutesList } from '../../../../core/model/minutes';
import { LoadingComponent, LoadErrorComponent } from '../../../../shared/components/loading/loading.component';
import { LivrableReviewComponent } from '../../../../shared/components/livrable-review/livrable-review.component';
import { SignaturePadComponent } from '../../../../shared/components/signature-pad/signature-pad.component';
import { PreviewBannerComponent } from '../../../../shared/components/preview-banner/preview-banner.component';
import { ReviewBadgeComponent } from '../../../../shared/components/review-badge/review-badge.component';
import { LivrableReviewService, ReviewSummary, reviewKey } from '../../../../shared/livrable-review.service';
import { hasManagerRole } from '../../../../core/roles';

const INITIAL_ATTENDEES = 3;
const INITIAL_ENGAGEMENTS = 3;

/** Les quatre étapes du programme (mêmes libellés que le menu des outils) */
export const ETAPES = [
  { value: 1, label: "Étape 1 – L'offre et la demande" },
  { value: 2, label: "Étape 2 – Modèle d'affaires" },
  { value: 3, label: 'Étape 3 – Renforcement des capacités' },
  { value: 4, label: "Étape 4 – Renforcement de l'entreprise" },
];

/**
 * Outil 1B « Minutes de réunion ». Une entreprise a plusieurs minutes (une par réunion) : on affiche la liste,
 * puis le formulaire d'une minute. Le consultant propriétaire crée / modifie / supprime ; les managers consultent.
 */
@Component({
  selector: 'app-t1b',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LoadingComponent,
    LoadErrorComponent,
    LivrableReviewComponent,
    ReviewBadgeComponent,
    SignaturePadComponent,
    PreviewBannerComponent,
  ],
  templateUrl: './t1b.component.html',
  styleUrl: './t1b.component.scss'
})
export class T1bComponent implements OnInit, OnDestroy {

  toolName!: string;
  readonly etapes = ETAPES;

  mode: 'list' | 'form' = 'list';

  // Liste
  list: MinutesList | null = null;
  isLoading = true;
  loadError = false;

  // Formulaire
  MeetForm!: FormGroup;
  editingId: number | null = null;
  detail: MinuteDetail | null = null;
  isFormLoading = false;
  isSaving = false;
  confirmDelete = false;
  /** Signature en cours de saisie : un participant (index) ou le consultant */
  signTarget: { kind: 'present'; index: number } | { kind: 'consultant' } | null = null;

  alertMessage = '';
  alertType: 'success' | 'danger' = 'success';

  companyId = 0;
  isManagerRole = false;
  /** Aperçu manager : minute vierge, utilisable mais jamais enregistrée */
  preview = false;

  /** Mention la plus récente de chaque minute (une minute = un livrable évalué) */
  reviews = new Map<string, ReviewSummary>();

  private deepLinkDone = false;
  private consultantId = 0;
  private userId = 0;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private toolService: ConsultantService,
    private storageService: StorageService,
    private reviewService: LivrableReviewService,
    @Inject(PLATFORM_ID) private platformId: object,
  ) { }

  ngOnInit(): void {
    this.toolName = this.route.snapshot.queryParams['toolName'];
    this.setPrintMode(true);
    this.buildForm();

    const user = this.storageService.getUser();
    this.userId = user.id;
    this.isManagerRole = hasManagerRole(user.roles);
    this.consultantId = this.storageService.ConsultantId === 0 ? this.userId : this.storageService.ConsultantId;
    this.companyId = this.storageService.CompanyId;
    // Un manager qui ouvre l'outil depuis le menu (sans entreprise) le voit comme un consultant, sans pouvoir enregistrer
    this.preview = this.isManagerRole && !this.companyId;

    if (!this.companyId) {
      this.isLoading = false;
      if (this.preview) this.openNew(Number(this.route.snapshot.queryParams['etape']) || 1);   // directement une minute vierge : il n'y a pas de liste à consulter
      return;
    }
    this.loadList();
  }

  ngOnDestroy(): void {
    this.setPrintMode(false);
  }

  // Masque l'en-tête et le pied de page du site à l'impression de cette page (règle dans styles.scss)
  private setPrintMode(on: boolean): void {
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.toggle('print-profil', on);
    }
  }

  review(minuteId: number): ReviewSummary | undefined {
    return this.reviews.get(reviewKey(this.companyId, this.consultantId, 't1b', minuteId));
  }

  /** Le consultant propriétaire peut écrire ; un manager ou un autre utilisateur consulte */
  get canCreate(): boolean {
    return !this.isManagerRole && this.consultantId === this.userId && !this.storageService.CompanyLocked;
  }

  get readOnly(): boolean {
    if (this.preview) return false;
    return this.editingId === null ? !this.canCreate : !(this.detail?.canWrite);
  }

  // ── Liste ───────────────────────────────────────────────────────────────────

  loadList(): void {
    this.isLoading = true;
    this.loadError = false;
    this.toolService.fetchMinutes(this.consultantId, this.companyId).subscribe({
      next: data => {
        this.list = data;
        this.isLoading = false;
        this.reviewService.summary().subscribe(map => this.reviews = map);
        // Lien direct vers une minute (depuis les listes de livrables) : ouverte une seule fois
        const wanted = Number(this.route.snapshot.queryParams['minute']);
        if (!this.deepLinkDone) {
          if (wanted) {
            this.deepLinkDone = true;
            this.openMinute(wanted);
          } else if (this.route.snapshot.queryParams['new'] && this.canCreate) {
            // « Nouvelle minute » depuis le tableau de bord : formulaire vierge, étape présélectionnée
            this.deepLinkDone = true;
            this.openNew(Number(this.route.snapshot.queryParams['etape']) || 1);
          }
        }
      },
      error: () => { this.loadError = true; this.isLoading = false; }
    });
  }

  etapeLabel(value: number): string {
    return this.etapes.find(e => e.value === value)?.label ?? `Étape ${value}`;
  }

  // ── Formulaire ──────────────────────────────────────────────────────────────

  private buildForm(): void {
    this.MeetForm = this.fb.group({
      etape: [1, Validators.required],
      numero: [null, [Validators.min(1), Validators.max(9999)]],
      date_reunion: [null, Validators.required],
      heure_debut: [null],
      heure_fin: [null],
      lieu: [null],
      objectif: [null, Validators.required],
      ordre_jour: [null],
      discussion: [null],
      resultats: [null],
      remarques: [null],
      consultant_signature: [null],
      presents: this.fb.array([]),
      engagements: this.fb.array([])
    });
  }

  get engagements(): FormArray {
    return this.MeetForm.get('engagements') as FormArray;
  }

  private newEngagement(tache: string | null = null, responsable: string | null = null, echeance: string | null = null) {
    return this.fb.group({ tache: [tache], responsable: [responsable], echeance: [echeance] });
  }

  addEngagement(): void {
    this.engagements.push(this.newEngagement());
  }

  removeEngagement(index: number): void {
    this.engagements.removeAt(index);
  }

  get presents(): FormArray {
    return this.MeetForm.get('presents') as FormArray;
  }

  private newAttendee(nom: string | null = null, poste: string | null = null, signature: string | null = null) {
    return this.fb.group({ nom: [nom], poste: [poste], signature: [signature] });
  }

  addAttendee(focus = true): void {
    this.presents.push(this.newAttendee());
    if (focus && isPlatformBrowser(this.platformId)) {
      const index = this.presents.length - 1;
      setTimeout(() => {
        const el = document.getElementById('present-nom-' + index) as HTMLInputElement | null;
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el?.focus({ preventScroll: true });
      }, 50);
    }
  }

  removeAttendee(index: number): void {
    this.presents.removeAt(index);
    if (this.presents.length === 0) this.addAttendee(false);
  }

  openNew(etape = 1): void {
    this.buildForm();
    this.MeetForm.patchValue({ etape, date_reunion: new Date().toISOString().slice(0, 10) });
    for (let i = 0; i < INITIAL_ATTENDEES; i++) this.addAttendee(false);
    for (let i = 0; i < INITIAL_ENGAGEMENTS; i++) this.addEngagement();
    this.editingId = null;
    this.detail = null;
    this.resetMessages();
    this.mode = 'form';
    this.scrollTop();
  }

  openMinute(id: number): void {
    this.editingId = id;
    this.detail = null;
    this.resetMessages();
    this.isFormLoading = true;
    this.mode = 'form';
    this.scrollTop();
    this.toolService.fetchMinute(id).subscribe({
      next: data => {
        this.detail = data;
        this.fill(data);
        if (!data.canWrite) this.MeetForm.disable();
        this.MeetForm.markAsPristine();
        this.isFormLoading = false;
      },
      error: () => {
        this.isFormLoading = false;
        this.mode = 'list';
        this.showAlert('danger', "Impossible d'ouvrir cette minute. Réessayez.");
      }
    });
  }

  private fill(data: MinuteDetail): void {
    const m = data.minute;
    this.buildForm();
    this.MeetForm.patchValue({
      etape: m.etape, numero: m.numero, date_reunion: m.date_reunion, heure_debut: m.heure_debut, heure_fin: m.heure_fin,
      lieu: m.lieu, objectif: m.objectif, ordre_jour: m.ordre_jour, discussion: m.discussion,
      resultats: m.resultats, remarques: m.remarques, consultant_signature: m.consultant_signature
    });
    data.presents.forEach(p => this.presents.push(this.newAttendee(p.nom, p.poste, p.signature)));
    (data.engagements ?? []).forEach(e => this.engagements.push(this.newEngagement(e.tache, e.responsable, e.echeance)));
    if (data.canWrite) {
      if (this.presents.length === 0) this.addAttendee(false);
      if (this.engagements.length === 0) this.addEngagement();
    }
  }

  backToList(): void {
    if (this.preview) { this.goBack(); return; }
    this.mode = 'list';
    this.editingId = null;
    this.detail = null;
    this.confirmDelete = false;
    this.resetMessages();
    this.loadList();
    this.scrollTop();
  }

  save(): void {
    if (this.readOnly || this.preview || this.isSaving) return;
    this.MeetForm.markAllAsTouched();
    if (this.MeetForm.invalid) {
      this.showAlert('danger', 'Renseignez au minimum la date et les objectifs de la réunion.');
      return;
    }
    const v = this.MeetForm.getRawValue();
    const payload: MinutePayload = {
      etape: Number(v.etape),
      numero: v.numero === null || v.numero === '' ? null : Number(v.numero),
      date_reunion: v.date_reunion,
      heure_debut: v.heure_debut || null,
      heure_fin: v.heure_fin || null,
      lieu: v.lieu,
      objectif: v.objectif,
      ordre_jour: v.ordre_jour,
      discussion: v.discussion,
      resultats: v.resultats,
      remarques: v.remarques,
      consultant_signature: v.consultant_signature,
      presents: v.presents.map((p: any) => ({ nom: p.nom, poste: p.poste, signature: p.signature })),
      engagements: v.engagements.map((e: any) => ({ tache: e.tache, responsable: e.responsable, echeance: e.echeance || null }))
    };
    if (this.editingId === null) {
      payload.cons_id = this.consultantId;
      payload.comp_id = this.companyId;
    }
    const creating = this.editingId === null;
    this.isSaving = true;
    this.toolService.saveMinute(payload, this.editingId ?? undefined).subscribe({
      next: res => {
        this.isSaving = false;
        this.editingId = res.id;
        // Recharge la minute telle qu'enregistrée par le serveur
        this.toolService.fetchMinute(res.id).subscribe(d => {
          this.detail = d;
          this.fill(d);
          this.MeetForm.markAsPristine();
        });
        this.showAlert('success', creating ? 'Minute enregistrée.' : 'Minute mise à jour.');
      },
      error: err => {
        this.isSaving = false;
        this.showAlert('danger', err?.error?.message ?? "Enregistrement impossible. Vérifiez votre connexion et réessayez.");
      }
    });
  }

  deleteMinute(): void {
    if (this.editingId === null) return;
    this.toolService.deleteMinute(this.editingId).subscribe({
      next: () => this.backToList(),
      error: err => {
        this.confirmDelete = false;
        this.showAlert('danger', err?.error?.message ?? 'Suppression impossible. Réessayez.');
      }
    });
  }

  // ── Signatures tactiles ─────────────────────────────────────────────────────

  get consultantName(): string {
    return this.list?.consultant?.username ?? 'Consultant';
  }

  openSign(target: { kind: 'present'; index: number } | { kind: 'consultant' }): void {
    if (this.readOnly) return;
    this.signTarget = target;
  }

  signTitle(): string {
    const t = this.signTarget;
    if (!t) return '';
    if (t.kind === 'consultant') return `Signature du consultant`;
    return `Signature de ${this.presents.at(t.index).get('nom')?.value || 'ce participant'}`;
  }

  onSigned(dataUrl: string): void {
    const t = this.signTarget;
    this.signTarget = null;
    if (!t) return;
    const group = t.kind === 'consultant' ? this.MeetForm : this.presents.at(t.index);
    const control = group.get(t.kind === 'consultant' ? 'consultant_signature' : 'signature');
    control?.setValue(dataUrl);
    control?.markAsDirty();
  }

  clearSignature(target: { kind: 'present'; index: number } | { kind: 'consultant' }): void {
    if (this.readOnly) return;
    const group = target.kind === 'consultant' ? this.MeetForm : this.presents.at(target.index);
    const key = target.kind === 'consultant' ? 'consultant_signature' : 'signature';
    group.get(key)?.setValue(null);
    group.get(key)?.markAsDirty();
  }

  print(): void {
    if (isPlatformBrowser(this.platformId)) window.print();
  }

  // ── Utilitaires ─────────────────────────────────────────────────────────────

  private resetMessages(): void {
    this.alertMessage = '';
    this.confirmDelete = false;
  }

  private showAlert(type: 'success' | 'danger', message: string): void {
    this.alertType = type;
    this.alertMessage = message;
    this.scrollTop();
  }

  private scrollTop(): void {
    if (isPlatformBrowser(this.platformId)) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goBack(): void {
    history.back();
  }
}
