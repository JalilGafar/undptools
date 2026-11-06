import { CommonModule } from '@angular/common';
import { Component, DestroyRef, Input, OnInit, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LivrableGlobal } from '../../../core/model/livrable-global';
import { LIVRABLE_TYPES, groupOf, livrableUrl } from '../../livrable-types';
import { LivrableReviewService, OVERALL_LABEL, OverallState, ReviewStatus, ReviewSummary, lookupReview, overallState } from '../../../shared/livrable-review.service';
import { ReviewBadgeComponent } from '../../../shared/components/review-badge/review-badge.component';
import { StorageService } from '../../../_services/storage.service';
import { WaveService } from '../../../shared/wave.service';

/** État global d'un livrable d'après la mention de chaque instance : voir overallState (livrable-review.service.ts) */
type ReviewState = OverallState;
type StatusFilter = 'all' | 'non' | 'ameliorer' | 'partiel' | 'valide';
/** Filtre sur la mention d'une instance : '' = toutes, 'none' = pas encore évalué par cette instance */
type MarkFilter = '' | 'valide' | 'a_ameliorer' | 'none';
type SortKey = 'livrable' | 'company' | 'consultant' | 'ville' | 'secteur' | 'etape' | 'vague' | 'updated_at' | 'evaluation' | 'bp' | 'rblac';
type GroupKey = '' | 'consultant' | 'ville' | 'secteur' | 'type' | 'etape' | 'statut' | 'vague' | 'entreprise';

interface Row {
  key: string;
  item: LivrableGlobal;
  type: string;
  typeIcon: string;
  typeOrder: number;
  etapes: number[];
  etape: string;
  vague: string;
  state: ReviewState;
  review: ReviewSummary | undefined;
  /** Mention du Bureau Pays et du RBLAC (null = pas encore évalué par cette instance) */
  bp: ReviewStatus | null;
  rb: ReviewStatus | null;
  comments: number;
  unseen: boolean;
  search: string;
}

interface Group { key: string; label: string; rows: Row[]; evaluated: number; }

interface Option { value: string; label: string; count: number; }

const STATE_ORDER: Record<ReviewState, number> = { none: 0, ameliorer: 1, partiel: 2, valide: 3 };
const STATE_LABEL = OVERALL_LABEL;
const MARK_ORDER = (m: ReviewStatus | null): number => m === 'valide' ? 2 : m === 'a_ameliorer' ? 1 : 0;
const EMPTY = 'Non renseigné';
const PAGE = 40;
const VIEW_STATE_KEY = 'livrables-table-state';

const collator = new Intl.Collator('fr', { sensitivity: 'base', numeric: true });
const norm = (s: unknown): string => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Étapes du programme d'un livrable : 0 = pré-diagnostic, 1 à 4 ; vide si inconnue */
function etapesOf(l: LivrableGlobal): number[] {
  if (l.tool_code === 'attribut') return [0];
  if (groupOf(l) === 'tqw') return l.etapes?.length ? l.etapes : [Number(l.tool_code.slice(3)) || 1];
  if (l.tool_code === 't1b') return l.etape ? [l.etape] : [];
  if (l.tool_code === 't5sf' || l.tool_code === 'tsef') return [4];
  return [1];
}

const etapeLabel = (etapes: number[]): string =>
  !etapes.length ? '—' : etapes.length === 1 && etapes[0] === 0 ? 'Pré-diagnostic' : `Étape${etapes.length > 1 ? 's' : ''} ${etapes.join(', ')}`;

/**
 * Tous les livrables dans un tableau : recherche, filtres (type, étape, consultant, ville, secteur, vague), statut d'évaluation,
 * tri par colonne, regroupement et export CSV. Sur téléphone, chaque ligne devient une carte ; sur écran large, c'est un tableau.
 * Les filtres sont mémorisés pour la session : on retrouve sa liste en revenant d'un livrable.
 */
@Component({
  selector: 'app-livrables-table',
  standalone: true,
  imports: [CommonModule, FormsModule, ReviewBadgeComponent],
  templateUrl: './livrables-table.component.html',
  styleUrl: './livrables-table.component.scss'
})
export class LivrablesTableComponent implements OnInit {

