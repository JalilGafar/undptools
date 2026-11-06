import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ConsultantService } from '../../../consultant.service';
import { StorageService } from '../../../../_services/storage.service';
import { ScrollHintDirective } from '../../../../shared/scroll-hint.directive';
import { InfoTipComponent } from '../../../../shared/components/info-tip/info-tip.component';
import { LivrableReviewComponent } from '../../../../shared/components/livrable-review/livrable-review.component';
import { LoadingComponent, LoadErrorComponent } from '../../../../shared/components/loading/loading.component';
import { PreviewBannerComponent } from '../../../../shared/components/preview-banner/preview-banner.component';
import {
  FinanceLine, FinanceResponse, FinanceResult, MONTH_LABELS, SECTIONS, SECTION_ORDER, SectionDef, SectionKey,
  TAB_SECTIONS, TabKey, computeFinance, emptyLines, mergeSaved
} from '../../../../core/model/finance';
import { hasManagerRole } from '../../../../core/roles';

type InputTab = Exclude<TabKey, 'donnees' | 'resultat'>;

const MONTH_NAMES = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

/**
 * Outil « Analyse financière » (étape 1, entrée de menu 1M ; identifiant technique t3h).
 * Là où le tableur demande 12 cases par ligne, la saisie propose d'abord UN montant mensuel (loyer, abonnement, salaire : même somme
 * chaque mois) et ouvre le détail mois par mois à la demande ; le détail s'ouvre seul pour les lignes qui varient (ventes).
 * Le résultat net se met à jour en continu, et le compte de résultat est résumé en phrases et en graphique.
 * Montants saisis en FCFA ; affichables en USD au taux fixe de la plateforme. Un fichier par consultant et par entreprise.
 */
@Component({
  selector: 'app-t3h',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ScrollHintDirective, InfoTipComponent, LivrableReviewComponent, LoadingComponent, LoadErrorComponent, PreviewBannerComponent],
  templateUrl: './t3h.component.html',
  styleUrl: './t3h.component.scss'
})
export class T3hComponent implements OnInit, OnDestroy {

  readonly tabs: { key: TabKey; label: string; short: string; icon: string }[] = [
    { key: 'ventes', label: "Chiffre d'affaires", short: 'Ventes', icon: 'bi-cash-coin' },
    { key: 'couts', label: 'Coûts directs', short: 'Coûts directs', icon: 'bi-box-seam' },
    { key: 'frais', label: "Frais d'exploitation", short: 'Frais', icon: 'bi-building-gear' },
    { key: 'financier', label: 'Coûts financiers', short: 'Financier', icon: 'bi-bank' },
    { key: 'resultat', label: 'Compte de résultat', short: 'Résultat', icon: 'bi-graph-up-arrow' },
  ];
  readonly months = MONTH_LABELS;
  readonly monthIndexes = Array.from({ length: 12 }, (_, i) => i);

  tab: TabKey = 'ventes';

  lines = Object.fromEntries(SECTION_ORDER.map(k => [k, emptyLines(k)])) as Record<SectionKey, FinanceLine[]>;
  annee: number | null = new Date().getFullYear();
  tauxImpot: number | null = null;

  /** Lignes dont le détail mois par mois est affiché */
  private openLines = new Set<FinanceLine>();

  calc: FinanceResult = computeFinance(this.lines, null);

  companyName = '';
  consultantName = '';
  companyId = 0;

  isLoading = true;
  loadError = false;
  isSaving = false;
  readOnly = true;
  /** Aperçu manager : outil vierge, utilisable mais jamais enregistré */
  preview = false;

  alertMessage = '';
  alertType: 'success' | 'danger' = 'success';

  // Affichage du compte de résultat en USD (tous les profils) ; la saisie reste toujours en FCFA
  showUsd = false;
  fx = { year: 2025, xafPerUsd: 580 };

  private consultantId = 0;
  private userId = 0;

  constructor(
    private toolService: ConsultantService,
    private storageService: StorageService,
    @Inject(PLATFORM_ID) private platformId: object,
  ) { }

  ngOnInit(): void {
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
    this.initOpen();
    this.recalc();

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
    this.toolService.fetchFinance(this.consultantId, this.companyId).subscribe({
      next: data => this.fill(data),
      error: () => { this.loadError = true; this.isLoading = false; }
    });
  }

  private fill(data: FinanceResponse): void {
    this.fx = data.fx ?? this.fx;
    this.companyName = data.company?.name ?? '';
    this.consultantName = data.consultant?.username ?? '';
    if (data.data) {
      this.annee = data.data.annee;
      this.tauxImpot = data.data.taux_impot;
    }
    SECTION_ORDER.forEach(k => this.lines[k] = mergeSaved(k, data.lignes));
    this.initOpen();
    this.recalc();
    this.isLoading = false;
  }

  // ── Calculs ─────────────────────────────────────────────────────────────────

  /** À rappeler après toute modification d'un montant ou du taux d'impôt */
  recalc(): void {
    this.calc = computeFinance(this.lines, this.tauxImpot);
  }

