import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ConsultantService } from '../../../consultant.service';
import { StorageService } from '../../../../_services/storage.service';
import { ScrollHintDirective } from '../../../../shared/scroll-hint.directive';
import { LivrableReviewComponent } from '../../../../shared/components/livrable-review/livrable-review.component';
import { PreviewBannerComponent } from '../../../../shared/components/preview-banner/preview-banner.component';
import {
  CANAUX_VENTE, ProfilResponse, ProfilVente
} from '../../../../core/model/entreprise-profil';
import { hasManagerRole } from '../../../../core/roles';

type Niveau = 'secondaire' | 'universite' | 'autre';

const TEXT_FIELDS = ['representant', 'telephone', 'adresse', 'email', 'activite', 'annees_activite',
  'organisation', 'etude_autre_precision', 'soutien_nom', 'commentaires_marche'];
const NUMBER_FIELDS = ['effectif_total', 'effectif_femmes', 'clients_reguliers',
  'etude_secondaire_femmes', 'etude_secondaire_hommes', 'etude_universite_femmes', 'etude_universite_hommes',
  'etude_autre_femmes', 'etude_autre_hommes'];
const BOOL_FIELDS = ['etude_secondaire_chef', 'etude_universite_chef', 'etude_autre_chef',
  'enregistrement_fiscal', 'compte_bancaire', 'suivi_ca', 'soutien_programme', 'subvention_recue'];
const CHOICE_FIELDS = ['type_entreprise', 'type_facturation', 'type_clientele'];

@Component({
  selector: 'app-t1l',
  standalone: true,
  imports: [LivrableReviewComponent, PreviewBannerComponent, CommonModule, ReactiveFormsModule, RouterLink, ScrollHintDirective],
  templateUrl: './t1l.component.html',
  styleUrl: './t1l.component.scss'
})
export class T1lComponent implements OnInit, OnDestroy {

