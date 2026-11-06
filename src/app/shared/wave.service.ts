import { HttpClient, HttpRequest } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom, tap, timeout } from 'rxjs';
import { environment } from '../../environment/environment';
import { StorageService } from '../_services/storage.service';
import { Vague, VagueForm, VagueOuverte, VaguesResponse } from '../core/model/vague';

const STORE_PREFIX = 'wave-selection-';
const LOAD_TIMEOUT_MS = 8000;

const sameIds = (a: number[], b: number[]) => a.length === b.length && a.every(id => b.includes(id));

/**
 * Vagues du programme GYB et vague(s) affichée(s) par l'utilisateur.
 *
 *  - La sélection est un FILTRE D'AFFICHAGE (vide = toutes les vagues). Elle n'ouvre aucun droit : le serveur limite toujours
 *    un consultant à ses propres entreprises.
 *  - Elle est envoyée au serveur par l'intercepteur HTTP (paramètre ?vagues=2,3 sur les lectures de /api/), mémorisée par
 *    utilisateur quand il l'a choisie lui-même ; sinon on affiche les vagues « en cours ».
 *  - Changer de vague recrée la page affichée (voir WaveRouteReuseStrategy) : toutes les pages rechargent leurs données comme
 *    à l'ouverture, sans code propre à chacune.
 */
@Injectable({ providedIn: 'root' })
export class WaveService {

