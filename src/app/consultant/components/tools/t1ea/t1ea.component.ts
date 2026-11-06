import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ConsultantService } from '../../../consultant.service';
import { StorageService } from '../../../../_services/storage.service';
import { LivrableReviewComponent } from '../../../../shared/components/livrable-review/livrable-review.component';
import { LoadingComponent, LoadErrorComponent } from '../../../../shared/components/loading/loading.component';
import { PreviewBannerComponent } from '../../../../shared/components/preview-banner/preview-banner.component';
import {
  BPF_APPRECIATIONS, BPF_MAX_ACTIONS, BPF_MODE_EMPLOI, BpfItem, BpfResponse, BpfScore, bpfScore, bpfTotal
} from '../../../../core/model/bpf';
import { BPF_CATEGORIES } from '../../../../core/model/bpf-content';
import { hasManagerRole } from '../../../../core/roles';

type Tab = 'inspection' | 'rapport';
type Choice = 'conforme' | 'partiel' | 'non_conforme' | 'na';
type ItemState = Choice | 'vide';

/**
 * Outil 1E_a « Diagnostic BPF » (bonnes pratiques de fabrication) : 92 exigences en 9 catégories évaluées pendant la visite (onglet Inspection),
 * puis le rapport (résultats calculés en direct, conclusions et recommandations par catégorie, remarques, actions prioritaires).
 * Un seul passage par consultant et par entreprise ; les managers et modérateurs consultent en lecture seule.
 * Une réponse = des points entiers de 0 au maximum de l'exigence, ou « non applicable » (l'exigence sort alors du calcul).
 */
@Component({
  selector: 'app-t1ea',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LivrableReviewComponent, LoadingComponent, LoadErrorComponent, PreviewBannerComponent],
  templateUrl: './t1ea.component.html',
  styleUrl: './t1ea.component.scss'
})
export class T1eaComponent implements OnInit, OnDestroy {

  readonly categories = BPF_CATEGORIES;
  readonly appreciations = BPF_APPRECIATIONS;
  readonly modeEmploi = BPF_MODE_EMPLOI;
  readonly maxActions = BPF_MAX_ACTIONS;
  readonly itemCount = BPF_CATEGORIES.reduce((n, c) => n + c.items.length, 0);
  readonly choices: { value: Choice; label: string }[] = [
    { value: 'conforme', label: 'Conforme' },
    { value: 'partiel', label: 'Partiel' },
    { value: 'non_conforme', label: 'Non conforme' },
    { value: 'na', label: 'Non applicable' },
  ];
  /** Exigences par identifiant interne (1 à 92) */
  private readonly itemsById = new Map<number, BpfItem>(BPF_CATEGORIES.flatMap(c => c.items.map(i => [i.id, i] as [number, BpfItem])));

  form!: FormGroup;

  /** Scores par catégorie (même ordre que `categories`) et score global, recalculés à chaque réponse */
  scores: BpfScore[] = [];
  total: BpfScore = bpfTotal([]);

  companyId = 0;
  companyName = '';
  consultantName = '';

  isLoading = true;
  loadError = false;
  isSaving = false;
  readOnly = true;
  /** Aperçu manager : outil vierge, utilisable mais jamais enregistré */
  preview = false;
  /** Impression en cours : toutes les parties sont dépliées et affichées */
  printing = false;

  alertMessage = '';
  alertType: 'success' | 'danger' = 'success';

  // Affichage : onglet, catégorie ouverte (une seule à la fois), aides et remarques dépliées
  tab: Tab = 'inspection';
  openCat: number | null = 1;
  openReco: number | null = null;
  showGuide = false;
  /** Détail par catégorie du bloc « Résultats en direct » (replié : seul le résultat global est affiché) */
  showLive = false;
  guideOpen = new Set<number>();
  noteOpen = new Set<number>();

