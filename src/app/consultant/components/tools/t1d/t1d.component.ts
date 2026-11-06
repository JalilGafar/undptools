import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Color, NgxChartsModule, ScaleType, LegendPosition } from '@swimlane/ngx-charts';
import { map, Observable, tap } from 'rxjs';
import { ToolAttrib } from '../../../../core/model/toolAttrib';
import { Router } from '@angular/router';
import { StorageService } from '../../../../_services/storage.service';
import { ConsultantService } from '../../../consultant.service';
import { IntegLabel } from '../../../../core/model/mat_integ_label';
import { ToolMatDiagInteg } from '../../../../core/model/tool1D';
import { curveLinearClosed } from 'd3-shape';
import { LoadingComponent, LoadErrorComponent } from '../../../../shared/components/loading/loading.component';
import { LoadState } from '../../../../core/load-state';
import { LivrableReviewComponent } from '../../../../shared/components/livrable-review/livrable-review.component';
import { PreviewBannerComponent } from '../../../../shared/components/preview-banner/preview-banner.component';
import { hasManagerRole } from '../../../../core/roles';

/** Domaines évalués : plages de questions (reper). 60 questions au total ; les éléments 61 à 64 sont les rubriques SWOT. */
const DOMAINES = [
  { label: 'Situation juridique et fiscale', short: 'Juridique et fiscal', from: 1, to: 4 },
  { label: 'Leadership et climat organisationnel', short: 'Leadership', from: 5, to: 12 },
  { label: "Organisation de l'entreprise", short: 'Organisation', from: 13, to: 20 },
  { label: 'Finance et comptabilité', short: 'Finance', from: 21, to: 28 },
  { label: 'Planification stratégique', short: 'Planification', from: 29, to: 35 },
  { label: 'Production et opérations', short: 'Production', from: 36, to: 43 },
  { label: 'Assurance qualité', short: 'Qualité', from: 44, to: 50 },
  { label: 'Commercialisation', short: 'Commercial', from: 51, to: 60 },
];

/** Les 5 réponses possibles ; la note correspondante est attribuée automatiquement (non modifiable). */
const REPONSES = [
  { value: 1, label: 'Insuffisant' },
  { value: 2, label: 'À améliorer' },
  { value: 3, label: 'Suffisant' },
  { value: 4, label: 'Bon' },
  { value: 5, label: 'Excellent' },
];

const QUESTION_COUNT = 60;
const MAX_NOTE = 5;

/**
 * « Champ des recommandations » (page Résumé de l'outil original), tout est facultatif : conclusions et lacunes, recommandations
 * et problèmes identifiés. Un seul élément de chaque liste au départ ; le consultant en ajoute à son gré, 15 au plus.
 * Chaque problème garde 2 lignes (référence, indicateur, valeur initiale, prévision) comme sur la feuille d'origine.
 */
const RECO_MAX = 15;
const RECO_LIGNES = 2;
type RecoList = 'conclusions' | 'recommandations' | 'problemes';

/** Un problème identifié, tel qu'il est imprimé (cases vides écartées) */
interface PrintProblem {
  probleme: string;
  lignes: { reference: string; indicateur: string; valeur_initiale: string; prevision: string }[];
}

/** Les recommandations en texte lisible pour l'impression (les zones de saisie couperaient les textes longs) */
interface PrintReco {
  conclusions: string[];
  recommandations: string[];
  problemes: PrintProblem[];
  empty: boolean;
}


