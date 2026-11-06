import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { ConsultantService } from '../../../consultant.service';
import { StorageService } from '../../../../_services/storage.service';
import { InfoTipComponent } from '../../../../shared/components/info-tip/info-tip.component';
import { LivrableReviewComponent } from '../../../../shared/components/livrable-review/livrable-review.component';
import { LoadingComponent, LoadErrorComponent } from '../../../../shared/components/loading/loading.component';
import { PreviewBannerComponent } from '../../../../shared/components/preview-banner/preview-banner.component';
import { SearchSelectComponent } from '../../../../shared/components/search-select/search-select.component';
import {
  SuiviAnswer, SuiviAnswers, SuiviCompany, SuiviPhase, SuiviQuestion, SuiviQuestionnaire, SuiviSection
} from '../../../../core/model/suivi';
import { hasManagerRole } from '../../../../core/roles';

/**
 * Outil « Suivi et évaluation » (chaînes de valeur inclusives) : le questionnaire du PNUD de 50 questions, passé deux fois à l'identique :
 * saisie initiale au démarrage (étape 1, route tse) et saisie finale à la clôture (étape 4, route tsef).
 * Les questions sont regroupées en rubriques repliables ; chaque réponse se donne d'un toucher, l'avancement se voit en direct,
 * la saisie peut être interrompue et reprise, et la saisie finale rappelle sous chaque question la réponse du démarrage.
 * Le questionnaire vient du serveur (une seule source). Les managers et modérateurs consultent en lecture seule.
 */
@Component({
  selector: 'app-tse',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, InfoTipComponent, LivrableReviewComponent, LoadingComponent, LoadErrorComponent,
    PreviewBannerComponent, SearchSelectComponent],
  templateUrl: './tse.component.html',
  styleUrl: './tse.component.scss'
})
export class TseComponent implements OnInit, OnDestroy {

  phase: SuiviPhase = 'initial';

  qn: SuiviQuestionnaire | null = null;
  /** Réponses en cours de saisie : numéro d'option, liste de numéros, nombre ou texte */
  answers: Record<string, any> = {};
  initial: SuiviAnswers | null = null;
  company: SuiviCompany | null = null;
  consultantName = '';
  /** Questions pré-remplies à partir de la fiche entreprise */
  prefilled = new Set<string>();

  companyId = 0;
  isLoading = true;
  loadError = false;
  isSaving = false;
  readOnly = true;
  /** Aperçu manager : questionnaire vierge, utilisable mais jamais enregistré */
  preview = false;

  /** Rubrique dépliée (identifiant) */
  openSection: string | null = null;

  alertMessage = '';
  alertType: 'success' | 'danger' = 'success';

  private consultantId = 0;
  private userId = 0;

  constructor(
    private toolService: ConsultantService,
    private storageService: StorageService,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: object,
  ) { }

  ngOnInit(): void {
    this.phase = this.route.snapshot.data['phase'] === 'final' ? 'final' : 'initial';
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

    if (!this.companyId && !this.preview) { this.isLoading = false; return; }
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
    forkJoin({
      qn: this.toolService.fetchSuiviQuestionnaire(),
      data: this.companyId ? this.toolService.fetchSuivi(this.consultantId, this.companyId, this.phase) : of(null)
    }).subscribe({
      next: ({ qn, data }) => {
        this.qn = qn;
        this.company = data?.company ?? null;
        this.consultantName = data?.consultant?.username ?? '';
        this.initial = data?.initial ?? null;
        this.answers = { ...(data?.answers ?? {}) };
        if (data && !data.data && !this.readOnly) this.prefill();
        this.openSection = this.firstOpenSection();
        this.isLoading = false;
      },
      error: () => { this.loadError = true; this.isLoading = false; }
    });
  }

  /** Première saisie : reprend ce que la fiche entreprise sait déjà (modifiable) */
  private prefill(): void {
    const c = this.company;
    if (!c || !this.qn) return;
    this.questions.forEach(q => {
      if (!q.prefill) return;
      let v: SuiviAnswer | null | undefined = c[q.prefill];
      if (q.type === 'list') v = this.qn!.lists[q.list!].some(i => i.code === v) ? v : null;
      if (v === null || v === undefined || v === '' || v === 0) return;
      this.answers[q.key] = v;
      this.prefilled.add(q.key);
    });
  }