  /** Consultant dont on affiche le diagnostic (lui-même, ou celui choisi par un manager) */
  consultantId = 0;
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
      if (this.preview) this.fill({ data: null, items: [], categories: [], actions: [], company: null, consultant: null });
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
    this.toolService.fetchBpf(this.consultantId, this.companyId).subscribe({
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
    const items = this.categories.flatMap(c => c.items.map(i =>
      this.fb.group({ item: [i.id], points: [null as number | null], na: [false], observations: [null as string | null] })));
    const cats = this.categories.map(c => this.fb.group({ cat: [c.id], conclusions: [null as string | null], recommandations: [null as string | null] }));
    this.form = this.fb.group({
      date_evaluation: [null as string | null],
      remarques_generales: [null as string | null],
      items: this.fb.array(items),
      categories: this.fb.array(cats),
      actions: this.fb.array([] as FormControl[])
    });
    this.form.valueChanges.subscribe(() => this.recompute());
    this.recompute();
  }

  get itemsArray(): FormArray {
    return this.form.get('items') as FormArray;
  }

  get actions(): FormArray {
    return this.form.get('actions') as FormArray;
  }

  /** Groupe du formulaire d'une exigence (identifiants internes de 1 à 92, dans l'ordre du tableau) */
  item(id: number): FormGroup {
    return this.itemsArray.at(id - 1) as FormGroup;
  }

  /** Groupe des conclusions / recommandations d'une catégorie */
  catText(cat: number): FormGroup {
    return (this.form.get('categories') as FormArray).at(cat - 1) as FormGroup;
  }

  private fill(data: BpfResponse): void {
    this.form.patchValue({
      date_evaluation: data.data?.date_evaluation ?? new Date().toISOString().slice(0, 10),
      remarques_generales: data.data?.remarques_generales ?? null
    });
    data.items.forEach(a => { if (this.itemsById.has(a.item)) this.item(a.item).patchValue({ points: a.points, na: !!a.na, observations: a.observations }); });
    data.categories.forEach(c => { if (c.cat >= 1 && c.cat <= this.categories.length) this.catText(c.cat).patchValue({ conclusions: c.conclusions, recommandations: c.recommandations }); });
    data.actions.forEach(a => this.actions.push(new FormControl(a.action)));
    if (!this.readOnly && this.actions.length === 0) this.addAction();   // une action au départ ; le consultant en ajoute (10 au plus)
    this.form.markAsPristine();
    this.recompute();
  }

  private recompute(): void {
    const raw = this.itemsArray.getRawValue() as { item: number; points: number | null; na: boolean }[];
    const byId = new Map(raw.map(r => [r.item, r]));
    this.scores = this.categories.map(c => bpfScore(c.items, id => byId.get(id)));
    this.total = bpfTotal(this.scores);
  }

  // ── Réponses en boutons ─────────────────────────────────────────────────────

  maxOf(id: number): number {
    return this.itemsById.get(id)!.max;
  }

  points(id: number): number | null {
    return this.item(id).get('points')!.value as number | null;
  }

  state(id: number): ItemState {
    const v = this.item(id).getRawValue() as { points: number | null; na: boolean };
    if (v.na) return 'na';
    if (typeof v.points !== 'number') return 'vide';
    const max = this.maxOf(id);
    return v.points >= max ? 'conforme' : v.points <= 0 ? 'non_conforme' : 'partiel';
  }

  /** Choisit une réponse ; toucher à nouveau la réponse choisie l'efface. « Partiel » commence à la moitié des points. */
  pick(id: number, choice: Choice): void {
    if (this.readOnly) return;
    const group = this.item(id);
    const max = this.maxOf(id);
    if (this.state(id) === choice) group.patchValue({ points: null, na: false });
    else if (choice === 'na') group.patchValue({ points: null, na: true });
    else group.patchValue({ na: false, points: choice === 'conforme' ? max : choice === 'non_conforme' ? 0 : Math.floor(max / 2) });
    group.markAsDirty();
  }

  private setPoints(id: number, value: number): void {
    const next = Math.min(this.maxOf(id), Math.max(0, Math.round(value)));
    const group = this.item(id);
    group.patchValue({ points: next, na: false });
    group.markAsDirty();
  }

  step(id: number, delta: number): void {
    if (this.readOnly) return;
    this.setPoints(id, (this.points(id) ?? 0) + delta);
  }

  /** Saisie directe des points : ramenés entre 0 et le maximum ; un champ vidé efface la réponse */
  typePoints(id: number, input: HTMLInputElement): void {
    if (this.readOnly) return;
    if (input.value.trim() === '') {
      this.item(id).patchValue({ points: null });
      this.item(id).markAsDirty();
      return;
    }
    const n = Number(input.value.replace(',', '.'));
    if (Number.isNaN(n)) { input.value = String(this.points(id) ?? ''); return; }
    this.setPoints(id, n);
    input.value = String(this.points(id));   // si la valeur saisie a été ramenée au maximum, le champ la montre
  }

  // ── Remarques et consignes ──────────────────────────────────────────────────

  obsText(id: number): string {
    return String(this.item(id).get('observations')!.value ?? '').trim();
  }

  noteVisible(id: number): boolean {
    return this.noteOpen.has(id) || this.obsText(id) !== '';
  }

  toggleNote(id: number): void {
    this.noteOpen.has(id) ? this.noteOpen.delete(id) : this.noteOpen.add(id);
  }

  toggleGuide(id: number): void {
    this.guideOpen.has(id) ? this.guideOpen.delete(id) : this.guideOpen.add(id);
  }

  // ── Résultats ───────────────────────────────────────────────────────────────

  /** Exigences traitées (évaluées ou « non applicables ») d'une catégorie */
  done(catId: number): number {
    const s = this.scores[catId - 1];
    return s.evaluees + s.nonApplicables;
  }

  get treated(): number {
    return this.total.evaluees + this.total.nonApplicables;
  }

  /** Les résultats sont provisoires tant qu'une exigence n'est pas évaluée */
  get provisional(): boolean {
    return this.treated < this.total.total;
  }

  /** Étiquette et couleur d'une appréciation ; « Non évalué » quand rien n'est noté, « Sans objet » quand tout est non applicable */
  status(s: BpfScore): { label: string; cls: string } {
    const a = this.appreciations.find(x => x.value === s.appreciation);
    if (a) return { label: a.label, cls: a.value };
    return { label: s.total > 0 && s.nonApplicables === s.total ? 'Sans objet' : 'Non évalué', cls: 'none' };
  }

  fmtPct(taux: number | null): string {
    return taux === null ? '—' : (taux * 100).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %';
  }

  /** Largeur de la barre (0-100 %) */
  pct(taux: number | null): number {
    return taux === null ? 0 : Math.round(taux * 1000) / 10;
  }

  /** Réponse en toutes lettres (impression) */
  answerText(id: number): string {
    const max = this.maxOf(id);
    switch (this.state(id)) {
      case 'conforme': return `Conforme : ${max} / ${max} points`;
      case 'partiel': return `Partiel : ${this.points(id)} / ${max} points`;
      case 'non_conforme': return `Non conforme : 0 / ${max} points`;
      case 'na': return 'Non applicable';
      default: return 'Non évalué';
    }
  }

  // ── Rapport ─────────────────────────────────────────────────────────────────

  hasReco(cat: number): boolean {
    const v = this.catText(cat).getRawValue() as { conclusions: string | null; recommandations: string | null };
    return !!(String(v.conclusions ?? '').trim() || String(v.recommandations ?? '').trim());
  }

  recoText(cat: number, field: 'conclusions' | 'recommandations'): string {
    return String(this.catText(cat).get(field)!.value ?? '').trim();
  }

  toggleReco(cat: number): void {
    this.openReco = this.openReco === cat ? null : cat;
  }

  isRecoOpen(cat: number): boolean {
    return this.openReco === cat || this.printing;
  }

  get remarques(): string {
    return String(this.form.get('remarques_generales')!.value ?? '').trim();
  }

  get dateEvaluation(): string {
    const d = this.form.get('date_evaluation')!.value as string | null;
    const parsed = d ? new Date(d + 'T00:00:00') : null;
    return parsed && !isNaN(parsed.getTime()) ? parsed.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  }

  addAction(): void {
    if (this.actions.length < this.maxActions) this.actions.push(new FormControl(''));
  }

  removeAction(index: number): void {
    this.actions.removeAt(index);
    this.form.markAsDirty();
  }

  /** Actions prioritaires renseignées (impression) */
  get filledActions(): string[] {
    return (this.actions.getRawValue() as (string | null)[]).map(a => String(a ?? '').trim()).filter(a => a);
  }

  // ── Affichage ───────────────────────────────────────────────────────────────

  isCatOpen(id: number): boolean {
    return this.openCat === id || this.printing;
  }

  toggleCat(id: number): void {
    this.openCat = this.openCat === id ? null : id;
    if (this.openCat !== null) this.scrollTo('bp-cat-' + id);
  }

  /** Catégorie suivante ; après la dernière, on passe au rapport */
  nextCat(id: number): void {
    if (id >= this.categories.length) { this.goTab('rapport'); return; }
    this.openCat = id + 1;
    this.scrollTo('bp-cat-' + (id + 1));
  }

  /** Change d'onglet. En ouvrant le rapport, la fiche est enregistrée d'abord si elle a changé (comme le Diagnostic général). */
  goTab(tab: Tab): void {
    if (tab === this.tab) return;
    this.tab = tab;
    this.alertMessage = '';
    if (tab === 'rapport' && this.form.dirty && !this.readOnly && !this.preview) this.save(true);
    if (isPlatformBrowser(this.platformId)) window.scrollTo({ top: 0 });
  }

  private scrollTo(elementId: string): void {
    if (isPlatformBrowser(this.platformId)) setTimeout(() => document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  save(auto = false): void {
    if (!auto) this.alertMessage = '';
    if (this.readOnly || this.preview || this.isSaving) return;
    const v = this.form.getRawValue();
    const payload = {
      cons_id: this.userId,
      comp_id: this.companyId,
      date_evaluation: v.date_evaluation,
      remarques_generales: v.remarques_generales,
      items: (v.items as { item: number; points: number | null; na: boolean; observations: string | null }[])
        .filter(i => i.points !== null || i.na || String(i.observations ?? '').trim()),
      categories: (v.categories as { cat: number; conclusions: string | null; recommandations: string | null }[])
        .filter(c => String(c.conclusions ?? '').trim() || String(c.recommandations ?? '').trim()),
      actions: (v.actions as (string | null)[]).map(a => String(a ?? '').trim()).filter(a => a)
    };

    this.isSaving = true;
    this.toolService.saveBpf(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.form.markAsPristine();
        this.showAlert(auto ? 'Vos réponses ont été enregistrées.' : 'Le diagnostic BPF a été enregistré.', 'success', !auto);
      },
      error: err => {
        this.isSaving = false;
        this.showAlert(err.error?.errors?.join(' · ') ?? err.error?.message ?? 'Une erreur est survenue. Veuillez réessayer.', 'danger', true);
      }
    });
  }

  /** Imprimer / PDF : toute la fiche (résultats, conclusions, détail des 92 réponses), quelle que soit la partie affichée à l'écran */
  print(): void {
    if (!isPlatformBrowser(this.platformId) || this.printing) return;
    this.printing = true;
    const done = () => { this.printing = false; window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    // Laisse le temps d'afficher toutes les parties avant d'ouvrir la fenêtre d'impression
    setTimeout(() => window.print(), 350);
  }

  private showAlert(message: string, type: 'success' | 'danger', scroll: boolean): void {
    this.alertMessage = message;
    this.alertType = type;
    if (scroll && isPlatformBrowser(this.platformId)) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goBack(): void {
    history.back();
  }
}
