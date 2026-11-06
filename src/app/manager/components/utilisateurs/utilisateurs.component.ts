import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ManagerService } from '../../manager.service';
import { StorageService } from '../../../_services/storage.service';
import { AvatarPipe, DEFAULT_AVATAR } from '../../../core/company-logo.pipe';
import { ManagedUser } from '../../../core/model/user';
import { LoadErrorComponent, LoadingComponent } from '../../../shared/components/loading/loading.component';

interface RoleChoice { value: string; label: string; hint: string; icon: string; }

/** Rôles de la plateforme et ce que chacun permet (même vocabulaire que l'évaluation des livrables) */
const ROLE_CHOICES: RoleChoice[] = [
  { value: 'admin', label: 'Administrateur', hint: 'Bureau Pays : gère les rôles et les vagues, commente et évalue les livrables', icon: 'bi-shield-check' },
  { value: 'evaluateur', label: 'Évaluateur', hint: 'RBLAC : commente et évalue les livrables', icon: 'bi-patch-check' },
  { value: 'moderator', label: 'Modérateur', hint: "Commente les livrables, mais ne les évalue pas", icon: 'bi-chat-left-text' },
  { value: 'consultant', label: 'Consultant', hint: 'Remplit les outils de ses entreprises', icon: 'bi-person-badge' },
  { value: 'entreprise', label: 'Entreprise', hint: "Compte d'une entreprise accompagnée", icon: 'bi-building' },
];

/**
 * Gestion des rôles (administrateur uniquement) : liste des comptes, recherche, filtre par rôle, changement de rôle avec confirmation.
 * Un utilisateur n'a qu'un seul rôle. On ne peut pas modifier son propre rôle (il faut un autre administrateur).
 */
@Component({
  selector: 'app-utilisateurs',
  standalone: true,
  imports: [CommonModule, FormsModule, AvatarPipe, LoadingComponent, LoadErrorComponent],
  templateUrl: './utilisateurs.component.html',
  styleUrl: './utilisateurs.component.scss'
})
export class UtilisateursComponent implements OnInit {

  private managerService = inject(ManagerService);
  private storage = inject(StorageService);
  private route = inject(ActivatedRoute);

  readonly roles = ROLE_CHOICES;
  readonly users = signal<ManagedUser[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly message = signal<{ type: 'success' | 'danger'; text: string } | null>(null);
  readonly busy = signal(false);

  readonly q = signal('');
  readonly roleFilter = signal('');
  readonly editingId = signal<number | null>(null);
  newRole = '';

  readonly myId = this.storage.getUser()?.id ?? 0;

  readonly counts = computed(() => {
    const c: Record<string, number> = {};
    this.users().forEach(u => { const r = u.role ?? ''; c[r] = (c[r] ?? 0) + 1; });
    return c;
  });

  readonly shown = computed(() => {
    const q = this.norm(this.q()).trim();
    return this.users().filter(u => (!this.roleFilter() || u.role === this.roleFilter())
      && (!q || this.norm(u.username + ' ' + (u.email ?? '')).includes(q)));
  });

  ngOnInit(): void {
    // Arrivée depuis un profil (« Changer le rôle ») : la liste est déjà filtrée sur ce compte
    this.q.set(this.route.snapshot.queryParamMap.get('q') ?? '');
    this.load();
  }

  private norm(s: string): string {
    return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

  load(): void {
    this.loading.set(true);
    this.loadError.set(false);
    this.managerService.fetchManagedUsers().subscribe({
      next: list => { this.users.set(list); this.loading.set(false); },
      error: () => { this.loadError.set(true); this.loading.set(false); }
    });
  }

  roleLabel(role: string | null): string {
    return this.roles.find(r => r.value === role)?.label ?? 'Sans rôle';
  }

  roleOf(role: string | null): RoleChoice | undefined {
    return this.roles.find(r => r.value === role);
  }

  edit(u: ManagedUser): void {
    this.message.set(null);
    this.newRole = u.role ?? 'consultant';
    this.editingId.set(u.id);
  }

  cancel(): void { this.editingId.set(null); }

  /** Un consultant garde ses entreprises s'il change de rôle : on prévient avant de confirmer */
  warn(u: ManagedUser): boolean {
    return u.nb_entreprises > 0 && this.newRole !== 'consultant';
  }

  save(u: ManagedUser): void {
    if (this.busy() || this.newRole === u.role) { this.cancel(); return; }
    this.busy.set(true);
    this.managerService.changeUserRole(u.id, this.newRole).subscribe({
      next: () => {
        this.busy.set(false);
        this.users.update(list => list.map(x => x.id === u.id ? { ...x, role: this.newRole } : x));
        this.editingId.set(null);
        this.message.set({ type: 'success', text: `${u.username} est maintenant ${this.roleLabel(this.newRole).toLowerCase()}. Le changement s'affiche à sa prochaine connexion ; côté droits, il est immédiat.` });
      },
      error: err => {
        this.busy.set(false);
        this.message.set({ type: 'danger', text: err.error?.message ?? 'Le changement de rôle a échoué.' });
      }
    });
  }

  dismiss(): void { this.message.set(null); }
  onAvatarError(event: Event): void { const img = event.target as HTMLImageElement; img.onerror = null; img.src = DEFAULT_AVATAR; }
  goBack(): void { history.back(); }
}