  private reviewService = inject(LivrableReviewService);
  private storage = inject(StorageService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  readonly wave = inject(WaveService);

  private data = signal<LivrableGlobal[]>([]);
  @Input({ required: true }) set livrables(value: LivrableGlobal[]) { this.data.set(value ?? []); }

  private reviews = signal<Map<string, ReviewSummary>>(new Map());
  readonly reviewsReady = signal(false);

  // ── État de la vue ──
  readonly q = signal('');
  readonly status = signal<StatusFilter>('all');
  readonly fType = signal('');
  readonly fEtape = signal('');
  readonly fConsultant = signal('');
  readonly fVille = signal('');
  readonly fSecteur = signal('');
  readonly fVague = signal('');
  readonly fBp = signal<MarkFilter>('');
  readonly fRb = signal<MarkFilter>('');
  readonly groupBy = signal<GroupKey>('');
  readonly sortKey = signal<SortKey>('updated_at');
  readonly sortDir = signal<'asc' | 'desc'>('desc');
  readonly filtersOpen = signal(false);
  readonly shown = signal(PAGE);
  private collapsed = signal<Set<string>>(new Set());

  /** Écran large : tableau ; sinon cartes */
  readonly wide = signal(true);

  readonly STATE_LABEL = STATE_LABEL;

  // ── Lignes ──
  readonly rows = computed<Row[]>(() => this.data().map(item => {
    const type = groupOf(item);
    const meta = LIVRABLE_TYPES.find(t => t.tool_code === type);
    const review = this.reviewsReady() ? lookupReview(this.reviews(), item.comp_id, item.cons_id, item.tool_code, item.id_livrable) : undefined;
    const etapes = etapesOf(item);
    const vague = item.vague ?? '';
    return {
      key: `${item.tool_code}:${item.id_livrable}`,
      item,
      type: meta?.label ?? item.livrable,
      typeIcon: meta?.icon ?? 'bi-file-earmark',
      typeOrder: meta ? LIVRABLE_TYPES.indexOf(meta) : 99,
      etapes, etape: etapeLabel(etapes), vague,
      state: overallState(review), review,
      bp: review?.bp_status ?? null, rb: review?.rblac_status ?? null, comments: review?.nb_comments ?? 0, unseen: !!review?.unseen,
      search: norm([item.livrable, item.company, item.consultant, item.ville, item.region, item.secteur, vague, etapeLabel(etapes)].join(' '))
    } as Row;
  }));

  readonly multiWave = computed(() => this.wave.waves().length > 1 || new Set(this.rows().map(r => r.vague).filter(Boolean)).size > 1);

  private matches(r: Row, ignoreStatus = false): boolean {
    const q = norm(this.q()).trim();
    if (q && !q.split(/\s+/).every(w => r.search.includes(w))) return false;
    if (this.fType() && groupOf(r.item) !== this.fType()) return false;
    if (this.fEtape() !== '' && !r.etapes.includes(Number(this.fEtape()))) return false;
    if (this.fConsultant() && r.item.consultant !== this.fConsultant()) return false;
    if (this.fVille() && (r.item.ville || EMPTY) !== this.fVille()) return false;
    if (this.fSecteur() && (r.item.secteur || EMPTY) !== this.fSecteur()) return false;
    if (this.fVague() && (r.vague || EMPTY) !== this.fVague()) return false;
    if (this.fBp() && (r.bp ?? 'none') !== this.fBp()) return false;
    if (this.fRb() && (r.rb ?? 'none') !== this.fRb()) return false;
    if (!ignoreStatus) {
      const s = this.status();
      if (s === 'non' && r.state !== 'none') return false;
      if (s === 'ameliorer' && r.state !== 'ameliorer') return false;
      if (s === 'partiel' && r.state !== 'partiel') return false;
      if (s === 'valide' && r.state !== 'valide') return false;
    }
    return true;
  }

  /** Effectifs des pastilles de statut : ils suivent la recherche et les filtres, mais pas le statut lui-même */
  readonly counts = computed(() => {
    const base = this.rows().filter(r => this.matches(r, true));
    return {
      all: base.length,
      non: base.filter(r => r.state === 'none').length,
      ameliorer: base.filter(r => r.state === 'ameliorer').length,
      partiel: base.filter(r => r.state === 'partiel').length,
      valide: base.filter(r => r.state === 'valide').length
    };
  });

  readonly filtered = computed(() => this.rows().filter(r => this.matches(r)));

  readonly sorted = computed(() => {
    const dir = this.sortDir() === 'asc' ? 1 : -1;
    const key = this.sortKey();
    const text = (r: Row): string => {
      switch (key) {
        case 'livrable': return r.item.livrable;
        case 'company': return r.item.company;
        case 'consultant': return r.item.consultant;
        case 'ville': return r.item.ville;
        case 'secteur': return r.item.secteur;
        case 'vague': return r.vague;
        default: return '';
      }
    };
    return [...this.filtered()].sort((a, b) => {
      let c = 0;
      if (key === 'updated_at') c = (a.item.updated_at ?? '').localeCompare(b.item.updated_at ?? '');
      else if (key === 'evaluation') c = STATE_ORDER[a.state] - STATE_ORDER[b.state];
      else if (key === 'bp') c = MARK_ORDER(a.bp) - MARK_ORDER(b.bp);
      else if (key === 'rblac') c = MARK_ORDER(a.rb) - MARK_ORDER(b.rb);
      else if (key === 'etape') c = (a.etapes[0] ?? 9) - (b.etapes[0] ?? 9);
      else if (key === 'livrable') c = a.typeOrder - b.typeOrder || collator.compare(a.item.livrable, b.item.livrable);
      else {
        const x = text(a), y = text(b);
        if (!x !== !y) return x ? -1 : 1;                 // les valeurs vides restent en bas, quel que soit le sens
        c = collator.compare(x, y);
      }
      // À égalité : le plus récemment modifié d'abord
      return c * dir || (b.item.updated_at ?? '').localeCompare(a.item.updated_at ?? '');
    });
  });

  readonly visible = computed(() => this.sorted().slice(0, this.shown()));

  // ── Regroupement ──
  readonly groups = computed<Group[] | null>(() => {
    const by = this.groupBy();
    if (!by) return null;
    const keyOf = (r: Row): string => {
      switch (by) {
        case 'consultant': return r.item.consultant || EMPTY;
        case 'ville': return r.item.ville || EMPTY;
        case 'secteur': return r.item.secteur || EMPTY;
        case 'vague': return r.vague || EMPTY;
        case 'entreprise': return r.item.company || EMPTY;
        case 'type': return r.type;
        case 'etape': return r.etape;
        default: return STATE_LABEL[r.state];
      }
    };
    const map = new Map<string, Row[]>();
    for (const r of this.sorted()) {
      const k = keyOf(r);
      (map.get(k) ?? map.set(k, []).get(k)!).push(r);
    }
    const out = [...map.entries()].map(([key, rows]) => ({ key, label: key, rows, evaluated: rows.filter(r => r.state !== 'none').length }));
    const rank = (g: Group): number => by === 'statut' ? STATE_ORDER[g.rows[0].state] : by === 'type' ? g.rows[0].typeOrder : by === 'etape' ? (g.rows[0].etapes[0] ?? 9) : 0;
    return out.sort((a, b) => {
      if ((a.key === EMPTY) !== (b.key === EMPTY)) return a.key === EMPTY ? 1 : -1;
      return rank(a) - rank(b) || collator.compare(a.key, b.key);
    });
  });

  // ── Listes de filtres (avec effectifs) ──
  private options(valueOf: (r: Row) => string, order?: (a: Option, b: Option) => number): Option[] {
    const map = new Map<string, number>();
    for (const r of this.rows()) { const v = valueOf(r); map.set(v, (map.get(v) ?? 0) + 1); }
    return [...map.entries()].map(([value, count]) => ({ value, label: value, count }))
      .sort(order ?? ((a, b) => (a.value === EMPTY ? 1 : b.value === EMPTY ? -1 : collator.compare(a.value, b.value))));
  }

  readonly typeOptions = computed<Option[]>(() => {
    const present = new Map<string, number>();
    this.rows().forEach(r => { const g = groupOf(r.item); present.set(g, (present.get(g) ?? 0) + 1); });
    return LIVRABLE_TYPES.filter(t => present.has(t.tool_code)).map(t => ({ value: t.tool_code, label: t.label, count: present.get(t.tool_code)! }));
  });
  readonly etapeOptions = computed<Option[]>(() => [0, 1, 2, 3, 4]
    .map(n => ({ value: String(n), label: etapeLabel([n]), count: this.rows().filter(r => r.etapes.includes(n)).length }))
    .filter(o => o.count > 0));
  readonly consultantOptions = computed(() => this.options(r => r.item.consultant || EMPTY));
  readonly villeOptions = computed(() => this.options(r => r.item.ville || EMPTY));
  readonly secteurOptions = computed(() => this.options(r => r.item.secteur || EMPTY));
  readonly vagueOptions = computed(() => this.options(r => r.vague || EMPTY));

  readonly activeFilters = computed(() =>
    [this.fType(), this.fEtape(), this.fConsultant(), this.fVille(), this.fSecteur(), this.fVague(), this.fBp(), this.fRb()].filter(v => v !== '').length);

  /** Pastille du bouton « Filtres » : filtres actifs (+ le regroupement, rangé dans le panneau sur téléphone) */
  readonly panelBadge = computed(() => this.activeFilters() + (!this.wide() && this.groupBy() ? 1 : 0));

  groupLabel(): string {
    return ({ consultant: 'consultant', ville: 'ville', secteur: "secteur d'activité", statut: "statut d'évaluation", type: 'type de livrable',
              etape: 'étape', vague: 'vague', entreprise: 'entreprise', '': '' } as Record<string, string>)[this.groupBy()];
  }

  readonly hasCriteria = computed(() => this.activeFilters() > 0 || this.status() !== 'all' || this.q().trim() !== '');

  constructor() {
    this.restoreState();

    // Nouveau tri ou nouveaux critères : on repart de la première page
    effect(() => { this.filtered(); this.sortKey(); this.sortDir(); untracked(() => this.shown.set(PAGE)); });
    // Mémorisation de la vue pour la session (retour depuis un livrable)
    effect(() => this.saveState());
  }

  ngOnInit(): void {
    this.reviewService.summary().subscribe(map => { this.reviews.set(map); this.reviewsReady.set(true); });

    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(min-width: 768px)');
      const update = () => this.wide.set(mq.matches);
      update();
      mq.addEventListener('change', update);
      this.destroyRef.onDestroy(() => mq.removeEventListener('change', update));
    }
  }

