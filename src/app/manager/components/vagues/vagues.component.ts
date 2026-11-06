import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable, forkJoin } from 'rxjs';
import { ManagerService } from '../../manager.service';
import { WaveService } from '../../../shared/wave.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { Company } from '../../../core/model/company';
import { STATUT_LABEL, Vague, VagueForm, VagueStatut, period } from '../../../core/model/vague';

interface Editor extends VagueForm { id: number | null; }
type Pending = { kind: 'cloturer' | 'rouvrir' | 'supprimer'; id: number } | null;
interface Row extends Company { consultant: string; }

/**
 * Administration des vagues du GYB (administrateur uniquement) : créer, dater, démarrer, clôturer / rouvrir et supprimer une
 * vague, puis répartir les entreprises entre les vagues. Clôturer une vague verrouille les saisies des consultants sur ses entreprises.
 */
@Component({
  selector: 'app-vagues',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './vagues.component.html',
  styleUrl: './vagues.component.scss'
})
export class VaguesComponent implements OnInit {

  readonly wave = inject(WaveService);
  private managerService = inject(ManagerService);

  readonly message = signal<{ type: 'success' | 'danger'; text: string } | null>(null);
  readonly editor = signal<Editor | null>(null);
  readonly pending = signal<Pending>(null);
  readonly busy = signal(false);
  readonly STATUTS: VagueStatut[] = ['planifiee', 'en_cours', 'cloturee'];

  // ── Répartition des entreprises ──
  readonly loadingCompanies = signal(true);
  private companies = signal<Row[]>([]);
  filterWave = 0;                // 0 = toutes les vagues
  search = '';
  target = 0;
  readonly selectedIds = signal<number[]>([]);

  readonly rows = computed(() => {
    const q = this.search.trim().toLowerCase();
    return this.companies().filter(c => (!this.filterWave || c.id_vague === this.filterWave)
      && (!q || (c.name ?? '').toLowerCase().includes(q) || c.consultant.toLowerCase().includes(q)));
  });

  ngOnInit(): void {
    void this.wave.refresh(true);
    this.loadCompanies();
  }

  // ── Vagues ──────────────────────────────────────────────────────────────────

  statusLabel(s: VagueStatut): string { return STATUT_LABEL[s]; }
  periodOf(v: Vague): string { return period(v); }

  newWave(): void {
    this.pending.set(null);
    this.editor.set({ id: null, nom: '', date_debut: null, date_fin: null, statut: 'planifiee' });
  }

  edit(v: Vague): void {
    this.pending.set(null);
    this.editor.set({ id: v.id, nom: v.nom, date_debut: v.date_debut, date_fin: v.date_fin, statut: v.statut });
  }

  cancelEdit(): void { this.editor.set(null); }

  save(): void {
    const e = this.editor();
    if (!e || this.busy()) return;
    if (!e.nom.trim()) { this.fail('Donnez un nom à la vague.'); return; }
    const form: VagueForm = { nom: e.nom.trim(), date_debut: e.date_debut || null, date_fin: e.date_fin || null, statut: e.statut };
    this.busy.set(true);
    const request: Observable<unknown> = e.id === null ? this.wave.create(form) : this.wave.update(e.id, form);
    request.subscribe({
      next: () => { this.busy.set(false); this.editor.set(null); this.ok(e.id === null ? 'Vague créée.' : 'Vague enregistrée.'); },
      error: err => { this.busy.set(false); this.fail(err.error?.message ?? "L'enregistrement a échoué."); }
    });
  }

  /** Démarrer, clôturer ou rouvrir. Clôturer et rouvrir passent par une confirmation : elles changent ce que les consultants peuvent faire. */
  ask(kind: NonNullable<Pending>['kind'], v: Vague): void {
    this.editor.set(null);
    this.pending.set({ kind, id: v.id });
  }

  cancelAsk(): void { this.pending.set(null); }

  start(v: Vague): void { this.setStatus(v, 'en_cours', 'Vague démarrée.'); }

  confirm(v: Vague): void {
    const p = this.pending();
    if (!p || p.id !== v.id) return;
    if (p.kind === 'cloturer') this.setStatus(v, 'cloturee', 'Vague clôturée : les saisies des consultants sont verrouillées.');
    else if (p.kind === 'rouvrir') this.setStatus(v, 'en_cours', 'Vague rouverte : les consultants peuvent de nouveau saisir.');
    else this.remove(v);
  }

  private setStatus(v: Vague, statut: VagueStatut, done: string): void {
    this.busy.set(true);
    this.wave.update(v.id, { statut }).subscribe({
      next: () => { this.busy.set(false); this.pending.set(null); this.ok(done); },
      error: err => { this.busy.set(false); this.fail(err.error?.message ?? 'Le changement a échoué.'); }
    });
  }

  private remove(v: Vague): void {
    this.busy.set(true);
    this.wave.remove(v.id).subscribe({
      next: () => { this.busy.set(false); this.pending.set(null); this.ok('Vague supprimée.'); },
      error: err => { this.busy.set(false); this.pending.set(null); this.fail(err.error?.message ?? 'La suppression a échoué.'); }
    });
  }

  // ── Répartition ─────────────────────────────────────────────────────────────

  private loadCompanies(): void {
    this.loadingCompanies.set(true);
    // Le nom du consultant de chaque entreprise vient de la liste des utilisateurs
    forkJoin({ users: this.managerService.fetchUsers(), list: this.managerService.fetchAllCompanies() }).subscribe({
      next: ({ users, list }) => {
        const names = new Map(users.map(u => [u.id, u.username]));
        this.companies.set(list.map(c => ({ ...c, consultant: names.get(c.id_consl ?? 0) ?? '—' })));
        this.loadingCompanies.set(false);
      },
      error: () => { this.loadingCompanies.set(false); this.fail('Impossible de charger les entreprises.'); }
    });
  }

  isSelected(c: Row): boolean { return this.selectedIds().includes(c.id); }

  toggleCompany(c: Row): void {
    this.selectedIds.update(ids => ids.includes(c.id) ? ids.filter(x => x !== c.id) : [...ids, c.id]);
  }

  allShownSelected(): boolean {
    const shown = this.rows();
    return shown.length > 0 && shown.every(c => this.selectedIds().includes(c.id));
  }

  toggleAllShown(): void {
    const shown = this.rows().map(c => c.id);
    this.selectedIds.update(ids => this.allShownSelected() ? ids.filter(id => !shown.includes(id)) : [...new Set([...ids, ...shown])]);
  }

  waveName(id: number | undefined): string {
    return this.wave.waves().find(w => w.id === id)?.nom ?? '—';
  }

  move(): void {
    const ids = this.selectedIds();
    if (!ids.length || !this.target || this.busy()) return;
    this.busy.set(true);
    this.wave.moveCompanies(this.target, ids).subscribe({
      next: r => {
        this.busy.set(false);
        const target = this.target;
        this.companies.update(list => list.map(c => ids.includes(c.id) ? { ...c, id_vague: target } : c));
        this.selectedIds.set([]);
        this.ok(`${r.moved} entreprise${r.moved > 1 ? 's' : ''} déplacée${r.moved > 1 ? 's' : ''} vers « ${this.waveName(target)} ».`);
      },
      error: err => { this.busy.set(false); this.fail(err.error?.message ?? 'Le déplacement a échoué.'); }
    });
  }

  // ── Messages ────────────────────────────────────────────────────────────────

  private ok(text: string): void { this.message.set({ type: 'success', text }); }
  private fail(text: string): void { this.message.set({ type: 'danger', text }); }
  dismiss(): void { this.message.set(null); }

  goBack(): void { history.back(); }
}
