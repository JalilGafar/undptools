import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ManagerService } from '../../manager.service';
import { ConsultantService } from '../../../consultant/consultant.service';
import { LoadingComponent, LoadErrorComponent } from '../../../shared/components/loading/loading.component';
import { SuiviDistribution, SuiviIndicators, SuiviPortfolio, SuiviQuestion, SuiviQuestionnaire, SuiviSection } from '../../../core/model/suivi';

type Mode = 'all' | 'paired';
type Format = 'int' | 'pct' | 'money' | 'rate';

interface Kpi {
  label: string;
  icon: string;
  format: Format;
  initial: number | null;
  final: number | null;
  hint?: string;
}

interface OptionRow {
  label: string;
  initial: number;
  final: number;
  pctInitial: number;
  pctFinal: number;
}

/** Nombre de lignes affichées pour les longues listes (secteurs d'activité) */
const TOP = 8;

/**
 * Tableau de bord « Suivi et évaluation » du portefeuille (managers et modérateurs) : ce que le tableau de bord du classeur Excel
 * calculait, mais comptage par option (et non par morceaux de texte), filtres région / consultant, et comparaison à entreprises
 * constantes. Indicateurs clés en tête, puis le détail question par question, début de l'accompagnement contre clôture.
 */
@Component({
  selector: 'app-suivi-global',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, LoadErrorComponent],
  templateUrl: './suivi-global.component.html',
  styleUrl: './suivi-global.component.scss'
})
export class SuiviGlobalComponent implements OnInit {

  data: SuiviPortfolio | null = null;
  qn: SuiviQuestionnaire | null = null;
  isLoading = true;
  loadError = false;

  region = '';
  consultant = 0;
  mode: Mode = 'all';
  showUsd = false;
  openSection: string | null = null;
  readonly TOP_LABEL = `les ${TOP} plus fréquentes`;