  // ── Actions ──
  /** Clic sur un en-tête (ou choix dans la liste « Trier par ») : même colonne = on inverse ; autre colonne = sens par défaut (récent d'abord pour les dates) */
  sortBy(key: SortKey): void {
    if (this.sortKey() === key) this.sortDir.update(d => d === 'asc' ? 'desc' : 'asc');
    else this.chooseSort(key);
  }

  chooseSort(key: SortKey): void {
    this.sortKey.set(key);
    this.sortDir.set(key === 'updated_at' ? 'desc' : 'asc');
  }

  sortIcon(key: SortKey): string {
    return this.sortKey() !== key ? 'bi-arrow-down-up' : this.sortDir() === 'asc' ? 'bi-sort-up' : 'bi-sort-down';
  }

  ariaSort(key: SortKey): 'ascending' | 'descending' | 'none' {
    return this.sortKey() !== key ? 'none' : this.sortDir() === 'asc' ? 'ascending' : 'descending';
  }

  toggleDir(): void { this.sortDir.update(d => d === 'asc' ? 'desc' : 'asc'); }

  resetAll(): void {
    this.q.set(''); this.status.set('all');
    this.fType.set(''); this.fEtape.set(''); this.fConsultant.set(''); this.fVille.set(''); this.fSecteur.set(''); this.fVague.set('');
    this.fBp.set(''); this.fRb.set('');
  }

