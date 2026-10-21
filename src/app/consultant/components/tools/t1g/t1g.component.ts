import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ConsultantService } from '../../../consultant.service';
import { StorageService } from '../../../../_services/storage.service';
import { ClientLigne } from '../../../../core/model/cartographie-clients';

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;
const PHONE_PATTERN = /^[0-9+().\s-]{6,50}$/;
const DATA_FIELDS = ['secteur', 'contact', 'adresse', 'telephone', 'email', 'produits', 'remarques'];

/** Une fiche contenant des informations doit avoir un nom de client. */
function clientRequired(group: AbstractControl): ValidationErrors | null {
  const v = group.value;
  const hasData = DATA_FIELDS.some(k => (v[k] ?? '').toString().trim() !== '') || Number(v.montant_fcfa) > 0;
  return hasData && (v.client ?? '').toString().trim() === '' ? { clientRequired: true } : null;
}

/** Outil 1G : cartographie des clients professionnels (B2B) d'une entreprise — une fiche par client. */
@Component({
  selector: 'app-t1g',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './t1g.component.html',
  styleUrl: './t1g.component.scss'
})
export class T1gComponent implements OnInit, OnDestroy {

  readonly remarquesMax = 1000;

  form!: FormGroup;
  /** État replié / déplié de chaque fiche (parallèle à `lignes`) */
  expanded: boolean[] = [];

  companyId = 0;
  companyName = '';
  consultantName = '';

  isLoading = true;
  loadError = false;
  isSaving = false;
  submitted = false;
  readOnly = true;
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
    this.form = this.fb.group({
      date_cartographie: [null],
      lignes: this.fb.array([])
    });

    const user = this.storageService.getUser();
    this.userId = user.id;
    this.isManagerRole = (user.roles ?? []).some((r: string) => r === 'ROLE_ADMIN' || r === 'ROLE_MODERATOR');
    this.consultantId = this.storageService.ConsultantId === 0 ? this.userId : this.storageService.ConsultantId;
    this.companyId = this.storageService.CompanyId;
    // Seul le consultant concerné modifie ; un manager ou un autre utilisateur consulte en lecture seule
    this.readOnly = this.isManagerRole || this.consultantId !== this.userId;

    if (!this.companyId) {
      this.isLoading = false;
      return;
    }

