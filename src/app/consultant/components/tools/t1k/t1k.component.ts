import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ConsultantService } from '../../../consultant.service';
import { StorageService } from '../../../../_services/storage.service';
import { LivrableReviewComponent } from '../../../../shared/components/livrable-review/livrable-review.component';
import { LoadingComponent, LoadErrorComponent } from '../../../../shared/components/loading/loading.component';
import { PreviewBannerComponent } from '../../../../shared/components/preview-banner/preview-banner.component';
import { IMAGE_SECTIONS, ImageCommercialeResponse, ImageElement } from '../../../../core/model/image-commerciale';
import { hasManagerRole } from '../../../../core/roles';

type ChoiceKey = 'existe' | 'situation' | 'besoin';

/**
 * Outil 1K « Diagnostic d'image commerciale » : 11 éléments à évaluer (existe ? situation ? besoin d'accompagnement ?).
 * Un diagnostic par consultant et par entreprise ; les managers et modérateurs consultent en lecture seule.
 */
@Component({
  selector: 'app-t1k',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LivrableReviewComponent, LoadingComponent, LoadErrorComponent, PreviewBannerComponent],
  templateUrl: './t1k.component.html',
  styleUrl: './t1k.component.scss'
})
export class T1kComponent implements OnInit, OnDestroy {

  readonly sections = IMAGE_SECTIONS;
  readonly existeChoices = [
    { value: 'oui', label: 'Oui' },
    { value: 'partiellement', label: 'Partiellement' },
    { value: 'non', label: 'Non' },
  ];
  // La valeur est ce qui est ENREGISTRÉ (identique côté serveur et base) ; le libellé est ce que voit le consultant.
  // « Passable » s'enregistre « moyenne » : les diagnostics déjà saisis restent affichés.
  readonly situationChoices = [
    { value: 'bonne', label: 'Bonne' },
    { value: 'moyenne', label: 'Passable' },
    { value: 'mediocre', label: 'Médiocre' },
    { value: 'non_applicable', label: 'Non applicable' },
  ];

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

  alertMessage = '';
  alertType: 'success' | 'danger' = 'success';

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
    const isManagerRole = hasManagerRole(user.roles);
    this.consultantId = this.storageService.ConsultantId === 0 ? this.userId : this.storageService.ConsultantId;
    this.companyId = this.storageService.CompanyId;
    // Un manager qui ouvre l'outil depuis le menu (sans entreprise) le voit comme un consultant, sans pouvoir enregistrer
    this.preview = isManagerRole && !this.companyId;
    // Seul le consultant concerné modifie ; un manager ou un autre utilisateur consulte en lecture seule
    this.readOnly = !this.preview && (isManagerRole || this.consultantId !== this.userId || this.storageService.CompanyLocked);

    if (!this.companyId) {
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
    this.toolService.fetchImageCommerciale(this.consultantId, this.companyId).subscribe({
      next: data => {
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
    const items = this.sections.flatMap(s => s.elements.map(e =>
      this.fb.group({ element: [e.id], existe: [null], situation: [null], besoin: [null], observations: [null] })));
    this.form = this.fb.group({ elements: this.fb.array(items), remarques_generales: [null] });
  }

  get elements(): FormArray {
    return this.form.get('elements') as FormArray;
  }

  /** Groupe du formulaire d'un élément (les éléments sont numérotés de 1 à 11) */
  item(id: number): FormGroup {
    return this.elements.at(id - 1) as FormGroup;
  }

  private fill(data: ImageCommercialeResponse): void {
    data.elements.forEach(e => this.item(e.element).patchValue(e));
    this.form.patchValue({ remarques_generales: data.data?.remarques_generales ?? null });
  }

  // ── Choix en boutons (plus faciles au doigt qu'une liste déroulante) ───────

  isChosen(id: number, key: ChoiceKey, value: string | boolean): boolean {
    return this.item(id).get(key)?.value === value;
  }

  /** Choisit une valeur ; toucher à nouveau la valeur choisie l'efface */
  pick(id: number, key: ChoiceKey, value: string | boolean): void {
    if (this.readOnly) return;
    const control = this.item(id).get(key)!;
    control.setValue(control.value === value ? null : value);
    control.markAsDirty();
  }

  // ── Résumé calculé (comme la fiche papier) ──────────────────────────────────

  private count(predicate: (e: ImageElement) => boolean): number {
    return this.elements.getRawValue().filter(predicate).length;
  }

  get existant(): number { return this.count(e => e.existe === 'oui'); }
  get inexistant(): number { return this.count(e => e.existe === 'non'); }
  get besoinAide(): number { return this.count(e => e.besoin === true); }

  // ── Actions ─────────────────────────────────────────────────────────────────

  save(): void {
    this.alertMessage = '';
    if (this.readOnly || this.preview) return;
    const v =this.form.getRawValue();
    const payload = {
      cons_id: this.userId,
      comp_id: this.companyId,
      remarques_generales: v.remarques_generales,
      elements: (v.elements as ImageElement[]).filter(e => e.existe || e.situation || e.besoin !== null || e.observations)
    };

    this.isSaving = true;
    this.toolService.saveImageCommerciale(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.showAlert("Le diagnostic d'image commerciale a été enregistré.", 'success');
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

  private showAlert(message: string, type: 'success' | 'danger'): void {
    this.alertMessage = message;
    this.alertType = type;
    if (isPlatformBrowser(this.platformId)) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goBack(): void {
    history.back();
  }
}