  private http = inject(HttpClient);
  private storage = inject(StorageService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  readonly waves = signal<Vague[]>([]);
  readonly openWaves = signal<VagueOuverte[]>([]);
  readonly loaded = signal(false);
  /** Vagues affichées ; liste vide = toutes */
  readonly selection = signal<number[]>([]);

  readonly isAll = computed(() => this.selection().length === 0);
  readonly selectedWaves = computed(() => {
    const sel = this.selection(), all = this.waves();
    return sel.length ? all.filter(w => sel.includes(w.id)) : all;
  });
  /** Entreprises visibles dans la sélection (pour un consultant : les siennes) */
  readonly companiesCount = computed(() => this.selectedWaves().reduce((n, w) => n + w.nb_entreprises, 0));
  readonly label = computed(() => {
    const sel = this.selection(), all = this.waves();
    if (!sel.length) return all.length === 1 ? all[0].nom : 'Toutes les vagues';
    const names = all.filter(w => sel.includes(w.id)).map(w => w.nom);
    return names.length <= 2 ? names.join(' + ') : `${names.length} vagues`;
  });

  /** Vrai pendant la navigation qui recrée la page après un changement de sélection (lu par WaveRouteReuseStrategy) */
  reloading = false;

  /**
   * Résolue quand la sélection est connue : les lectures de l'API l'attendent pour partir une seule fois, déjà filtrées.
   * Immédiate quand l'utilisateur a déjà choisi (sélection mémorisée) ou n'est pas connecté.
   */
  ready: Promise<void> = Promise.resolve();

  private resolveReady: (() => void) | null = null;
  private defaults: number[] = [];
  private manual = false;
  private userId = 0;

  constructor() {
    this.storage.currentUser$.subscribe(user => user ? this.start(user.id) : this.reset());
  }

  // ── Cycle de vie ────────────────────────────────────────────────────────────

  private start(userId: number): void {
    if (this.userId === userId) return;
    this.userId = userId;
    const stored = this.readStored(userId);
    this.manual = stored !== null;
    this.selection.set(stored ?? []);
    this.loaded.set(false);
    this.ready = stored !== null ? Promise.resolve() : new Promise<void>(resolve => { this.resolveReady = resolve; });
    // Sans choix mémorisé, la sélection par défaut vient du serveur : aucune page n'a encore lu de données, pas de rechargement.
    // Décalé d'un tour : la requête passe par l'intercepteur, qui reprend ce service par injection (pas pendant sa construction).
    const silent = stored === null;
    void Promise.resolve().then(() => this.refresh(silent));
  }

  private reset(): void {
    this.userId = 0;
    this.manual = false;
    this.defaults = [];
    this.waves.set([]);
    this.openWaves.set([]);
    this.selection.set([]);
    this.loaded.set(false);
    this.ready = Promise.resolve();
    this.resolveReady?.();
    this.resolveReady = null;
  }

  /** Recharge la liste des vagues (et leurs effectifs) ; remet la sélection d'aplomb si une vague a disparu */
  async refresh(silent = false): Promise<void> {
    try {
      const r = await firstValueFrom(this.http.get<VaguesResponse>(`${environment.apiUrl}/api/vagues`).pipe(timeout(LOAD_TIMEOUT_MS)));
      this.waves.set(r.vagues);
      this.openWaves.set(r.ouvertes);
      this.defaults = r.defaut;
      this.loaded.set(true);
      this.settle(silent);
    } catch {
      // Non bloquant : on garde la sélection actuelle (toutes les vagues si aucune)
    } finally {
      this.resolveReady?.();
      this.resolveReady = null;
    }
  }

  private settle(silent: boolean): void {
    const known = new Set(this.waves().map(w => w.id));
    const current = this.selection();
    let next = current.filter(id => known.has(id));
    if (!this.manual || (current.length > 0 && next.length === 0)) {
      next = this.defaults.filter(id => known.has(id));          // pas de choix de l'utilisateur, ou ses vagues n'existent plus
      this.manual = false;
    }
    if (next.length > 0 && next.length === known.size) next = [];   // toutes les vagues = « toutes » (celles à venir comprises)
    if (!sameIds(next, current)) {
      this.selection.set(next);
      if (!silent) this.reloadPage();
    }
  }

  // ── Choix de l'utilisateur ──────────────────────────────────────────────────

  /** Affiche ces vagues (toutes cochées = toutes, y compris celles à venir) */
  select(ids: number[]): void {
    const valid = ids.filter(id => this.waves().some(w => w.id === id));
    const next = valid.length === this.waves().length ? [] : valid;
    if (sameIds(next, this.selection())) return;
    this.manual = true;
    this.selection.set(next);
    this.store();
    this.reloadPage();
  }

  /** Revient aux vagues en cours */
  useDefault(): void {
    const known = new Set(this.waves().map(w => w.id));
    let next = this.defaults.filter(id => known.has(id));
    if (next.length > 0 && next.length === known.size) next = [];
    this.manual = false;
    this.clearStored();
    if (!sameIds(next, this.selection())) {
      this.selection.set(next);
      this.reloadPage();
    }
  }

  /** Vagues en cours (sélection par défaut), pour proposer le raccourci */
  get defaultSelection(): number[] { return this.defaults; }

  /** Recrée la page affichée : toutes ses données sont relues avec la nouvelle sélection */
  private reloadPage(): void {
    if (!this.router.navigated) return;          // aucune page encore affichée : rien à recharger
    this.reloading = true;
    this.router.navigateByUrl(this.router.url, { onSameUrlNavigation: 'reload', skipLocationChange: true })
      .catch(() => false)
      .finally(() => { this.reloading = false; });
  }

  // ── Intercepteur HTTP ───────────────────────────────────────────────────────

  /** Lectures de l'API auxquelles s'applique le filtre : toute lecture de /api/ sauf l'authentification et la liste des vagues */
  appliesTo(req: HttpRequest<unknown>): boolean {
    return req.method === 'GET'
      && req.url.startsWith(`${environment.apiUrl}/api/`)
      && !/\/api\/(auth|vagues)(\/|\?|$)/.test(req.url)
      && !req.params.has('vagues');
  }

  /** Valeur du paramètre ?vagues=, ou null pour « toutes » (le serveur n'a alors rien à filtrer) */
  get paramValue(): string | null {
    const sel = this.selection();
    return sel.length ? sel.join(',') : null;
  }

  // ── Administration (le serveur réserve ces appels à l'administrateur) ───────

  create(form: VagueForm) {
    return this.http.post<{ id: number }>(`${environment.apiUrl}/api/vagues`, form).pipe(tap(() => void this.refresh()));
  }

  update(id: number, form: Partial<VagueForm>) {
    return this.http.put<{ message: string }>(`${environment.apiUrl}/api/vagues/${id}`, form).pipe(tap(() => void this.refresh()));
  }

  remove(id: number) {
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/api/vagues/${id}`).pipe(tap(() => void this.refresh()));
  }

  moveCompanies(waveId: number, ids: number[]) {
    return this.http.put<{ moved: number }>(`${environment.apiUrl}/api/vagues/${waveId}/entreprises`, { ids }).pipe(tap(() => void this.refresh()));
  }

  // ── Mémorisation (par utilisateur, uniquement le choix explicite) ───────────

  private key(): string { return STORE_PREFIX + this.userId; }

  private readStored(userId: number): number[] | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      const raw = window.localStorage.getItem(STORE_PREFIX + userId);
      const value = raw ? JSON.parse(raw) : null;
      return value && value.manual && Array.isArray(value.ids) ? value.ids.filter(Number.isInteger) : null;
    } catch {
      return null;
    }
  }

  private store(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try { window.localStorage.setItem(this.key(), JSON.stringify({ manual: true, ids: this.selection() })); } catch { /* navigation privée : choix non mémorisé */ }
  }

  private clearStored(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try { window.localStorage.removeItem(this.key()); } catch { /* idem */ }
  }
}
