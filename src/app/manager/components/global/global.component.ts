import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Color, LegendPosition, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { ManagerService } from '../../manager.service';
import { StatRow } from '../../../core/model/stats';
import { CANAUX_VENTE } from '../../../core/model/entreprise-profil';
import { ScrollHintDirective } from '../../../shared/scroll-hint.directive';

type SortKey = 'name' | 'consultant' | 'region' | 'secteur' | 'effectif' | 'ca' | 'profil';
type SortDir = 'asc' | 'desc';
interface Ratio { yes: number; total: number; pct: number | null; }
interface Point { name: string; value: number; }

const NON_RENSEIGNE = 'Non renseigné';
const TYPE_ENTREPRISE: Record<string, string> = { familiale: 'Familiale', independante: 'Indépendante', cooperative: 'Coopérative' };
const CLIENTELE: Record<string, string> = { grand_public: 'Grand public', particuliers: 'Particuliers', entreprises: 'Entreprises', autre: 'Autre' };
const FACTURATION: Record<string, string> = { manuelle: 'Manuelle', electronique: 'Électronique', aucune: 'Aucune' };

@Component({
  selector: 'app-global',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgxChartsModule, ScrollHintDirective],
  templateUrl: './global.component.html',
  styleUrl: './global.component.scss',
})
export class GlobalComponent implements OnInit {

  rows: StatRow[] = [];
  filtered: StatRow[] = [];
  fx = { year: 2025, xafPerUsd: 580 };
  isLoading = true;
  loadError = false;
  showUsd = false;

  // Filtres
  search = '';
  fRegion = '';
  fSecteur = '';
  fConsultant = '';
  fType = '';
  fProfil: '' | 'avec' | 'sans' = '';
  regions: string[] = [];
  secteurs: string[] = [];
  consultants: string[] = [];
  readonly typesEntreprise = Object.entries(TYPE_ENTREPRISE).map(([value, label]) => ({ value, label }));

  // Tri et pagination
  sortKey: SortKey = 'name';
  sortDir: SortDir = 'asc';
  page = 1;
  readonly pageSize = 15;
  pageRows: StatRow[] = [];

  // Indicateurs
  kpi = {
    entreprises: 0, avecProfil: 0, pctProfil: null as number | null,
    effectif: 0, femmes: 0, hommes: 0, pctFemmes: null as number | null,
    caTotal: 0, caMoyen: 0, clients: 0,
    fiscal: this.ratio([], 'enregistrement_fiscal'), banque: this.ratio([], 'compte_bancaire'),
    suivi: this.ratio([], 'suivi_ca'), soutien: this.ratio([], 'soutien_programme'),
    subvention: this.ratio([], 'subvention_recue'),
  };

  // Graphiques
  parRegion: Point[] = [];
  parSecteur: Point[] = [];
  parType: Point[] = [];
  parClientele: Point[] = [];
  parCanal: Point[] = [];
  parGenre: Point[] = [];
  accesServices: Point[] = [];
  livrables: Point[] = [];

  readonly colors: Color = {
    name: 'platform', selectable: true, group: ScaleType.Ordinal,
    domain: ['#1a56db', '#0f9d58', '#f59e0b', '#e11d48', '#7c3aed', '#0891b2', '#64748b', '#ea580c']
  };
  readonly pctLabel = (v: number): string => v + ' %';
  readonly intTick = (v: number): string => Number.isInteger(v) ? String(v) : '';
  readonly legendBelow = LegendPosition.Below;

  fmt(n: number): string {
    return Number(n).toLocaleString('fr-FR');
  }

  constructor(
    private managerService: ManagerService,
    @Inject(PLATFORM_ID) private platformId: object,
  ) { }

  ngOnInit(): void {
    this.managerService.fetchStats().subscribe({
      next: data => {
        this.rows = data.entreprises;
        this.fx = data.fx ?? this.fx;
        this.regions = this.distinct(this.rows.map(r => r.region));
        this.secteurs = this.distinct(this.rows.map(r => r.secteur));
        this.consultants = this.distinct(this.rows.map(r => r.consultant));
        this.isLoading = false;
        this.applyFilters();
      },
      error: () => {
        this.loadError = true;
        this.isLoading = false;
      }
    });
  }

  // ── Filtres ─────────────────────────────────────────────────────────────────

  private distinct(values: (string | null)[]): string[] {
    return [...new Set(values.filter((v): v is string => !!v && v.trim() !== ''))].sort((a, b) => a.localeCompare(b, 'fr'));
  }