@Component({
  selector: 'app-t1d',
  standalone: true,
  imports: [
    LivrableReviewComponent, LoadingComponent, LoadErrorComponent, PreviewBannerComponent, CommonModule,
    ReactiveFormsModule,
    NgxChartsModule,
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './t1d.component.html',
  styleUrl: './t1d.component.scss'
})
export class T1dComponent implements OnInit,  OnDestroy {
  toolState$!: Observable<LoadState>;

  private destroyRef = inject(DestroyRef);

  showAlert: boolean = false;
  alertType: string = 'info'; // e.g., 'success', 'danger', 'warning'
  alertMessage: string = '';
  dismissible: boolean = true;

  consultanId!: number;
  userId!: number;


  // ********* NGX CHART
  // single: any[];
  // Graphique polaire : un seul polygone, le score (%) de chaque domaine. Les anneaux de la grille tombent
  // tous les 20 % et correspondent donc aux 5 niveaux de réponse (Insuffisant 20 % … Excellent 100 %).
  single = [
    { name: 'Score', series: DOMAINES.map(d => ({ name: d.short, value: 0 })) }
  ];

  // options
  legend: boolean = false;
  readonly pctTick = (v: number | string): string => `${v} %`;
  showLabels: boolean = false;
  animations: boolean = false;
  xAxis: boolean = true;
  yAxis: boolean = true;
  showYAxisLabel: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = 'Year';
  yAxisLabel: string = 'Population';
  roundDomains: boolean = true;
  legendPosition: LegendPosition = LegendPosition.Below;
  curveLinearClosed = curveLinearClosed;

  view: [number, number] = [400, 300];
  texte: boolean = false;
  // legendPosition: LegendPosition = ;
  colorScheme: Color = {
    name: 'customScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#1a56db']
  };


  matIntegForm!: FormGroup;
  infoEntrepriseForm!: FormGroup;
  noteControl = new FormControl(0); // valeur par défaut
  ticks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];        // graduations

  rawData = `[ 
    {plage: "0", label: "L'entreprise a moins de 3 employés"},
    {plage: "5", label: "L'entreprise a entre 5 et 3 employés"},
    {plage: "7",label: "L'entreprise a entre 10 et 5 employés"},
    {plage: "10",label: "L'entreprise a plus de 10 employés"}
  ]`;

  converted = '';


  ponderation = [
    {
      domaine: "Ressource opérationelles disponibles",
      libele: "Équipements et installations disponibles pour maintenir les opérations",
    },
    {
      domaine: "Marketing",
      libele: "Nombre d'employés",
    },
    {
      domaine: "Marketing",
      libele: "Nombre de veste",
    }

  ]

  currentIndex: number = 0; //  index de l'attribut affiché
  visited = new Set<number>();

  // ── Affichage (mobile-first) ────────────────────────────────────────────────
  /** « resume » : scores et graphique ; « form » : questionnaire (une question à la fois) */
  mode: 'resume' | 'form' = 'resume';
  showDetail = false;
  /** Résumé : section « Conclusions et recommandations » déroulée */
  showReco = false;
  isSaving = false;
  isSavingReco = false;
  /** Le consultant a choisi de remplir les recommandations (Résumé, quand aucune n'est encore saisie) */
  recoEditing = false;
  // ── Impression ──────────────────────────────────────────────────────────────
  /** Renseigné le temps de l'impression : le détail des réponses et les recommandations (en texte) sont alors affichés en entier */
  printReco: PrintReco | null = null;
  companyName = '';
  consultantLabel = '';
  printDate = '';
  diagnosticDate = '';
  /** Retour de l'enregistrement automatique des réponses, affiché en haut de la dernière étape */
  resultsNotice: { type: 'success' | 'danger' | 'info'; text: string } | null = null;
  /** Les réponses ont été enregistrées depuis cette page (avant même que la liste du Résumé soit rechargée) */
  private savedOnce = false;
  /** Le Résumé affiche d'anciennes données : à recharger à son ouverture */
  private dataStale = false;
  /** Retour d'enregistrement affiché sous le bouton des recommandations (visible sans remonter en haut de page) */
  recoNotice: { type: 'success' | 'danger'; text: string } | null = null;

  readonly domaines = DOMAINES;
  readonly reponses = REPONSES;
  readonly totalQuestions = QUESTION_COUNT;

  /** Rubriques SWOT : éléments 61 à 64 du questionnaire */
  readonly swot: Record<number, { key: string; label: string }> = {
    61: { key: 'difficult', label: 'Difficulté' },
    62: { key: 'force', label: 'Force' },
    63: { key: 'faiblesse', label: 'Faiblesse' },
    64: { key: 'besoin', label: 'Besoin' },
  };
  readonly swotReps = [61, 62, 63, 64];
  readonly swotRows = [1, 2, 3];

  /** Champ des recommandations : conclusions et lacunes, recommandations, problèmes identifiés (3 × 2 lignes) */
  recoForm!: FormGroup;

  /**
   * Aperçu manager : un manager / modérateur qui ouvre l'outil depuis le menu (sans entreprise) le voit comme un consultant
   * et peut le remplir pour en juger la qualité, mais rien n'est enregistré.
   */
  get preview(): boolean {
    const roles: string[] = this.storageService.getUser()?.roles ?? [];
    return hasManagerRole(roles) && !this.storageService.CompanyId;
  }

  get printing(): boolean { return this.printReco !== null; }

  /** Le bouton « Imprimer / PDF » est proposé quand un diagnostic enregistré est affiché dans le Résumé */
  get canPrint(): boolean { return this.mode === 'resume' && (this.matDiagIntegData?.length ?? 0) > 0; }

  /** Peut remplir les champs (le consultant concerné, ou un manager en aperçu, sans enregistrement) */
  get canFill(): boolean { return !this.readOnly; }

  /** Peut enregistrer : le consultant concerné, hors aperçu */
  get canSave(): boolean { return !this.readOnly && !this.preview; }

  /** Pourquoi la saisie est impossible (affiché à la place du bouton « remplir ») */
  get readOnlyReason(): string {
    const wave = this.storageService.LockedWaveName;
    return wave
      ? `${wave} est clôturée : les saisies sont verrouillées. L'administrateur peut la rouvrir.`
      : 'Seul le consultant en charge de cette entreprise peut remplir cette partie.';
  }

  /**
   * Champs des recommandations affichés ? Oui dès qu'il y a du contenu, ou quand celui qui peut remplir l'a demandé
   * (bouton du Résumé) ou arrive de la dernière étape du questionnaire. Sinon : le message « aucune conclusion » et son bouton.
   */
  get recoShown(): boolean {
    return this.recoHasContent() || (this.canFill && (this.recoEditing || this.finalStep));
  }

  /** Seul le consultant concerné modifie ; un manager (ou un autre utilisateur) consulte en lecture seule. */
  get readOnly(): boolean {
    if (this.preview) return false;
    // Vague clôturée : lecture seule pour le consultant lui-même
    return (this.consultanId !== 0 && this.consultanId != this.userId) || this.storageService.CompanyLocked;
  }

  /** Numéros de questions d'un domaine */
  range(d: { from: number; to: number }): number[] {
    return Array.from({ length: d.to - d.from + 1 }, (_, i) => d.from + i);
  }

  libelle(n: number): string {
    return this.matIntegLabel?.find(l => l.reper === n)?.libele ?? '';
  }

  /** Note enregistrée (1 à 5) ; 0 = question sans réponse */
  note(data: ToolMatDiagInteg, n: number): number {
    return Number(data['note_' + n]) || 0;
  }

  comment(data: ToolMatDiagInteg, n: number): string {
    return (data['comt_' + n] ?? '').toString().trim();
  }

  /** Nombre de questions répondues dans un domaine */
  answered(data: ToolMatDiagInteg, d: { from: number; to: number }): number {
    return this.range(d).filter(n => this.note(data, n) > 0).length;
  }

  /** Nombre total de questions répondues dans une évaluation enregistrée */
  answeredTotal(data: ToolMatDiagInteg): number {
    return DOMAINES.reduce((sum, d) => sum + this.answered(data, d), 0);
  }

  /** Moyenne /5 d'un domaine, calculée sur les questions répondues (0 si aucune) */
  average(data: ToolMatDiagInteg, d: { from: number; to: number }): number {
    const notes = this.range(d).map(n => this.note(data, n)).filter(v => v > 0);
    return notes.length ? notes.reduce((a, b) => a + b, 0) / notes.length : 0;
  }

  /** Libellé de la réponse correspondant à une note */
  reponseLabel(v: number): string {
    return REPONSES.find(r => r.value === Math.round(v))?.label ?? 'Sans réponse';
  }

  /** Niveau de couleur de 0 (sans réponse) à 5, d'après une note de 1 à 5 */
  levelOfNote(v: number): number {
    return v > 0 ? Math.min(5, Math.max(1, Math.round(v))) : 0;
  }

  /** Niveau de couleur de 0 à 5, d'après un pourcentage */
  levelOfPct(p: number): number {
    return p > 0 ? Math.min(5, Math.max(1, Math.ceil(p / 20))) : 0;
  }

  get progress(): number {
    return this.matIntegLength ? Math.min(100, Math.round((this.currentIndex + 1) * 100 / this.matIntegLength)) : 0;
  }

  /**
   * Dernière étape du questionnaire : atteinte une fois le dernier élément (le 64e) passé. Elle montre les graphiques,
   * le champ des recommandations et, seulement ici, le bouton « Enregistrer l'outil ».
   */
  get finalStep(): boolean {
    return !!this.matIntegLength && this.currentIndex >= this.matIntegLength;
  }

  /** Note de la question n dans le formulaire (0 = sans réponse) */
  noteValue(n: number): number {
    return Number(this.matIntegForm.get('note_' + n)?.value) || 0;
  }

  /** Nombre de questions répondues dans le formulaire */
  get answeredCount(): number {
    let count = 0;
    for (let n = 1; n <= QUESTION_COUNT; n++) if (this.noteValue(n) > 0) count++;
    return count;
  }

  /** Va à la première question sans réponse (pour reprendre un remplissage partiel) */
  goToFirstUnanswered(): void {
    for (let n = 1; n <= QUESTION_COUNT; n++) {
      if (this.noteValue(n) === 0) {
        this.currentIndex = n - 1;
        return;
      }
    }
  }

  fmtNote(v: number): string {
    return v.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  }

  /** Score de chaque domaine en %, d'après les questions répondues : moyenne ÷ 5 × 100 */
  private pctOf(el: ToolMatDiagInteg): number[] {
    return DOMAINES.map(d => Math.round(this.average(el, d) * 100 / MAX_NOTE * 10) / 10);
  }

  /** Nouvelle référence à chaque fois : ngx-charts ne redessine pas toujours après une mutation en place */
  private resultsOf(pct: number[]) {
    return [{ name: 'Score', series: DOMAINES.map((d, i) => ({ name: d.short, value: pct[i] })) }];
  }

  /** Scores du diagnostic enregistré (page Résumé) */
  private computeScores(el: ToolMatDiagInteg): void {
    this.scores = this.pctOf(el);
    this.single = this.resultsOf(this.scores);
  }

  /** Scores d'après les réponses en cours de saisie (dernière étape du questionnaire, avant l'enregistrement) */
  refreshLive(): void {
    this.liveScores = this.pctOf(this.matIntegForm.getRawValue() as ToolMatDiagInteg);
    this.liveSingle = this.resultsOf(this.liveScores);
  }

  /** Les notes lues en base doivent être des nombres pour que la réponse correspondante soit cochée. */
  private normalizeNotes(): void {
    for (let n = 1; n <= QUESTION_COUNT; n++) {
      const c = this.matIntegForm.get('note_' + n);
      if (c) c.setValue(Number(c.value) || 0, { emitEvent: false });
    }
  }

  matDiagIntegData$!: Observable<ToolMatDiagInteg[]>;
  matDiagIntegData!: ToolMatDiagInteg[];

  matIntegLabel$!: Observable<IntegLabel[]>;
  matIntegLabel!: IntegLabel[];
  matIntegLength!: number;


  /** Score en % de chaque domaine, d'après le diagnostic enregistré */
  scores: number[] = DOMAINES.map(() => 0);
  /** Idem, d'après les réponses en cours de saisie (dernière étape) */
  liveScores: number[] = DOMAINES.map(() => 0);
  liveSingle = this.resultsOf(this.liveScores);