  lineTotal(line: FinanceLine): number {
    return line.m.reduce<number>((sum, v) => sum + (Number(v) || 0), 0);
  }

  sectionTotal(key: SectionKey): number {
    return this.lines[key].reduce((sum, l) => sum + this.lineTotal(l), 0);
  }

  // ── Saisie : un montant mensuel, ou le détail mois par mois ─────────────────

  /** Les 12 mois ont le même montant (ou sont tous vides) : un seul champ suffit */
  isConstant(line: FinanceLine): boolean {
    const first = Number(line.m[0]) || 0;
    return line.m.every(v => (Number(v) || 0) === first);
  }

  /** Saisit le même montant sur les 12 mois */
  setFixed(line: FinanceLine, value: number | string | null): void {
    const amount = value === null || value === '' ? null : Number(value);
    line.m = Array(12).fill(amount);
    this.recalc();
  }

  setAmount(line: FinanceLine, month: number, value: number | string | null): void {
    line.m[month] = value === null || value === '' ? null : Number(value);
    this.recalc();
  }

  private initOpen(): void {
    this.openLines.clear();
    SECTION_ORDER.forEach(k => this.lines[k].forEach(l => {
      // Ventes : toujours mois par mois ; autres lignes : seulement si les montants varient
      if (SECTIONS[k].monthly || !this.isConstant(l)) this.openLines.add(l);
    }));
  }

  isOpen(line: FinanceLine): boolean {
    return this.openLines.has(line);
  }

  toggleOpen(line: FinanceLine): void {
    this.openLines.has(line) ? this.openLines.delete(line) : this.openLines.add(line);
  }

  // ── Lignes ──────────────────────────────────────────────────────────────────

  def(key: SectionKey): SectionDef {
    return SECTIONS[key];
  }

  tabSections(): SectionKey[] {
    return this.tab === 'resultat' ? [] : TAB_SECTIONS[this.tab as InputTab];
  }

  /** Libellé fixe (poste prédéfini non renommable) ; null si le consultant peut saisir le nom */
  fixedLabel(line: FinanceLine): string | null {
    if (!line.code) return null;
    const def = SECTIONS[line.section].lines.find(l => l.code === line.code);
    return def && !def.renamable ? def.label : null;
  }

  placeholder(line: FinanceLine): string {
    const def = line.code ? SECTIONS[line.section].lines.find(l => l.code === line.code) : undefined;
    return def ? def.label : (SECTIONS[line.section].newLinePlaceholder ?? 'Nom de la dépense ou de la recette');
  }

  /** Une ligne ajoutée par le consultant peut être supprimée ; les postes prédéfinis restent */
  isRemovable(line: FinanceLine): boolean {
    return !line.code || !SECTIONS[line.section].lines.some(l => l.code === line.code);
  }

  lineTip(line: FinanceLine): string | null {
    const def = line.code ? SECTIONS[line.section].lines.find(l => l.code === line.code) : undefined;
    return def?.tip ?? null;
  }

  addLine(section: SectionKey): void {
    const line: FinanceLine = { section, code: null, libelle: null, m: Array(12).fill(null) };
    this.lines[section] = [...this.lines[section], line];
    if (SECTIONS[section].monthly) this.openLines.add(line);
  }

  removeLine(section: SectionKey, line: FinanceLine): void {
    if (!this.isRemovable(line)) return;
    this.lines[section] = this.lines[section].filter(l => l !== line);
    this.openLines.delete(line);
    this.recalc();
  }

  // ── Onglets ─────────────────────────────────────────────────────────────────

