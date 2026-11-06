import { DOCUMENT } from '@angular/common';
import { Component, HostListener, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';
import { StorageService } from '../../../_services/storage.service';
import { STATUT_LABEL, Vague, VagueStatut, period } from '../../../core/model/vague';
import { WaveService } from '../../wave.service';

/** Pages dont les données dépendent de la vague affichée : listes d'entreprises, de consultants, de livrables et tableaux de bord */
const WAVE_PAGES = /^\/(consultant\/companies|manager\/(listconsult|listcompany|all-livrables|global|suivi-global|manOneConsult|consultant-profile|listLivrable|dashbord))(\/|\?|#|$)/;

/**
 * Bande « Vague 3 · 12 entreprises » sous l'en-tête, sur les pages dont les données dépendent de la vague, et feuille pour
 * choisir une ou plusieurs vagues (ou toutes). Pensée pour le téléphone : la feuille monte du bas de l'écran ; elle devient une
 * fenêtre centrée à partir de 576 px. Visible pour tous les rôles dès qu'il existe plusieurs vagues (l'administrateur la voit
 * toujours : c'est par là qu'il gère les vagues).
 */
@Component({
  selector: 'app-wave-bar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './wave-bar.component.html',
  styleUrl: './wave-bar.component.scss'
})
export class WaveBarComponent {

  readonly wave = inject(WaveService);
  private storage = inject(StorageService);
  private router = inject(Router);
  private document = inject(DOCUMENT);

  private user = toSignal(this.storage.currentUser$, { initialValue: this.storage.getUser() });
  private url = toSignal(
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd), map(e => e.urlAfterRedirects)),
    { initialValue: this.router.url }
  );

  readonly isAdmin = computed(() => ((this.user()?.roles ?? []) as string[]).includes('ROLE_ADMIN'));
  readonly visible = computed(() =>
    !!this.user() && WAVE_PAGES.test(this.url()) && this.wave.loaded() && (this.wave.waves().length > 1 || this.isAdmin()));

  readonly sheetOpen = signal(false);
  /** Choix en cours dans la feuille (liste vide = toutes les vagues) ; appliqué par « Afficher » */
  readonly draft = signal<number[]>([]);

  readonly totalCompanies = computed(() => this.wave.waves().reduce((n, w) => n + w.nb_entreprises, 0));

  constructor() {
    effect(() => this.document.body.classList.toggle('wave-lock', this.sheetOpen()));
  }

  open(): void {
    this.draft.set([...this.wave.selection()]);
    this.sheetOpen.set(true);
  }

  close(): void {
    this.sheetOpen.set(false);
  }

  toggle(id: number): void {
    this.draft.update(d => d.includes(id) ? d.filter(x => x !== id) : [...d, id]);
  }

  /** « Vagues en cours » : raccourci vers la sélection par défaut */
  currentOnly(): void {
    this.draft.set([...this.wave.defaultSelection]);
  }

  apply(): void {
    this.wave.select(this.draft());
    this.close();
  }

  showAll(): void {
    this.wave.select([]);
  }

  statusLabel(s: VagueStatut): string { return STATUT_LABEL[s]; }
  periodOf(v: Vague): string { return period(v); }
  plural(n: number): string { return `${n} entreprise${n > 1 ? 's' : ''}`; }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.sheetOpen()) this.close();
  }
}