Array: any;
private _: any;

  constructor(
    private formBuilder: FormBuilder,
    private toolService: ConsultantService,
    private storageService: StorageService,
    private appRout: Router
  ) {
    Object.assign(this.single)
  }

  get personnelArray(): FormArray<FormGroup> {
    return this.infoEntrepriseForm.get('personnel') as FormArray<FormGroup>;
  }

  private createPersonnelRow(): FormGroup {
    return this.formBuilder.group({
      nom_poste: [null],
      nom_personne: [null],
      temps_poste: [null],
      activites: [null]
    });
  }

  addPersonnel(): void {
    this.personnelArray.push(this.createPersonnelRow());
  }

  removePersonnel(index: number): void {
    if (this.personnelArray.length > 1) {
      this.personnelArray.removeAt(index);
    }
  }

  private createRecoLine(): FormGroup {
    return this.formBuilder.group({ reference: [''], indicateur: [''], valeur_initiale: [''], prevision: [''] });
  }

  private createRecoProblem(): FormGroup {
    return this.formBuilder.group({
      probleme: [''],
      lignes: this.formBuilder.array(Array.from({ length: RECO_LIGNES }, () => this.createRecoLine()))
    });
  }

  /** Un seul élément de chaque liste au départ : le consultant en ajoute autant qu'il le souhaite (15 au plus) */
  private buildRecoForm(): FormGroup {
    return this.formBuilder.group({
      conclusions: this.formBuilder.array([this.formBuilder.control('')]),
      recommandations: this.formBuilder.array([this.formBuilder.control('')]),
      problemes: this.formBuilder.array([this.createRecoProblem()])
    });
  }

  get conclusionsCtrls(): FormControl<string | null>[] { return (this.recoForm.get('conclusions') as FormArray<FormControl<string | null>>).controls; }
  get recommandationsCtrls(): FormControl<string | null>[] { return (this.recoForm.get('recommandations') as FormArray<FormControl<string | null>>).controls; }
  get problemesCtrls(): FormGroup[] { return (this.recoForm.get('problemes') as FormArray<FormGroup>).controls; }
  lignesCtrls(problem: FormGroup): FormGroup[] { return (problem.get('lignes') as FormArray<FormGroup>).controls; }

  readonly recoMax = RECO_MAX;

  /** Ajoute un élément à une liste (15 au plus) et place le curseur dessus */
  addReco(list: RecoList): void {
    const arr = this.recoForm.get(list) as FormArray;
    if (!this.canFill || arr.length >= RECO_MAX) return;
    arr.push(list === 'problemes' ? this.createRecoProblem() : this.formBuilder.control(''));
    this.recoForm.markAsDirty();
    const id = list === 'problemes' ? `reco-pb-${arr.length - 1}` : `reco-${list}-${arr.length - 1}`;
    if (typeof document !== 'undefined') setTimeout(() => document.getElementById(id)?.focus(), 60);
  }

  /** Retire un élément d'une liste ; il en reste toujours au moins un */
  removeReco(list: RecoList, index: number): void {
    const arr = this.recoForm.get(list) as FormArray;
    if (!this.canFill || arr.length <= 1) return;
    arr.removeAt(index);
    this.recoForm.markAsDirty();
  }

  private isFilled(v: unknown): boolean {
    return Array.isArray(v) ? v.some(x => this.isFilled(x))
      : v && typeof v === 'object' ? Object.values(v).some(x => this.isFilled(x))
      : typeof v === 'string' && v.trim() !== '';
  }

  /** Vrai dès qu'une case du champ des recommandations est remplie */
  recoHasContent(): boolean {
    return this.isFilled(this.recoForm.getRawValue());
  }

  /** Remplit le formulaire avec les recommandations enregistrées (JSON en base) ; sans effet si rien n'a été saisi ou si l'on est en train d'y écrire */
  private patchReco(raw: string | null | undefined): void {
    if (!raw || this.recoForm.dirty) return;
    try {
      const saved = JSON.parse(raw);
      if (saved && typeof saved === 'object') this.applyReco(saved);
    } catch { /* texte illisible : on laisse les champs vides plutôt que de bloquer l'outil */ }
  }

  /**
   * Reconstruit les listes d'après l'enregistrement : autant d'éléments que d'éléments enregistrés (au moins un, 15 au plus).
   * Les anciens enregistrements, qui comptaient 4 conclusions, 4 recommandations et 3 problèmes dont certains vides, sont raccourcis.
   */
  private applyReco(saved: Record<string, unknown>): void {
    const kept = <T>(list: unknown): T[] => {
      const out = (Array.isArray(list) ? list : []).slice(0, RECO_MAX) as T[];
      while (out.length && !this.isFilled(out[out.length - 1])) out.pop();
      return out;
    };
    for (const name of ['conclusions', 'recommandations'] as const) {
      const values = kept<unknown>(saved[name]).map(v => typeof v === 'string' ? v : '');
      const arr = this.recoForm.get(name) as FormArray;
      arr.clear({ emitEvent: false });
      (values.length ? values : ['']).forEach(v => arr.push(this.formBuilder.control(v), { emitEvent: false }));
    }
    const problems = kept<Record<string, unknown>>(saved['problemes']);
    const arr = this.recoForm.get('problemes') as FormArray;
    arr.clear({ emitEvent: false });
    (problems.length ? problems : [{}]).forEach(p => {
      const group = this.createRecoProblem();
      if (p && typeof p === 'object') group.patchValue(p, { emitEvent: false });
      arr.push(group, { emitEvent: false });
    });
    // Les nouveaux champs naissent actifs : en lecture seule on désactive à nouveau l'ensemble
    if (this.readOnly) this.recoForm.disable({ emitEvent: false });
  }

  /** Entrée dans une case courte : ne valide pas le questionnaire (les zones de texte gardent leur retour à la ligne) */
  blockEnter(event: Event): void {
    if ((event.target as HTMLElement).tagName === 'INPUT') event.preventDefault();
  }

  ngOnInit(): void {
    this.toolState$ = this.toolService.toolState$;
    this.infoEntrepriseForm = this.formBuilder.group({
      personnel: this.formBuilder.array([this.createPersonnelRow()])
    });
    this.recoForm = this.buildRecoForm();

    this.matIntegForm = this.formBuilder.group({
      note_1: [0],
      comt_1: [null],
      note_2: [0],
      comt_2: [null],
      note_3: [0],
      comt_3: [null],
      note_4: [0],
      comt_4: [null],
      note_5: [0],
      comt_5: [null],
      note_6: [0],
      comt_6: [null],
      note_7: [0],
      comt_7: [null],
      note_8: [0],
      comt_8: [null],
      note_9: [0],
      comt_9: [null],
      note_10: [0],
      comt_10: [null],
      note_11: [0],
      comt_11: [null],
      note_12: [0],
      comt_12: [null],
      note_13: [0],
      comt_13: [null],
      note_14: [0],
      comt_14: [null],
      note_15: [0],
      comt_15: [null],
      note_16: [0],
      comt_16: [null],
      note_17: [0],
      comt_17: [null],
      note_18: [0],
      comt_18: [null],
      note_19: [0],
      comt_19: [null],
      note_20: [0],
      comt_20: [null],
      note_21: [0],
      comt_21: [null],
      note_22: [0],
      comt_22: [null],
      note_23: [0],
      comt_23: [null],
      note_24: [0],
      comt_24: [null],
      note_25: [0],
      comt_25: [null],
      note_26: [0],
      comt_26: [null],
      note_27: [0],
      comt_27: [null],
      note_28: [0],
      comt_28: [null],
      note_29: [0],
      comt_29: [null],
      note_30: [0],
      comt_30: [null],
      note_31: [0],
      comt_31: [null],
      note_32: [0],
      comt_32: [null],
      note_33: [0],
      comt_33: [null],
      note_34: [0],
      comt_34: [null],
      note_35: [0],
      comt_35: [null],
      note_36: [0],
      comt_36: [null],
      note_37: [0],
      comt_37: [null],
      note_38: [0],
      comt_38: [null],
      note_39: [0],
      comt_39: [null],
      note_40: [0],
      comt_40: [null],
      note_41: [0],
      comt_41: [null],
      note_42: [0],
      comt_42: [null],
      note_43: [0],
      comt_43: [null],
      note_44: [0],
      comt_44: [null],
      note_45: [0],
      comt_45: [null],
      note_46: [0],
      comt_46: [null],
      note_47: [0],
      comt_47: [null],
      note_48: [0],
      comt_48: [null],
      note_49: [0],
      comt_49: [null],
      note_50: [0],
      comt_50: [null],
      note_51: [0],
      comt_51: [null],
      note_52: [0],
      comt_52: [null],
      note_53: [0],
      comt_53: [null],
      note_54: [0],
      comt_54: [null],
      note_55: [0],
      comt_55: [null],
      note_56: [0],
      comt_56: [null],
      note_57: [0],
      comt_57: [null],
      note_58: [0],
      comt_58: [null],
      note_59: [0],
      comt_59: [null],
      note_60: [0],
      comt_60: [null],
      note_61: [0],
      comt_61: [null],
      note_62: [0],
      comt_62: [null],
      difficult_1: [null],
      difficult_2: [null],
      difficult_3: [null],
      force_1: [null],
      force_2: [null],
      force_3: [null],
      faiblesse_1: [null],
      faiblesse_2: [null],
      faiblesse_3: [null],
      besoin_1: [null],
      besoin_2: [null],
      besoin_3: [null],
      cons_id: [null],
      comp_id: [null]
    });

    this.consultanId = this.storageService.ConsultantId;
    this.userId = this.storageService.getUser().id

    if (this.readOnly) {
      this.matIntegForm.disable();
      this.infoEntrepriseForm.disable();
      this.recoForm.disable();
    }

    this.matIntegForm.patchValue({
      cons_id: this.storageService.getUser().id,
      comp_id: this.storageService.CompanyId
    });

    this.toolService.clearMatDiagInteg();

    if (this.consultanId == 0) {  
      this.toolService.getMatIntegDataById(this.storageService.getUser().id, this.storageService.CompanyId);
    } else {
      this.toolService.getMatIntegDataById(this.consultanId , this.storageService.CompanyId);
    }

    this.matDiagIntegData$ = this.toolService.ToolMatDiagIntegData$;

    //*****************Get mat Integ Label */
    this.toolService.getMatIntegLabel();
    this.matIntegLabel$ = this.toolService.MatIntegLabel$.pipe(
      tap(arr => {
        this.matIntegLabel = arr.sort((a, b) => a.reper - b.reper);
         this.matIntegLength = arr.length;
        //  console.log(arr);
         
      }),
      map(items => items.sort((a, b) => a.reper - b.reper))

    )
    // Abonnement dans le composant : le résumé détaillé a besoin des libellés même quand le questionnaire n'est pas affiché
    this.matIntegLabel$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe();

    


    // ************* SET note average ******************//
    this.toolService.ToolMatDiagIntegData$.pipe(
      tap(data => {
        this.matDiagIntegData = data;
        if (this.matDiagIntegData) {
          this.matDiagIntegData.forEach(element => {
            this.computeScores(element);
            // this.eval_total = ((this.crit_1 * 25) + (this.crit_2 * 20) + (this.crit_3 * 20) + (this.crit_4 * 25) + (this.crit_5 * 10)) / 100

            this.matIntegForm.patchValue({
              note_1: element.note_1,
              comt_1: element.comt_1,
              note_2: element.note_2,
              comt_2: element.comt_2,
              note_3: element.note_3,
              comt_3: element.comt_3,
              note_4: element.note_4,
              comt_4: element.comt_4,
              note_5: element.note_5,
              comt_5: element.comt_5,
              note_6: element.note_6,
              comt_6: element.comt_6,
              note_7: element.note_7,
              comt_7: element.comt_7,
              note_8: element.note_8,
              comt_8: element.comt_8,
              note_9: element.note_9,
              comt_9: element.comt_9,
              note_10: element.note_10,
              comt_10: element.comt_10,
              note_11: element.note_11,
              comt_11: element.comt_11,
              note_12: element.note_12,
              comt_12: element.comt_12,
              note_13: element.note_13,
              comt_13: element.comt_13,
              note_14: element.note_14,
              comt_14: element.comt_14,
              note_15: element.note_15,
              comt_15: element.comt_15,
              note_16: element.note_16,
              comt_16: element.comt_16,
              note_17: element.note_17,
              comt_17: element.comt_17,
              note_18: element.note_18,
              comt_18: element.comt_18,
              note_19: element.note_19,
              comt_19: element.comt_19,
              note_20: element.note_20,
              comt_20: element.comt_20,
              note_21: element.note_21,
              comt_21: element.comt_21,
              note_22: element.note_22,
              comt_22: element.comt_22,
              note_23: element.note_23,
              comt_23: element.comt_23,
              note_24: element.note_24,
              comt_24: element.comt_24,
              note_25: element.note_25,
              comt_25: element.comt_25,
              note_26: element.note_26,
              comt_26: element.comt_26,
              note_27: element.note_27,
              comt_27: element.comt_27,
              note_28: element.note_28,
              comt_28: element.comt_28,
              note_29: element.note_29,
              comt_29: element.comt_29,
              note_30: element.note_30,
              comt_30: element.comt_30,
              note_31: element.note_31,
              comt_31: element.comt_31,
              note_32: element.note_32,
              comt_32: element.comt_32,
              note_33: element.note_33,
              comt_33: element.comt_33,
              note_34: element.note_34,
              comt_34: element.comt_34,
              note_35: element.note_35,
              comt_35: element.comt_35,
              note_36: element.note_36,
              comt_36: element.comt_36,
              note_37: element.note_37,
              comt_37: element.comt_37,
              note_38: element.note_38,
              comt_38: element.comt_38,
              note_39: element.note_39,
              comt_39: element.comt_39,
              note_40: element.note_40,
              comt_40: element.comt_40,
              note_41: element.note_41,
              comt_41: element.comt_41,
              note_42: element.note_42,
              comt_42: element.comt_42,
              note_43: element.note_43,
              comt_43: element.comt_43,
              note_44: element.note_44,
              comt_44: element.comt_44,
              note_45: element.note_45,
              comt_45: element.comt_45,
              note_46: element.note_46,
              comt_46: element.comt_46,
              note_47: element.note_47,
              comt_47: element.comt_47,
              note_48: element.note_48,
              comt_48: element.comt_48,
              note_49: element.note_49,
              comt_49: element.comt_49,
              note_50: element.note_50,
              comt_50: element.comt_50,
              note_51: element.note_51,
              comt_51: element.comt_51,
              note_52: element.note_52,
              comt_52: element.comt_52,
              note_53: element.note_53,
              comt_53: element.comt_53,
              note_54: element.note_54,
              comt_54: element.comt_54,
              note_55: element.note_55,
              comt_55: element.comt_55,
              note_56: element.note_56,
              comt_56: element.comt_56,
              note_57: element.note_57,
              comt_57: element.comt_57,
              note_58: element.note_58,
              comt_58: element.comt_58,
              note_59: element.note_59,
              comt_59: element.comt_59,
              note_60: element.note_60,
              comt_60: element.comt_60,
              note_61: element.note_61,
              comt_61: element.comt_61,
              note_62: element.note_62,
              comt_62: element.comt_62,
              difficult_1: element.difficult_1,
              difficult_2: element.difficult_2,
              difficult_3: element.difficult_3,
              force_1: element.force_1,
              force_2: element.force_2,
              force_3: element.force_3,
              faiblesse_1: element.faiblesse_1,
              faiblesse_2: element.faiblesse_2,
              faiblesse_3: element.faiblesse_3,
              besoin_1: element.besoin_1,
              besoin_2: element.besoin_2,
              besoin_3: element.besoin_3,
              cons_id: element.cons_id,
              comp_id: element.comp_id

            })
            this.patchReco(element.recommandations);
          });

        }
        this.normalizeNotes();

      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();

    this.convertJson()
  }

  ngOnDestroy() {
    this.storageService.setIdConsultant(0);
  }

  // getItemsStartingWith(a:string) { return this.matIntegLabel.filter(el => el.reper && el.reper.startsWith(a)); }
  getItemsStartingWith(a:number) { return this.matIntegLabel.filter(el => el.reper === a ); }
  

  //////CONVERT ARRAY TO MYSQL JSON DATA
  convertJson() {
    this.converted = this.toolService.transformToMysqlJsonString(this.rawData);
    // console.log(this.converted);
  }


  // 🔹 Navigation
  nextItem(): void {
    // Après le dernier élément (le 64e) : « Voir les résultats »
    if (this.currentIndex + 1 >= this.matIntegLength) {
      this.goToResults();
    } else {
      this.currentIndex++;
    }
  }

  /**
   * Dernière étape : résultats, champ des recommandations et enregistrement. Accessible à tout moment du questionnaire (bouton
   * « Conclusions et recommandations »), sans parcourir les 64 éléments. Le consultant concerné voit ses réponses enregistrées
   * automatiquement si elles ont changé.
   */
  goToResults(): void {
    if (!this.matIntegLength) return;
    this.currentIndex = this.matIntegLength;
    this.refreshLive();
    this.resultsNotice = null;
    this.autoSaveAnswers();
  }

  /** Enregistre les réponses en cours en arrivant aux résultats ; sans effet s'il n'y a rien de nouveau (ni réponse, ni changement) */
  private autoSaveAnswers(): void {
    if (!this.canSave || this.isSaving) return;
    const hasRow = this.savedOnce || (this.matDiagIntegData?.length ?? 0) > 0;
    if (!(this.matIntegForm.dirty || (!hasRow && this.answeredCount > 0))) return;
    this.isSaving = true;
    this.resultsNotice = { type: 'info', text: 'Enregistrement de vos réponses…' };
    this.toolService.saveToolMatDiagInteg(this.savePayload(false)).subscribe({
      next: () => {
        this.isSaving = false;
        this.savedOnce = true;
        this.dataStale = true;
        this.matIntegForm.markAsPristine();
        const done = this.answeredCount;
        this.resultsNotice = {
          type: 'success',
          text: done === QUESTION_COUNT
            ? 'Vos réponses ont été enregistrées.'
            : `Vos réponses ont été enregistrées (${done} / ${QUESTION_COUNT} questions répondues).`
        };
      },
      error: err => {
        this.isSaving = false;
        this.resultsNotice = { type: 'danger', text: err.error?.message ?? "L'enregistrement automatique de vos réponses a échoué. Utilisez « Enregistrer l'outil » pour réessayer." };
      }
    });
  }

  /** Contenu envoyé au serveur ; les recommandations seulement si elles ont été modifiées (ou si on l'exige) : sinon celles de la base restent */
  private savePayload(withReco: boolean) {
    const payload: Record<string, unknown> = { ...this.matIntegForm.value };
    if (withReco || this.recoForm.dirty) payload['recommandations'] = this.recoForm.getRawValue();
    return payload as Parameters<ConsultantService['saveToolMatDiagInteg']>[0];
  }

  /**
   * Imprimer / enregistrer en PDF : le rapport contient les scores et le radar, le détail des réponses (toutes les rubriques) et les
   * recommandations, quel que soit ce qui est déplié à l'écran. Le nom de l'entreprise et du consultant sont repris en tête.
   */
  printReport(): void {
    if (this.printing || typeof window === 'undefined' || !this.canPrint) return;
    const start = () => {
      const long = { day: 'numeric', month: 'long', year: 'numeric' } as const;
      const saved = this.matDiagIntegData?.[0]?.['updated_at'] ?? this.matDiagIntegData?.[0]?.['date'];
      const savedDate = saved ? new Date(saved) : null;
      this.printDate = new Date().toLocaleDateString('fr-FR', long);
      this.diagnosticDate = savedDate && !isNaN(savedDate.getTime()) ? savedDate.toLocaleDateString('fr-FR', long) : '';
      this.printReco = this.buildPrintReco();
      const done = () => { this.printReco = null; window.removeEventListener('afterprint', done); };
      window.addEventListener('afterprint', done);
      // Laisse le temps d'afficher le détail et les recommandations avant d'ouvrir la fenêtre d'impression
      setTimeout(() => window.print(), 350);
    };
    const companyId = this.storageService.CompanyId;
    if (this.companyName || !companyId) { start(); return; }
    this.toolService.getCompanyDetailById(companyId).subscribe({
      next: c => {
        this.companyName = c.name ?? '';
        this.consultantLabel = c.consultant ?? (this.consultanId === 0 ? (this.storageService.getUser()?.username ?? '') : '');
        start();
      },
      error: () => start()    // l'impression reste possible sans le nom de l'entreprise
    });
  }

  private buildPrintReco(): PrintReco {
    const raw = this.recoForm.getRawValue();
    const texts = (v: (string | null)[]) => v.map(x => (x ?? '').trim()).filter(x => x);
    const problemes: PrintProblem[] = (raw.problemes as { probleme: string | null; lignes: Record<string, string | null>[] }[])
      .filter(p => this.isFilled(p))
      .map(p => {
        const lignes = p.lignes.filter(l => this.isFilled(l)).map(l => ({
          reference: l['reference'] ?? '', indicateur: l['indicateur'] ?? '', valeur_initiale: l['valeur_initiale'] ?? '', prevision: l['prevision'] ?? ''
        }));
        return { probleme: (p.probleme ?? '').trim(), lignes: lignes.length ? lignes : [{ reference: '', indicateur: '', valeur_initiale: '', prevision: '' }] };
      });
    return { conclusions: texts(raw.conclusions), recommandations: texts(raw.recommandations), problemes, empty: !this.isFilled(raw) };
  }

  /** Onglet Résumé : recharge les données si des réponses viennent d'être enregistrées depuis le questionnaire */
  openResume(): void {
    this.mode = 'resume';
    if (this.dataStale) {
      this.dataStale = false;
      this.toolService.getMatIntegDataById(this.consultanId === 0 ? this.userId : this.consultanId, this.storageService.CompanyId);
    }
  }

  previousItem(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  // Optionnel : méthode pour aller à un élément spécifique
  goToItem(index: number): void {
    if (index >= 0 && index < this.matIntegLength) {
      this.currentIndex = index;
    }
  }


  saveTool() {
    if (this.readOnly || this.preview || this.isSaving) return;
    this.isSaving = true;
    this.toolService.saveToolMatDiagInteg(this.savePayload(true)).subscribe({
      next: () => {
        this.isSaving = false;
        this.savedOnce = true;
        this.dataStale = false;
        this.matIntegForm.markAsPristine();
        this.recoForm.markAsPristine();
        this.resultsNotice = null;
        const done = this.answeredCount;
        this.alertMessage = done === QUESTION_COUNT
          ? "L'outil a été enregistré : les 60 questions ont une réponse."
          : `L'outil a été enregistré (${done} / ${QUESTION_COUNT} questions répondues). Vous pourrez le compléter plus tard.`;
        this.alertType = 'success';
        this.showAlert = true;
        // Rafraîchit les scores et revient au résumé
        const id = this.consultanId === 0 ? this.userId : this.consultanId;
        this.toolService.getMatIntegDataById(id, this.storageService.CompanyId);
        this.mode = 'resume';
        this.currentIndex = 0;
        this.showReco = false;
        this.recoEditing = false;
        this.recoNotice = null;
        if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: () => {
        this.isSaving = false;
        this.alertMessage = "L'enregistrement a échoué. Vérifiez votre connexion et réessayez.";
        this.alertType = 'danger';
        this.showAlert = true;
      }
    });
  }

  /** Résumé : déroule ou replie les recommandations, et amène la section à l'écran quand elle s'ouvre */
  toggleReco(): void {
    this.showReco = !this.showReco;
    this.recoNotice = null;
    if (!this.showReco) this.recoEditing = false;
    if (this.showReco && typeof document !== 'undefined') {
      setTimeout(() => document.getElementById('td-reco')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    }
  }

  /** Enregistre seulement les recommandations (le consultant en charge, depuis le Résumé), sans toucher aux réponses */
  saveReco(): void {
    if (!this.canSave || this.isSavingReco) return;
    this.isSavingReco = true;
    this.recoNotice = null;
    this.toolService.saveDiagRecommandations({
      cons_id: this.userId,
      comp_id: this.storageService.CompanyId,
      recommandations: this.recoForm.getRawValue()
    }).subscribe({
      next: () => {
        this.isSavingReco = false;
        this.recoForm.markAsPristine();
        this.recoNotice = { type: 'success', text: 'Les recommandations ont été enregistrées.' };
      },
      error: err => {
        this.isSavingReco = false;
        this.recoNotice = { type: 'danger', text: err.error?.message ?? "L'enregistrement a échoué. Vérifiez votre connexion et réessayez." };
      }
    });
  }

  logAll() {
    // console.log(this.matIntegForm.value);
  }

  showAlertMessage(): void {
    this.alertMessage = 'Les informations que vous avez insérée ont été enregistrées';
    this.alertType = 'success';
    this.showAlert = true;
    this.dismissible = true;
  }

  goBack(): void {
    history.back();
  }

}