  applyFilters(): void {
    const q = this.search.trim().toLowerCase();
    this.filtered = this.rows.filter(r =>
      (!q || r.name.toLowerCase().includes(q) || (r.consultant ?? '').toLowerCase().includes(q)) &&
      (!this.fRegion || r.region === this.fRegion) &&
      (!this.fSecteur || r.secteur === this.fSecteur) &&
      (!this.fConsultant || r.consultant === this.fConsultant) &&
      (!this.fType || r.type_entreprise === this.fType) &&
      (!this.fProfil || (this.fProfil === 'avec' ? r.profil_id !== null : r.profil_id === null)));
    this.page = 1;
    this.computeStats();
    this.refreshTable();
  }

  resetFilters(): void {
    this.search = this.fRegion = this.fSecteur = this.fConsultant = this.fType = '';
    this.fProfil = '';
    this.applyFilters();
  }

  get hasFilters(): boolean {
    return !!(this.search || this.fRegion || this.fSecteur || this.fConsultant || this.fType || this.fProfil);
  }

  // ── Statistiques (calculées sur les lignes filtrées) ────────────────────────

  private ratio(rows: StatRow[], field: keyof StatRow): Ratio {
    const answered = rows.filter(r => r[field] !== null && r[field] !== undefined);
    const yes = answered.filter(r => !!r[field]).length;
    return { yes, total: answered.length, pct: answered.length ? Math.round(yes * 100 / answered.length) : null };
  }

  private count(values: (string | null)[], labels?: Record<string, string>): Point[] {
    const map = new Map<string, number>();
    values.forEach(v => {
      const key = v ? labels?.[v] ?? v : NON_RENSEIGNE;
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }

  private computeStats(): void {
    const rows = this.filtered;
    const profiled = rows.filter(r => r.profil_id !== null);

    const effectif = profiled.reduce((s, r) => s + (r.effectif_total ?? 0), 0);
    const femmes = profiled.reduce((s, r) => s + (r.effectif_femmes ?? 0), 0);
    const caTotal = profiled.reduce((s, r) => s + (Number(r.ca_total_fcfa) || 0), 0);

    this.kpi = {
      entreprises: rows.length,
      avecProfil: profiled.length,
      pctProfil: rows.length ? Math.round(profiled.length * 100 / rows.length) : null,
      effectif, femmes, hommes: Math.max(0, effectif - femmes),
      pctFemmes: effectif ? Math.round(femmes * 100 / effectif) : null,
      caTotal,
      caMoyen: profiled.length ? Math.round(caTotal / profiled.length) : 0,
      clients: profiled.reduce((s, r) => s + (r.clients_reguliers ?? 0), 0),
      fiscal: this.ratio(profiled, 'enregistrement_fiscal'),
      banque: this.ratio(profiled, 'compte_bancaire'),
      suivi: this.ratio(profiled, 'suivi_ca'),
      soutien: this.ratio(profiled, 'soutien_programme'),
      subvention: this.ratio(profiled, 'subvention_recue'),
    };

    this.parRegion = this.count(rows.map(r => r.region));
    this.parSecteur = this.count(rows.map(r => r.secteur));
    this.parType = this.count(profiled.filter(r => r.type_entreprise).map(r => r.type_entreprise), TYPE_ENTREPRISE);
    this.parClientele = this.count(profiled.filter(r => r.type_clientele).map(r => r.type_clientele), CLIENTELE);
    this.parCanal = CANAUX_VENTE
      .map(c => ({ name: c.label, value: profiled.filter(r => (r.canaux_vente ?? '').split(',').includes(c.value)).length }))
      .filter(p => p.value > 0)
      .sort((a, b) => b.value - a.value);
    this.parGenre = effectif ? [{ name: 'Femmes', value: femmes }, { name: 'Hommes', value: this.kpi.hommes }] : [];
    this.accesServices = ([
      ['Enregistrement fiscal', this.kpi.fiscal], ['Compte bancaire', this.kpi.banque], ['Suivi du CA', this.kpi.suivi],
      ['Programme de soutien', this.kpi.soutien], ['Subvention reçue', this.kpi.subvention],
    ] as [string, Ratio][]).filter(([, r]) => r.pct !== null).map(([name, r]) => ({ name, value: r.pct as number }));
    this.livrables = [
      { name: 'Prédiagnostic', value: rows.filter(r => r.nb_predia > 0).length },
      { name: 'Diagnostic Général', value: rows.filter(r => r.nb_diag > 0).length },
      { name: 'Profil (1L)', value: profiled.length },
    ];
  }

  // ── Tableau : tri et pagination ─────────────────────────────────────────────

  sortBy(key: SortKey): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDir = key === 'ca' || key === 'effectif' || key === 'profil' ? 'desc' : 'asc';
    }
    this.page = 1;
    this.refreshTable();
  }

  sortIcon(key: SortKey): string {
    if (this.sortKey !== key) return 'bi-arrow-down-up';
    return this.sortDir === 'asc' ? 'bi-sort-up' : 'bi-sort-down';
  }