  isCollapsed(key: string): boolean { return this.collapsed().has(key); }

  toggleGroup(key: string): void {
    this.collapsed.update(s => { const n = new Set(s); n.has(key) ? n.delete(key) : n.add(key); return n; });
  }

  showMore(): void { this.shown.update(n => n + PAGE); }

  colCount(): number { return 9 + (this.multiWave() ? 1 : 0); }

  markLabel(m: ReviewStatus | null): string { return m === 'valide' ? 'Validé' : m === 'a_ameliorer' ? 'À améliorer' : '—'; }

  initial(name: string): string { return (name ?? '').trim().charAt(0).toUpperCase() || '?'; }

  open(r: Row): void {
    this.storage.setIdComp(r.item.comp_id);
    this.storage.setIdConsultant(r.item.cons_id);
    this.router.navigateByUrl(livrableUrl(r.item.tool_code, r.item.id_livrable));
  }

  // ── Export ──
  exportCsv(): void {
    const head = ['Livrable', 'Type', 'Entreprise', 'Consultant', 'Ville', 'Région', "Secteur d'activité", 'Étape', 'Vague', 'Créé le', 'Modifié le', 'Bureau Pays', 'RBLAC', 'Statut global', 'Commentaires'];
    const cell = (v: unknown): string => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const day = (iso: string | undefined): string => (iso ?? '').slice(0, 10).split('-').reverse().join('/');
    const lines = this.sorted().map(r => [
      r.item.livrable, r.type, r.item.company, r.item.consultant, r.item.ville, r.item.region, r.item.secteur, r.etape, r.vague,
      day(r.item.date), day(r.item.updated_at),
      this.reviewsReady() ? (r.bp ? this.markLabel(r.bp) : 'Pas encore évalué') : '', this.reviewsReady() ? (r.rb ? this.markLabel(r.rb) : 'Pas encore évalué') : '',
      this.reviewsReady() ? STATE_LABEL[r.state] : '', r.comments
    ].map(cell).join(';'));
    // BOM + point-virgule : s'ouvre correctement dans Excel en français
    const blob = new Blob(['﻿' + [head.map(cell).join(';'), ...lines].join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `livrables-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // ── Mémorisation de la vue ──
  private saveState(): void {
    const state = {
      q: this.q(), status: this.status(), fType: this.fType(), fEtape: this.fEtape(), fConsultant: this.fConsultant(), fVille: this.fVille(),
      fSecteur: this.fSecteur(), fVague: this.fVague(), fBp: this.fBp(), fRb: this.fRb(), groupBy: this.groupBy(), sortKey: this.sortKey(), sortDir: this.sortDir()
    };
    try { sessionStorage.setItem(VIEW_STATE_KEY, JSON.stringify(state)); } catch { /* navigation privée : vue non mémorisée */ }
  }

  private restoreState(): void {
    try {
      const raw = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(VIEW_STATE_KEY) : null;
      if (!raw) return;
      const s = JSON.parse(raw);
      this.q.set(s.q ?? ''); this.status.set(s.status ?? 'all');
      this.fType.set(s.fType ?? ''); this.fEtape.set(s.fEtape ?? ''); this.fConsultant.set(s.fConsultant ?? '');
      this.fVille.set(s.fVille ?? ''); this.fSecteur.set(s.fSecteur ?? ''); this.fVague.set(s.fVague ?? '');
      this.fBp.set(s.fBp ?? ''); this.fRb.set(s.fRb ?? '');
      this.groupBy.set(s.groupBy ?? ''); this.sortKey.set(s.sortKey ?? 'updated_at'); this.sortDir.set(s.sortDir ?? 'desc');
      if (this.activeFilters() > 0) this.filtersOpen.set(true);
    } catch { /* état illisible : vue par défaut */ }
  }
}