  // ── Questions et rubriques ──────────────────────────────────────────────────

  /** Questions posées pour cette saisie (la finale ne reprend que les questions répétées) */
  get questions(): SuiviQuestion[] {
    return (this.qn?.questions ?? []).filter(q => this.phase === 'initial' || !q.once);
  }

  get sections(): SuiviSection[] {
    return (this.qn?.sections ?? []).filter(s => this.questions.some(q => q.section === s.id));
  }

  /** Une question conditionnelle n'est posée que si la réponse dont elle dépend le justifie */
  isShown(q: SuiviQuestion): boolean {
    if (!q.showIf) return true;
    const dep = this.answers[q.showIf.key];
    return typeof dep === 'number' && q.showIf.anyOf.includes(dep);
  }

  questionsOf(s: SuiviSection): SuiviQuestion[] {
    return this.questions.filter(q => q.section === s.id && this.isShown(q));
  }

  isAnswered(q: SuiviQuestion): boolean {
    const v = this.answers[q.key];
    return v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && !v.length);
  }

  private required(list: SuiviQuestion[]): SuiviQuestion[] {
    return list.filter(q => !q.optional);
  }

  /** Questions obligatoires d'une rubrique : répondues / total */
  done(s: SuiviSection): number { return this.required(this.questionsOf(s)).filter(q => this.isAnswered(q)).length; }
  total(s: SuiviSection): number { return this.required(this.questionsOf(s)).length; }
  isComplete(s: SuiviSection): boolean { return this.total(s) > 0 && this.done(s) === this.total(s); }

  get answeredCount(): number { return this.sections.reduce((n, s) => n + this.done(s), 0); }
  get totalCount(): number { return this.sections.reduce((n, s) => n + this.total(s), 0); }
  get progress(): number { return this.totalCount ? Math.round(this.answeredCount / this.totalCount * 100) : 0; }

  private firstOpenSection(): string | null {
    const s = this.sections.find(x => !this.isComplete(x)) ?? this.sections[0];
    return s ? s.id : null;
  }

  toggleSection(s: SuiviSection): void {
    this.openSection = this.openSection === s.id ? null : s.id;
  }

  nextSection(s: SuiviSection): void {
    const list = this.sections;
    const next = list[list.indexOf(s) + 1];
    this.openSection = next ? next.id : null;
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => document.getElementById('tse-s-' + (next ? next.id : s.id))?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    }
  }

  /** Numéro de la question dans l'outil Excel d'origine (les champs d'identification n'en ont pas) */
  numberOf(q: SuiviQuestion): string {
    return /^q\d+$/.test(q.key) ? q.key.slice(1) : '';
  }

  // ── Réponses ────────────────────────────────────────────────────────────────

  isOn(q: SuiviQuestion, option: number): boolean {
    const v = this.answers[q.key];
    return Array.isArray(v) ? v.includes(option) : v === option;
  }

  /** Choix d'une option ; toucher à nouveau l'option choisie efface la réponse */
  pick(q: SuiviQuestion, option: number): void {
    if (this.readOnly) return;
    if (q.type === 'multi') {
      const cur: number[] = Array.isArray(this.answers[q.key]) ? [...this.answers[q.key]] : [];
      const i = cur.indexOf(option);
      i >= 0 ? cur.splice(i, 1) : cur.push(option);
      this.answers[q.key] = cur.sort((a, b) => a - b);
    } else {
      this.answers[q.key] = this.answers[q.key] === option ? undefined : option;
    }
    this.dropInapplicable();
  }

  setList(q: SuiviQuestion, code: string | null): void {
    this.answers[q.key] = code ?? undefined;
  }

  /** Une réponse devenue sans objet (ex. « lesquels ? » après un « Non ») est retirée */
  private dropInapplicable(): void {
    this.questions.forEach(q => { if (!this.isShown(q)) delete this.answers[q.key]; });
  }

  // ── Affichage des valeurs ───────────────────────────────────────────────────

  fmt(n: number): string {
    return n.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
  }

  usd(fcfa: number | null | undefined): string {
    const rate = this.qn?.fx.xafPerUsd ?? 580;
    return fcfa ? '≈ ' + Math.round(fcfa / rate).toLocaleString('fr-FR') + ' USD' : '';
  }

  /** Texte lisible d'une réponse (pour le rappel du démarrage) */
  private textOf(q: SuiviQuestion, v: SuiviAnswer | undefined): string | null {
    if (v === undefined || v === null || v === '') return null;
    switch (q.type) {
      case 'choice': return q.options?.[(v as number) - 1] ?? null;
      case 'multi': return (v as number[]).map(i => q.options?.[i - 1]).filter(Boolean).join(' · ') || null;
      case 'number': return this.fmt(v as number) + (q.unit ? ' ' + q.unit : '');
      case 'money': return this.fmt(v as number) + ' FCFA';
      case 'percent': return this.fmt(v as number) + ' %';
      case 'list': return this.qn?.lists[q.list!].find(i => i.code === v)?.label ?? String(v);
      default: return String(v);
    }
  }

  /** Saisie finale : « Au démarrage : … » */
  initialText(q: SuiviQuestion): string | null {
    return this.initial ? this.textOf(q, this.initial[q.key]) : null;
  }

  /** Évolution d'une réponse numérique depuis le démarrage, ex. « +4 » */
  delta(q: SuiviQuestion): { text: string; sign: 'up' | 'down' | 'same' } | null {
    const a = this.initial?.[q.key], b = this.answers[q.key];
    if (typeof a !== 'number' || typeof b !== 'number' || !['number', 'money', 'percent'].includes(q.type)) return null;
    const d = Math.round((b - a) * 100) / 100;
    return { text: (d > 0 ? '+' : '') + this.fmt(d) + (q.type === 'percent' ? ' pts' : ''), sign: d > 0 ? 'up' : d < 0 ? 'down' : 'same' };
  }

  /** Incohérences d'effectifs signalées (sans bloquer l'enregistrement) */
  get jobsWarnings(): string[] {
    const total = this.answers['q13'];
    if (typeof total !== 'number') return [];
    const out: string[] = [];
    const women = this.answers['q14'], men = this.answers['q15'];
    if (typeof women === 'number' && typeof men === 'number' && women + men > total) out.push("Les femmes et les hommes cités dépassent l'effectif total (question 13).");
    ([['q16', 'jeunes'], ['q17', 'personnes en situation de handicap'], ['q18', 'personnes en situation de vulnérabilité']] as const).forEach(([k, label]) => {
      if (typeof this.answers[k] === 'number' && this.answers[k] > total) out.push(`Le nombre de ${label} dépasse l'effectif total.`);
    });
    return out;
  }

  // ── Enregistrement ──────────────────────────────────────────────────────────

  save(): void {
    this.alertMessage = '';
    if (this.readOnly || this.preview || this.isSaving) return;
    const answers: Record<string, unknown> = {};
    this.questions.forEach(q => {
      if (this.isShown(q) && this.isAnswered(q)) answers[q.key] = this.answers[q.key];
    });
    this.isSaving = true;
    this.toolService.saveSuivi({ cons_id: this.userId, comp_id: this.companyId, phase: this.phase, answers }).subscribe({
      next: () => {
        this.isSaving = false;
        this.showAlert(this.progress === 100
          ? 'La saisie est complète et enregistrée.'
          : `Saisie enregistrée : ${this.answeredCount} questions sur ${this.totalCount}. Vous pourrez la reprendre plus tard.`, 'success');
      },
      error: err => {
        this.isSaving = false;
        this.showAlert(err.error?.errors?.join(' · ') ?? err.error?.message ?? 'Une erreur est survenue. Veuillez réessayer.', 'danger');
      }
    });
  }

  print(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const previous = this.openSection;
    this.openSection = '*';
    setTimeout(() => { window.print(); this.openSection = previous; }, 50);
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