  readonly niveaux: { key: Niveau; label: string }[] = [
    { key: 'secondaire', label: 'Secondaire / Lycée' },
    { key: 'universite', label: 'Université' },
    { key: 'autre',      label: 'Autre (préciser)' },
  ];
  readonly canaux = CANAUX_VENTE;

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
      if (this.preview) this.fill({ profil: null, ventes: [] } as unknown as ProfilResponse);
      this.isLoading = false;
      return;
    }

    this.toolService.fetchProfil(this.consultantId, this.companyId).subscribe({
      next: data => {
        this.fx = data.fx ?? this.fx;
        this.companyName = data.company?.name ?? '';
        this.consultantName = data.consultant?.username ?? '';
        this.fill(data);
        if (this.readOnly) this.form.disable();
        this.isLoading = false;
      },
      error: () => {
        this.loadError = true;
        this.isLoading = false;
      }
    });
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

  // ── Formulaire ──────────────────────────────────────────────────────────────

  private buildForm(): void {
    const controls: Record<string, unknown> = {};
    [...TEXT_FIELDS, ...CHOICE_FIELDS].forEach(f => controls[f] = [null]);
    controls['date_reunion'] = [null];
    NUMBER_FIELDS.forEach(f => controls[f] = [null, [Validators.min(0)]]);
    BOOL_FIELDS.forEach(f => controls[f] = [null]);
    controls['canaux'] = this.fb.group(Object.fromEntries(this.canaux.map(c => [c.value, [false]])));
    controls['ventes'] = this.fb.array([]);
    this.form = this.fb.group(controls);
  }

  get ventes(): FormArray {
    return this.form.get('ventes') as FormArray;
  }

  private newLine(line?: ProfilVente): FormGroup {
    return this.fb.group({
      produit: [line?.produit ?? null],
      volume_fcfa: [line?.volume_fcfa ?? null, [Validators.min(0)]]
    });
  }

  addLine(): void {
    this.ventes.push(this.newLine());
  }

  removeLine(index: number): void {
    this.ventes.removeAt(index);
  }

  private fill(data: ProfilResponse): void {
    const p = data.profil;
    if (p) {
      const values: Record<string, unknown> = {};
      [...TEXT_FIELDS, ...CHOICE_FIELDS, 'date_reunion', ...NUMBER_FIELDS].forEach(f => values[f] = (p as any)[f] ?? null);
      BOOL_FIELDS.forEach(f => {
        const v = (p as any)[f];
        values[f] = v === null || v === undefined ? null : !!v;
      });
      this.form.patchValue(values);
      const selected = (p.canaux_vente ?? '').split(',').filter(Boolean);
      this.form.get('canaux')!.patchValue(Object.fromEntries(this.canaux.map(c => [c.value, selected.includes(c.value)])));
    } else if (data.company) {
      // Première ouverture : pré-remplissage à partir de la fiche entreprise (modifiable)
      const c = data.company;
      this.form.patchValue({
        representant: c.gerant,
        adresse: [c.quartier, c.lieu, c.ville].filter(Boolean).join(', ') || null,
        activite: c.secteur,
        effectif_total: c.nbr_employer,
        effectif_femmes: c.nbr_femme
      });
    }
    (data.ventes ?? []).forEach(l => this.ventes.push(this.newLine(l)));
    if (!this.readOnly && this.ventes.length === 0) {
      for (let i = 0; i < 4; i++) this.addLine();
    }
  }

  // ── Calculs affichés ────────────────────────────────────────────────────────

  get effectifHommes(): number | null {
    const total = this.form.get('effectif_total')?.value;
    const femmes = this.form.get('effectif_femmes')?.value;
    return total === null || total === undefined ? null : Math.max(0, total - (femmes ?? 0));
  }

  /** « Tous les salariés » = femmes + hommes de la ligne */
  tousSalaries(niveau: Niveau): number | null {
    const f = this.form.get(`etude_${niveau}_femmes`)?.value;
    const h = this.form.get(`etude_${niveau}_hommes`)?.value;
    return f === null && h === null ? null : (f ?? 0) + (h ?? 0);
  }

  get totalVentesFcfa(): number {
    return this.ventes.controls.reduce((sum, c) => sum + (Number(c.get('volume_fcfa')?.value) || 0), 0);
  }

  get femmesSuperieuresAuTotal(): boolean {
    const total = this.form.get('effectif_total')?.value;
    const femmes = this.form.get('effectif_femmes')?.value;
    return total !== null && femmes !== null && femmes > total;
  }

  /** Montant affiché : FCFA, ou USD converti au taux fixe quand le manager active l'option. */
  money(fcfa: number | null | undefined): string {
    const n = Number(fcfa) || 0;
    if (this.showUsd) {
      return '$ ' + Math.round(n / this.fx.xafPerUsd).toLocaleString('fr-FR');
    }
    return n.toLocaleString('fr-FR') + ' FCFA';
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  save(): void {
    this.alertMessage = '';
    if (this.readOnly || this.preview) return;
    if (this.form.invalid || this.femmesSuperieuresAuTotal) {
      this.form.markAllAsTouched();
      this.showAlert('Vérifiez les champs signalés avant d\'enregistrer.', 'danger');
      return;
    }

    const v = this.form.getRawValue();
    const { canaux, ventes, ...scalars } = v;
    const payload = {
      ...scalars,
      cons_id: this.userId,
      comp_id: this.companyId,
      canaux_vente: Object.keys(canaux).filter(k => canaux[k]),
      ventes: (ventes as ProfilVente[]).filter(l => l.produit || l.volume_fcfa)
    };

    this.isSaving = true;
    this.toolService.saveProfil(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.showAlert('Le profil a été enregistré.', 'success');
      },
      error: err => {
        this.isSaving = false;
        this.showAlert(err.error?.errors?.join(' · ') ?? err.error?.message ?? 'Une erreur est survenue. Veuillez réessayer.', 'danger');
      }
    });
  }

  print(): void {
    window.print();
  }

  isInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!(c && c.invalid && (c.touched || c.dirty));
  }

  private showAlert(message: string, type: 'success' | 'danger'): void {
    this.alertMessage = message;
    this.alertType = type;
  }

  goBack(): void {
    history.back();
  }
}