  selectTab(tab: TabKey): void {
    this.tab = tab;
    if (isPlatformBrowser(this.platformId)) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /** Un onglet de saisie contient déjà des montants */
  hasData(tab: TabKey): boolean {
    return tab !== 'resultat' && TAB_SECTIONS[tab as InputTab].some(k => this.sectionTotal(k) > 0);
  }

  get nextTab(): { key: TabKey; label: string } | null {
    const index = this.tabs.findIndex(t => t.key === this.tab);
    const next = this.tabs[index + 1];
    return next ? { key: next.key, label: next.label } : null;
  }

  // ── Affichage des montants ──────────────────────────────────────────────────

  /** Montant de saisie : séparateur de milliers, « – » quand c'est vide ou nul */
  num(value: number): string {
    return value ? Math.round(value).toLocaleString('fr-FR') : '–';
  }

  /** Montant du compte de résultat : FCFA ou USD ; une perte s'affiche entre parenthèses */
  money(value: number): string {
    const n = this.showUsd ? Math.round(value / this.fx.xafPerUsd) : Math.round(value);
    if (n === 0) return '–';
    const text = Math.abs(n).toLocaleString('fr-FR');
    return n < 0 ? `(${text})` : text;
  }

  moneyUnit(value: number): string {
    const n = this.showUsd ? Math.round(value / this.fx.xafPerUsd) : Math.round(value);
    const text = Math.abs(n).toLocaleString('fr-FR');
    const signed = n < 0 ? `−${text}` : text;
    return this.showUsd ? `$ ${signed}` : `${signed} FCFA`;
  }

  pct(value: number | null): string {
    if (value === null) return '–';
    const text = Math.abs(value).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %';
    return value < 0 ? `(${text})` : text;
  }

  get deficitMonths(): number {
    return this.calc.resultatNet.slice(0, 12).filter(v => v < 0).length;
  }

  get hasAnyAmount(): boolean {
    return SECTION_ORDER.some(k => this.sectionTotal(k) > 0);
  }

  // ── Lecture du compte de résultat ───────────────────────────────────────────

  /** Le résultat expliqué en quelques phrases, avec des rappels quand une rubrique importante est restée vide */
  get insights(): { text: string; warn: boolean }[] {
    const c = this.calc;
    if (c.ca[12] <= 0) {
      return [{ text: "Saisissez les ventes et les dépenses : le résumé du résultat s'affichera ici.", warn: false }];
    }
    const out: { text: string; warn: boolean }[] = [];
    const year = this.annee ? `En ${this.annee}` : "Sur l'année";
    const margin = c.margeNettePct[12];
    out.push({
      text: `${year}, le chiffre d'affaires est de ${this.moneyUnit(c.ca[12])} et le résultat net de ${this.moneyUnit(c.resultatNet[12])}`
        + (margin === null ? '.' : `, soit une marge nette de ${margin.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %.`),
      warn: c.resultatNet[12] < 0
    });
    const losing = c.resultatNet.slice(0, 12).map((v, i) => (v < 0 ? MONTH_NAMES[i] : null)).filter((m): m is string => m !== null);
    if (losing.length) {
      out.push({ text: `${losing.length} mois ${losing.length > 1 ? 'sont' : 'est'} en perte : ${losing.join(', ')}.`, warn: true });
    }
    const monthly = c.resultatNet.slice(0, 12);
    const best = monthly.indexOf(Math.max(...monthly));
    if (monthly[best] > 0) out.push({ text: `Meilleur mois : ${MONTH_NAMES[best]} (${this.moneyUnit(monthly[best])}).`, warn: false });
    if (this.sectionTotal('materiaux') + this.sectionTotal('main_oeuvre') === 0) {
      out.push({ text: "Aucun coût direct n'a été saisi : la marge brute est probablement surévaluée.", warn: true });
    }
    if (!this.lines.frais_admin.some(l => l.code === 'adm_salaires' && this.lineTotal(l) > 0)) {
      out.push({ text: "Aucun salaire administratif saisi. Si le propriétaire travaille dans l'entreprise, sa rémunération doit être comptée, sinon le bénéfice paraît trop élevé.", warn: true });
    }
    return out;
  }

  /** Barres du résultat net mensuel : hauteur et position par rapport à la ligne du zéro */
  get bars(): { month: string; net: number; bottom: number; height: number; negative: boolean }[] {
    const net = this.calc.resultatNet.slice(0, 12);
    const top = Math.max(0, ...net);
    const low = Math.max(0, ...net.map(v => -v));
    const range = top + low;
    if (range === 0) return [];
    const zero = low / range * 100;
    return net.map((v, i) => {
      const height = Math.abs(v) / range * 100;
      return { month: this.months[i], net: v, bottom: v >= 0 ? zero : zero - height, height, negative: v < 0 };
    });
  }

  get zeroLine(): number {
    const net = this.calc.resultatNet.slice(0, 12);
    const top = Math.max(0, ...net);
    const low = Math.max(0, ...net.map(v => -v));
    return top + low === 0 ? 0 : low / (top + low) * 100;
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  save(): void {
    this.alertMessage = '';
    if (this.readOnly || this.preview) return;
    if (this.annee !== null && (this.annee < 2000 || this.annee > 2100)) {
      this.showAlert("L'année doit être comprise entre 2000 et 2100.", 'danger');
      return;
    }
    if (this.tauxImpot !== null && (this.tauxImpot < 0 || this.tauxImpot > 100)) {
      this.showAlert("Le taux d'imposition doit être compris entre 0 et 100 %.", 'danger');
      return;
    }
    const negative = SECTION_ORDER.some(k => this.lines[k].some(l => l.m.some(v => v !== null && Number(v) < 0)));
    if (negative) {
      this.showAlert('Les montants doivent être positifs : une dépense se saisit sans signe moins.', 'danger');
      return;
    }

    const payload = {
      cons_id: this.userId,
      comp_id: this.companyId,
      annee: this.annee,
      taux_impot: this.tauxImpot,
      lignes: SECTION_ORDER.flatMap(k => this.lines[k]).map(l => ({ section: l.section, code: l.code, libelle: l.libelle, m: l.m }))
    };
    this.isSaving = true;
    this.toolService.saveFinance(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.showAlert("L'analyse financière a été enregistrée.", 'success');
      },
      error: err => {
        this.isSaving = false;
        this.showAlert(err.error?.errors?.join(' · ') ?? err.error?.message ?? 'Une erreur est survenue. Veuillez réessayer.', 'danger');
      }
    });
  }

  /** Impression : le compte de résultat (le résumé destiné au chef d'entreprise) */
  print(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.tab = 'resultat';
    setTimeout(() => window.print(), 50);
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