  private sortValue(r: StatRow, key: SortKey): string | number | null {
    switch (key) {
      case 'name': return r.name;
      case 'consultant': return r.consultant;
      case 'region': return r.region;
      case 'secteur': return r.secteur;
      case 'effectif': return r.profil_id !== null ? r.effectif_total : null;
      case 'ca': return r.profil_id !== null ? Number(r.ca_total_fcfa) : null;
      case 'profil': return r.profil_updated_at;
    }
  }

  private refreshTable(): void {
    const dir = this.sortDir === 'asc' ? 1 : -1;
    const sorted = [...this.filtered].sort((a, b) => {
      const va = this.sortValue(a, this.sortKey);
      const vb = this.sortValue(b, this.sortKey);
      if (va === null && vb === null) return 0;
      if (va === null) return 1;            // valeurs vides toujours en dernier
      if (vb === null) return -1;
      const cmp = typeof va === 'number' && typeof vb === 'number'
        ? va - vb
        : String(va).localeCompare(String(vb), 'fr', { numeric: true });
      return cmp * dir;
    });
    this.sortedRows = sorted;
    this.updatePage();
  }

  sortedRows: StatRow[] = [];

  get pageCount(): number {
    return Math.max(1, Math.ceil(this.sortedRows.length / this.pageSize));
  }

  goToPage(p: number): void {
    this.page = Math.min(Math.max(1, p), this.pageCount);
    this.updatePage();
  }

  private updatePage(): void {
    this.pageRows = this.sortedRows.slice((this.page - 1) * this.pageSize, this.page * this.pageSize);
  }

  // ── Affichage ───────────────────────────────────────────────────────────────

  /** Montant en FCFA, ou converti en USD au taux fixe quand l'option est activée. */
  money(fcfa: number | null | undefined): string {
    const n = Number(fcfa) || 0;
    return this.showUsd
      ? '$ ' + Math.round(n / this.fx.xafPerUsd).toLocaleString('fr-FR')
      : n.toLocaleString('fr-FR') + ' FCFA';
  }

  yesNo(v: number | null): string {
    return v === null || v === undefined ? '—' : v ? 'Oui' : 'Non';
  }

  // ── Export CSV (ouvrable dans Excel) ────────────────────────────────────────

  exportCsv(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const header = ['Entreprise', 'Consultant', 'Région', 'Département', 'Ville', 'Secteur', 'Année de création',
      'Profil rempli', 'Effectif total', 'Dont femmes', 'Dont hommes', "Type d'entreprise", 'Enregistrement fiscal',
      'Facturation', 'Compte bancaire', 'Suivi du CA', 'CA mensuel (FCFA)', 'CA mensuel (USD)', 'Clients réguliers',
      'Clientèle', 'Canaux de vente', 'Programme de soutien', 'Subvention', 'Prédiagnostics', 'Diagnostics intégraux',
      'Dernière mise à jour du profil'];

    const lines = this.sortedRows.map(r => {
      const p = r.profil_id !== null;
      const hommes = p && r.effectif_total !== null ? Math.max(0, r.effectif_total - (r.effectif_femmes ?? 0)) : '';
      const canaux = (r.canaux_vente ?? '').split(',').filter(Boolean)
        .map(c => CANAUX_VENTE.find(x => x.value === c)?.label ?? c).join(', ');
      return [
        r.name, r.consultant, r.region, r.departement, r.ville, r.secteur, r.date_creation,
        p ? 'Oui' : 'Non', p ? r.effectif_total : '', p ? r.effectif_femmes : '', hommes,
        r.type_entreprise ? TYPE_ENTREPRISE[r.type_entreprise] : '', p ? this.yesNo(r.enregistrement_fiscal) : '',
        r.type_facturation ? FACTURATION[r.type_facturation] : '', p ? this.yesNo(r.compte_bancaire) : '',
        p ? this.yesNo(r.suivi_ca) : '',
        p ? Number(r.ca_total_fcfa) : '', p ? Math.round(Number(r.ca_total_fcfa) / this.fx.xafPerUsd) : '',
        p ? r.clients_reguliers : '', r.type_clientele ? CLIENTELE[r.type_clientele] : '', canaux,
        p ? this.yesNo(r.soutien_programme) : '', p ? this.yesNo(r.subvention_recue) : '',
        r.nb_predia, r.nb_diag, r.profil_updated_at ? r.profil_updated_at.substring(0, 10) : ''
      ].map(v => this.csvCell(v)).join(';');
    });

    const csv = '﻿' + [header.map(h => this.csvCell(h)).join(';'), ...lines].join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `statistiques_entreprises_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /** Échappe une cellule CSV et neutralise les formules (= + - @) qu'Excel exécuterait. */
  private csvCell(value: unknown): string {
    if (value === null || value === undefined) return '';
    let s = String(value);
    if (/^[=+\-@\t\r]/.test(s) && isNaN(Number(s))) s = "'" + s;
    return /[";\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  goBack(): void {
    history.back();
  }
}
