import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ConsultantService } from '../../../consultant.service';
import { StorageService } from '../../../../_services/storage.service';
import { ScrollHintDirective } from '../../../../shared/scroll-hint.directive';
import { LivrableReviewComponent } from '../../../../shared/components/livrable-review/livrable-review.component';
import { LoadingComponent, LoadErrorComponent } from '../../../../shared/components/loading/loading.component';
import { PreviewBannerComponent } from '../../../../shared/components/preview-banner/preview-banner.component';
import { ProduitLigne, ProductiviteResponse } from '../../../../core/model/productivite';
import { hasManagerRole } from '../../../../core/roles';

const TEXT_FIELDS = ['production_quotidienne', 'machine_principale', 'lacune_competences', 'saisonnalite_detail', 'goulot', 'certifications'];
const CHOICE_FIELDS = ['production_type', 'propriete'];
const BOOL_FIELDS = ['formes_securite', 'saisonnalite', 'commandes_refusees'];

/** Champs numériques avec leurs bornes (mêmes règles que le serveur) */
const NUMBER_FIELDS: Record<string, { min: number; max?: number }> = {
  nb_gammes: { min: 0 },
  nb_variantes: { min: 0 },
  heures_par_jour: { min: 0, max: 24 },
  jours_par_semaine: { min: 0, max: 7 },
  mois_par_an: { min: 0, max: 12 },
  capacite_utilisee_pct: { min: 0, max: 100 },
  surface_m2: { min: 0 },
  nb_machines_cles: { min: 0 },
  jours_perdus_mois: { min: 0, max: 31 },
  effectif_production: { min: 0 },
  effectif_temps_plein: { min: 0 },
  effectif_temps_partiel: { min: 0 },
  nb_formes_securite: { min: 0 },
  augmentation_possible_pct: { min: 0, max: 1000 },
  commandes_refusees_fcfa: { min: 0 },
};

/**
 * Outil 1J « Profil de productivité » (diagnostic rapide). Un profil par consultant et par entreprise.
 * Le consultant propriétaire saisit ; les managers et modérateurs consultent en lecture seule (avec option USD).
 */
@Component({
  selector: 'app-t1j',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ScrollHintDirective, LivrableReviewComponent, LoadingComponent, LoadErrorComponent, PreviewBannerComponent],
  templateUrl: './t1j.component.html',
  styleUrl: './t1j.component.scss'
})
export class T1jComponent implements OnInit, OnDestroy {

  form!: FormGroup;

  companyId = 0;
  companyName = '';
  consultantName = '';

  isLoading = true;
  loadError = false;
  isSaving = false;
  readOnly = true;
  /** Aperçu manager : outil vierge, utilisable mais jamais enregistré */
  preview = false;
  isManagerRole = false;

  alertMessage = '';
  alertType: 'success' | 'danger' = 'success';

  // Affichage en USD (managers uniquement) : les montants restent saisis et stockés en FCFA
  showUsd = false;
  fx = { year: 2025, xafPerUsd: 580 };

  private consultantId = 0;
  private userId = 0;

  constructor(
    private fb: FormBuilder,
    private toolService: ConsultantService,
    private storageService: StorageService,
    @Inject(PLATFORM_ID) private platformId: object,
  ) { }