  constructor(private managerService: ManagerService, private toolService: ConsultantService) { }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.loadError = false;
    forkJoin({
      qn: this.toolService.fetchSuiviQuestionnaire(),
      data: this.managerService.fetchSuiviPortfolio(this.region || null, this.consultant || null)
    }).subscribe({
      next: ({ qn, data }) => { this.qn = qn; this.data = data; this.isLoading = false; },
      error: () => { this.loadError = true; this.isLoading = false; }
    });
  }

  resetFilters(): void {
    this.region = '';
    this.consultant = 0;
    this.load();
  }

  get filtered(): boolean { return !!this.region || !!this.consultant; }

  // ── Indicateurs clés ────────────────────────────────────────────────────────

  private get indicators(): { initial: SuiviIndicators; final: SuiviIndicators } | null {
    if (!this.data) return null;
    return this.mode === 'paired'
      ? { initial: this.data.paired.initial, final: this.data.paired.final }
      : { initial: this.data.phases.initial.indicateurs, final: this.data.phases.final.indicateurs };
  }

  get kpis(): Kpi[] {
    const i = this.indicators;
    if (!i) return [];
    const pct = (r: SuiviIndicators['femmes']) => (r ? r.part * 100 : null);
    return [
      { label: 'Emplois', icon: 'bi-people', format: 'int', initial: i.initial.emplois, final: i.final.emplois, hint: 'Effectif total des entreprises' },
      { label: 'Part de femmes', icon: 'bi-gender-female', format: 'pct', initial: pct(i.initial.femmes), final: pct(i.final.femmes), hint: "dans l'effectif total" },
      { label: 'Part de jeunes', icon: 'bi-person-arms-up', format: 'pct', initial: pct(i.initial.jeunes), final: pct(i.final.jeunes), hint: '18-29 ans, dans l\'effectif total' },
      { label: 'Personnes en situation de handicap', icon: 'bi-universal-access', format: 'pct', initial: pct(i.initial.handicap), final: pct(i.final.handicap), hint: "dans l'effectif total" },
      { label: 'Personnes vulnérables', icon: 'bi-heart', format: 'pct', initial: pct(i.initial.vulnerables), final: pct(i.final.vulnerables), hint: "dans l'effectif total" },
      { label: "Chiffre d'affaires mensuel moyen", icon: 'bi-cash-coin', format: 'money', initial: i.initial.ca_moyen, final: i.final.ca_moyen },
      { label: 'Marge brute moyenne', icon: 'bi-percent', format: 'rate', initial: i.initial.marge_moyenne, final: i.final.marge_moyenne },
    ];
  }

  value(v: number | null, f: Format): string {
    if (v === null || v === undefined) return '—';
    switch (f) {
      case 'pct': return this.round1(v) + ' %';
      case 'rate': return this.round1(v) + ' %';
      case 'money': return this.money(v);
      default: return Math.round(v).toLocaleString('fr-FR');
    }
  }

  money(fcfa: number): string {
    if (this.showUsd) return '$ ' + Math.round(fcfa / (this.data?.fx.xafPerUsd ?? 580)).toLocaleString('fr-FR');
    return Math.round(fcfa).toLocaleString('fr-FR') + ' FCFA';
  }

  private round1(v: number): string {
    return (Math.round(v * 10) / 10).toLocaleString('fr-FR');
  }

  /** Évolution entre début et clôture : « +4 », « +2,5 pts », « +36 % » */
  delta(k: Kpi): { text: string; sign: 'up' | 'down' | 'same' } | null {
    if (k.initial === null || k.final === null) return null;
    const d = k.final - k.initial;
    const sign = d > 0 ? 'up' : d < 0 ? 'down' : 'same';
    const plus = d > 0 ? '+' : '';
    if (k.format === 'pct' || k.format === 'rate') return { text: plus + this.round1(d) + ' pts', sign };
    if (!k.initial) return { text: plus + Math.round(d).toLocaleString('fr-FR'), sign };
    return { text: plus + this.round1(d / k.initial * 100) + ' %', sign };
  }

  // ── Détail par question ─────────────────────────────────────────────────────

  get sections(): SuiviSection[] {
    return this.qn?.sections ?? [];
  }

  questionsOf(s: SuiviSection): SuiviQuestion[] {
    return (this.qn?.questions ?? []).filter(q => q.section === s.id && ['choice', 'multi', 'list', 'number', 'money', 'percent'].includes(q.type)
      && this.dist('initial', q).n + this.dist('final', q).n > 0);
  }

  numberOf(q: SuiviQuestion): string {
    return /^q\d+$/.test(q.key) ? q.key.slice(1) : '';
  }

  isNumeric(q: SuiviQuestion): boolean {
    return q.type === 'number' || q.type === 'money' || q.type === 'percent';
  }

  dist(phase: 'initial' | 'final', q: SuiviQuestion): SuiviDistribution {
    return this.data?.phases[phase].questions[q.key] ?? { n: 0 };
  }

  /** Lignes d'une question à choix : une par option, avec la part de répondants de chaque phase */
  rows(q: SuiviQuestion): OptionRow[] {
    const di = this.dist('initial', q), df = this.dist('final', q);
    const options: { code: string; label: string }[] = q.type === 'list'
      ? this.qn!.lists[q.list!].map(i => ({ code: i.code, label: i.code === i.label ? i.label : `${i.code} - ${i.label}` }))
      : (q.options ?? []).map((label, i) => ({ code: String(i + 1), label }));
    const rows = options.map(o => {
      const a = di.counts?.[o.code] ?? 0, b = df.counts?.[o.code] ?? 0;
      return { label: o.label, initial: a, final: b, pctInitial: di.n ? a / di.n * 100 : 0, pctFinal: df.n ? b / df.n * 100 : 0 };
    });
    // Longues listes : seulement les plus fréquentes ; les listes courtes gardent l'ordre du questionnaire
    return q.type === 'list'
      ? rows.filter(r => r.initial + r.final > 0).sort((x, y) => (y.initial + y.final) - (x.initial + x.final)).slice(0, TOP)
      : rows;
  }

  /** Valeur moyenne / médiane d'une question numérique */
  stat(phase: 'initial' | 'final', q: SuiviQuestion, which: 'moyenne' | 'mediane'): string {
    const v = this.dist(phase, q)[which];
    if (v === null || v === undefined) return '—';
    if (q.type === 'money') return this.money(v);
    return this.round1(v) + (q.type === 'percent' ? ' %' : q.unit ? ' ' + q.unit : '');
  }

  toggleSection(s: SuiviSection): void {
    this.openSection = this.openSection === s.id ? null : s.id;
  }

  goBack(): void {
    history.back();
  }
}