    this.toolService.fetchCartographie(this.consultantId, this.companyId).subscribe({
      next: data => {
        this.fx = data.fx ?? this.fx;
        this.companyName = data.company?.name ?? '';
        this.consultantName = data.consultant?.username ?? '';
        this.form.patchValue({ date_cartographie: data.carto?.date_cartographie ?? null });

        const saved = data.lignes ?? [];
        saved.forEach(l => this.pushLine(this.newLine(l), saved.length === 1));
        // Nouvelle cartographie : une seule fiche visible, prête à être remplie
        if (!this.readOnly && this.lignes.length === 0) this.pushLine(this.newLine(), true);
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

  // ── Fiches clients ──────────────────────────────────────────────────────────

  get lignes(): FormArray {
    return this.form.get('lignes') as FormArray;
  }

  private newLine(l?: ClientLigne): FormGroup {
    return this.fb.group({
      client: [l?.client ?? null],
      secteur: [l?.secteur ?? null],
      contact: [l?.contact ?? null],
      adresse: [l?.adresse ?? null],
      telephone: [l?.telephone ?? null, [Validators.pattern(PHONE_PATTERN)]],
      email: [l?.email ?? null, [Validators.pattern(EMAIL_PATTERN)]],
      produits: [l?.produits ?? null],
      montant_fcfa: [l?.montant_fcfa ?? null, [Validators.min(0)]],
      remarques: [l?.remarques ?? null, [Validators.maxLength(this.remarquesMax)]]
    }, { validators: clientRequired });
  }

  private pushLine(group: FormGroup, open: boolean): void {
    this.lignes.push(group);
    this.expanded.push(open);
  }

  addLine(): void {
    this.pushLine(this.newLine(), true);
    const index = this.lignes.length - 1;
    this.focusClient(index);
  }

  removeLine(index: number): void {
    const name = (this.lignes.at(index).get('client')?.value ?? '').toString().trim();
    const filled = this.lignes.at(index).dirty || name !== '';
    if (filled && isPlatformBrowser(this.platformId) && !confirm('Supprimer cette fiche client ?')) return;
    this.lignes.removeAt(index);
    this.expanded.splice(index, 1);
    if (this.lignes.length === 0) this.pushLine(this.newLine(), true);
  }

  toggle(index: number): void {
    this.expanded[index] = !this.expanded[index];
  }

  get allExpanded(): boolean {
    return this.expanded.length > 0 && this.expanded.every(Boolean);
  }

  toggleAll(): void {
    const open = !this.allExpanded;
    this.expanded = this.expanded.map(() => open);
  }

  /** Place le curseur sur le nom du client de la fiche (et la fait défiler dans la vue). */
  private focusClient(index: number): void {
    if (!isPlatformBrowser(this.platformId)) return;
    setTimeout(() => {
      const el = document.getElementById('client-' + index) as HTMLInputElement | null;
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.focus({ preventScroll: true });
    }, 50);
  }

  // ── Affichage et contrôles ──────────────────────────────────────────────────

  title(index: number): string {
    const name = (this.lignes.at(index).get('client')?.value ?? '').toString().trim();
    return name || 'Nouveau client';
  }

  remarquesLength(index: number): number {
    return (this.lignes.at(index).get('remarques')?.value ?? '').toString().length;
  }

  /** Erreur à montrer pour un champ : après saisie, ou après une tentative d'enregistrement. */
  showError(index: number, field: string, error: string): boolean {
    const c = this.lignes.at(index).get(field);
    if (!c) return false;
    return !!c.errors?.[error] && (c.touched || c.dirty || this.submitted);
  }

  /** Nom de client manquant alors que la fiche contient des informations. */
  showClientRequired(index: number): boolean {
    const g = this.lignes.at(index);
    return !!g.errors?.['clientRequired'] && (g.get('client')?.touched || g.dirty || this.submitted);
  }

  /** Avertissement (non bloquant) : le même client apparaît sur une autre fiche. */
  isDuplicate(index: number): boolean {
    const name = (this.lignes.at(index).get('client')?.value ?? '').toString().trim().toLowerCase();
    if (!name) return false;
    return this.lignes.controls.some((c, i) =>
      i !== index && (c.get('client')?.value ?? '').toString().trim().toLowerCase() === name);
  }

  // ── Calculs affichés ────────────────────────────────────────────────────────

  private amount(index: number): number {
    return Number(this.lignes.at(index).get('montant_fcfa')?.value) || 0;
  }

  get totalFcfa(): number {
    return this.lignes.controls.reduce((sum, c) => sum + (Number(c.get('montant_fcfa')?.value) || 0), 0);
  }

  /** « Nombre total de clients » : fiches dont le nom du client est renseigné */
  get nbClients(): number {
    return this.lignes.controls.filter(c => (c.get('client')?.value ?? '').toString().trim() !== '').length;
  }

  /** Part du montant mensuel total, en pourcentage (une décimale) */
  pct(index: number): number {
    const total = this.totalFcfa;
    return total > 0 ? Math.round(this.amount(index) * 1000 / total) / 10 : 0;
  }

  /** Part du plus gros client : indicateur de dépendance commerciale */
  get partPlusGrosClient(): number {
    const total = this.totalFcfa;
    if (total <= 0) return 0;
    const max = Math.max(0, ...this.lignes.controls.map(c => Number(c.get('montant_fcfa')?.value) || 0));
    return Math.round(max * 1000 / total) / 10;
  }

  /** Montant affiché : FCFA, ou USD converti au taux fixe quand le manager active l'option. */
  money(fcfa: number | null | undefined): string {
    const n = Number(fcfa) || 0;
    if (this.showUsd) {
      return '$ ' + Math.round(n / this.fx.xafPerUsd).toLocaleString('fr-FR');
    }
    return n.toLocaleString('fr-FR') + ' FCFA';
  }

  fmtPct(v: number): string {
    return v.toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' %';
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  save(): void {
    this.alertMessage = '';
    if (this.readOnly) return;
    this.submitted = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      // Déplie les fiches à corriger et se place sur la première
      this.lignes.controls.forEach((c, i) => { if (c.invalid) this.expanded[i] = true; });
      const first = this.lignes.controls.findIndex(c => c.invalid);
      this.showAlert('Certaines fiches contiennent des erreurs : corrigez les champs signalés.', 'danger');
      if (first >= 0) this.focusClient(first);
      return;
    }

    const payload = {
      cons_id: this.userId,
      comp_id: this.companyId,
      date_cartographie: this.form.value.date_cartographie,
      lignes: (this.lignes.getRawValue() as ClientLigne[])
        .filter(l => Object.values(l).some(v => v !== null && v !== ''))
    };

    this.isSaving = true;
    this.toolService.saveCartographie(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.submitted = false;
        this.showAlert('La cartographie a été enregistrée.', 'success');
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

  private showAlert(message: string, type: 'success' | 'danger'): void {
    this.alertMessage = message;
    this.alertType = type;
  }

  goBack(): void {
    history.back();
  }
}