  ngOnInit(): void {
    this.setPrintMode(true);
    this.buildForm();

    const user = this.storageService.getUser();
    this.userId = user.id;
    this.isManagerRole = hasManagerRole(user.roles);
    this.consultantId = this.storageService.ConsultantId === 0 ? this.userId : this.storageService.ConsultantId;
    this.companyId = this.storageService.CompanyId;
    // Un manager qui ouvre l'outil depuis le menu (sans entreprise) le voit comme un consultant, sans pouvoir enregistrer
    this.preview = this.isManagerRole && !this.companyId;
    // Seul le consultant concerné modifie ; un manager ou un autre utilisateur consulte en lecture seule
    this.readOnly = !this.preview && (this.isManagerRole || this.consultantId !== this.userId || this.storageService.CompanyLocked);

    if (!this.companyId) {
      if (this.preview) this.fill({ data: null, produits: [] } as unknown as ProductiviteResponse);
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
    this.toolService.fetchProductivite(this.consultantId, this.companyId).subscribe({
      next: data => {
        this.fx = data.fx ?? this.fx;
        this.companyName = data.company?.name ?? '';
        this.consultantName = data.consultant?.username ?? '';
        this.buildForm();
        this.fill(data);
        if (this.readOnly) this.form.disable();
        this.isLoading = false;
      },
      error: () => { this.loadError = true; this.isLoading = false; }
    });
  }

  // ── Formulaire ──────────────────────────────────────────────────────────────

  private buildForm(): void {
    const controls: Record<string, unknown> = {};
    [...TEXT_FIELDS, ...CHOICE_FIELDS, ...BOOL_FIELDS].forEach(f => controls[f] = [null]);
    Object.entries(NUMBER_FIELDS).forEach(([f, b]) => {
      const validators: ValidatorFn[] = [Validators.min(b.min)];
      if (b.max !== undefined) validators.push(Validators.max(b.max));
      controls[f] = [null, validators];
    });
    controls['produits'] = this.fb.array([]);
    this.form = this.fb.group(controls);
  }

  get produits(): FormArray {
    return this.form.get('produits') as FormArray;
  }

  private newLine(line?: ProduitLigne): FormGroup {
    return this.fb.group({
      produit: [line?.produit ?? null],
      volume_mensuel: [line?.volume_mensuel ?? null],
      valeur_fcfa: [line?.valeur_fcfa ?? null, [Validators.min(0)]]
    });
  }

  addLine(): void {
    this.produits.push(this.newLine());
  }

  removeLine(index: number): void {
    this.produits.removeAt(index);
  }

  private fill(data: ProductiviteResponse): void {
    const d = data.data;
    if (d) {
      const values: Record<string, unknown> = {};
      [...TEXT_FIELDS, ...CHOICE_FIELDS, ...Object.keys(NUMBER_FIELDS)].forEach(f => values[f] = (d as any)[f] ?? null);
      BOOL_FIELDS.forEach(f => {
        const v = (d as any)[f];
        values[f] = v === null || v === undefined ? null : !!v;
      });
      this.form.patchValue(values);
    }
    (data.produits ?? []).forEach(l => this.produits.push(this.newLine(l)));
    if (!this.readOnly && this.produits.length === 0) {
      for (let i = 0; i < 4; i++) this.addLine();
    }
  }

  // ── Calculs affichés ────────────────────────────────────────────────────────

  get totalValeurFcfa(): number {
    return this.produits.controls.reduce((sum, c) => sum + (Number(c.get('valeur_fcfa')?.value) || 0), 0);
  }

  get variantesInferieuresAuxGammes(): boolean {
    const g = this.form.get('nb_gammes')?.value;
    const v = this.form.get('nb_variantes')?.value;
    return g !== null && v !== null && v < g;
  }

  isYes(name: string): boolean {
    return this.form.get(name)?.value === true;
  }

  /** Montant affiché : FCFA, ou USD converti au taux fixe quand le manager active l'option. */
  money(fcfa: number | null | undefined): string {
    const n = Number(fcfa) || 0;
    if (this.showUsd) return '$ ' + Math.round(n / this.fx.xafPerUsd).toLocaleString('fr-FR');
    return n.toLocaleString('fr-FR') + ' FCFA';
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  save(): void {
    this.alertMessage = '';
    if (this.readOnly || this.preview) return;
    if (this.form.invalid || this.variantesInferieuresAuxGammes) {
      this.form.markAllAsTouched();
      this.showAlert("Vérifiez les champs signalés avant d'enregistrer.", 'danger');
      return;
    }
    const { produits, ...scalars } = this.form.getRawValue();
    const payload = {
      ...scalars,
      cons_id: this.userId,
      comp_id: this.companyId,
      produits: (produits as ProduitLigne[]).filter(l => l.produit || l.volume_mensuel || l.valeur_fcfa)
    };

    this.isSaving = true;
    this.toolService.saveProductivite(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.showAlert('Le profil de productivité a été enregistré.', 'success');
      },
      error: err => {
        this.isSaving = false;
        this.showAlert(err.error?.errors?.join(' · ') ?? err.error?.message ?? 'Une erreur est survenue. Veuillez réessayer.', 'danger');
      }
    });
  }

  print(): void {
    if (isPlatformBrowser(this.platformId)) window.print();
  }

  isInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!(c && c.invalid && (c.touched || c.dirty));
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
