import { DOCUMENT } from '@angular/common';
import { Component, DestroyRef, ElementRef, HostListener, Injector, afterNextRender, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';
import { AuthService } from '../../../_services/auth.service';
import { StorageService } from '../../../_services/storage.service';
import { AvatarPipe, DEFAULT_AVATAR } from '../../../core/company-logo.pipe';
import { ShareServiceService } from '../../share-service.service';
import { TOOL_GROUPS, ToolGroup, ToolItem } from '../../tools.catalog';
import { hasAdminRole, hasManagerRole, roleLabel } from '../../../core/roles';

interface MenuItem extends ToolGroup {
    expanded?: boolean;
}

/** Entrée de la navigation principale. `match` décide si la page courante appartient à la rubrique (lien surligné). */
interface NavLink {
    label: string;
    icon: string;
    path: string;
    match: RegExp;
    /** Absent de la barre sur grand écran (l'accueil, c'est le logo) : seulement dans le tiroir */
    drawerOnly?: boolean;
}

const CONSULTANT_LINKS: NavLink[] = [
    { label: 'Accueil', icon: 'bi-house-door', path: '/consultant', match: /^\/consultant\/?(\?.*)?$/, drawerOnly: true },
    { label: 'Mes entreprises', icon: 'bi-buildings', path: '/consultant/companies', match: /^\/consultant\/(companies|newcompany|edit-company|dashbord|tool)(\/|\?|#|$)/ },
];

const MANAGER_LINKS: NavLink[] = [
    { label: 'Accueil', icon: 'bi-house-door', path: '/manager', match: /^\/manager\/?(home)?(\?.*)?$/, drawerOnly: true },
    { label: 'Consultants', icon: 'bi-person-lines-fill', path: '/manager/listconsult', match: /^\/manager\/(listconsult|manOneConsult|consultant-profile)(\/|\?|#|$)/ },
    { label: 'Entreprises', icon: 'bi-building', path: '/manager/listcompany/999999', match: /^\/manager\/(listcompany|company|company-livrables|newCompany)(\/|\?|#|$)/ },
    { label: 'Livrables', icon: 'bi-folder2-open', path: '/manager/all-livrables', match: /^\/manager\/(all-livrables|listLivrable)(\/|\?|#|$)/ },
    { label: 'Observation', icon: 'bi-speedometer2', path: '/manager/global', match: /^\/manager\/(global|dashbord)(\/|\?|#|$)/ },
    { label: 'Suivi et évaluation', icon: 'bi-graph-up-arrow', path: '/manager/suivi-global', match: /^\/manager\/suivi-global(\/|\?|#|$)/ },
];

/** Pages d'un consultant où les outils ont un sens (une entreprise est ouverte) */
const CONSULTANT_TOOLS_PAGES = /^\/consultant\/(dashbord|tool|edit-company)(\/|\?|#|$)/;

/**
 * En-tête de la plateforme, pensé d'abord pour le téléphone : une barre fixe de 52 px (menu, logo, Outils, compte) qui ne change
 * jamais de forme d'une page à l'autre. La navigation est un tiroir sur petit écran et passe dans la barre à partir de 768 px
 * (consultant) ou 992 px (manager, qui a six rubriques). Les outils s'ouvrent dans un panneau latéral.
 */
@Component({
    selector: 'app-header',
    standalone: true,
    imports: [RouterLink, AvatarPipe],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss'
})
export class HeaderComponent {

    private readonly router = inject(Router);
    private readonly storage = inject(StorageService);
    private readonly auth = inject(AuthService);
    private readonly share = inject(ShareServiceService);
    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly document = inject(DOCUMENT);
    private readonly injector = inject(Injector);
    private readonly destroyRef = inject(DestroyRef);

    readonly user = toSignal(this.storage.currentUser$, { initialValue: this.storage.getUser() });
    readonly url = toSignal(
        this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd), map(e => e.urlAfterRedirects)),
        { initialValue: this.router.url }
    );

    readonly isLoggedIn = computed(() => !!this.user());
    readonly isManager = computed(() => {
        const roles: string[] = this.user()?.roles ?? [];
        return hasManagerRole(roles);
    });
    /** Seul l'administrateur gère les comptes (rôles) et les vagues : ces pages ne sont pas dans la navigation principale, on les range dans le menu du compte */
    readonly isAdmin = computed(() => hasAdminRole(this.user()?.roles ?? []));
    readonly roleLabel = computed(() => {
        return roleLabel(this.user()?.roles);
    });
    readonly homeLink = computed(() => !this.isLoggedIn() ? '/' : this.isManager() ? '/manager' : '/consultant');
    readonly links = computed(() => this.isManager() ? MANAGER_LINKS : CONSULTANT_LINKS);
    readonly activePath = computed(() => this.links().find(l => l.match.test(this.url()))?.path ?? null);

    /** Les managers consultent les outils en aperçu depuis n'importe où ; un consultant, une fois une entreprise ouverte */
    readonly toolsEnabled = computed(() => this.isManager() || CONSULTANT_TOOLS_PAGES.test(this.url()));
    readonly currentTool = computed(() => /^\/consultant\/tool\/([^/?#]+)/.exec(this.url())?.[1] ?? null);

    readonly toolsOpen = toSignal(this.share.sidebarOpen$, { initialValue: false });
    readonly navOpen = signal(false);
    readonly userMenuOpen = signal(false);
    readonly toolsHint = signal(false);
    readonly loggingOut = signal(false);

    /** Menu des outils : construit à partir du catalogue (tools.catalog.ts), qui porte aussi l'état « Actif » / « Bientôt » */
    readonly menu: MenuItem[] = TOOL_GROUPS.map(group => ({ ...group, expanded: false }));

    private hintTimer: ReturnType<typeof setTimeout> | undefined;

    constructor() {
        // Chaque navigation referme les panneaux ouverts
        this.router.events.pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed()).subscribe(() => this.closeAll());

        // Un panneau ouvert fige la page derrière lui
        effect(() => this.document.body.classList.toggle('hdr-lock', this.navOpen() || this.toolsOpen()));
        this.destroyRef.onDestroy(() => {
            this.document.body.classList.remove('hdr-lock');
            clearTimeout(this.hintTimer);
        });
    }

    // ── Panneaux ────────────────────────────────────────────────────────────────

    toggleNav(): void {
        this.userMenuOpen.set(false);
        this.toolsHint.set(false);
        this.share.closeSidebar();
        this.navOpen.update(open => !open);
        if (this.navOpen()) this.focusLater('.hdr-drawer .hdr-drawer-link');
    }

    toggleUser(): void {
        this.toolsHint.set(false);
        this.userMenuOpen.update(open => !open);
    }

    openTools(): void {
        if (!this.toolsEnabled()) {
            this.showToolsHint();
            return;
        }
        this.navOpen.set(false);
        this.userMenuOpen.set(false);
        // On ouvre l'étape de l'outil en cours (la minute de réunion existe dans chaque étape : on ne sait pas laquelle)
        const tool = this.currentTool();
        if (tool && tool !== 't1b' && tool !== 'onbuild') {
            const index = this.menu.findIndex(g => g.children.some(c => c.route === tool));
            if (index >= 0) this.menu.forEach((g, i) => g.expanded = i === index);
        }
        this.share.openSidebar();
        this.focusLater('.hdr-panel .tools-close');
    }

    closeTools(): void {
        this.share.closeSidebar();
    }

    closeAll(): void {
        this.navOpen.set(false);
        this.userMenuOpen.set(false);
        this.toolsHint.set(false);
        this.share.closeSidebar();
    }

    private showToolsHint(): void {
        this.userMenuOpen.set(false);
        this.toolsHint.set(true);
        clearTimeout(this.hintTimer);
        this.hintTimer = setTimeout(() => this.toolsHint.set(false), 6000);
    }

    private focusLater(selector: string): void {
        afterNextRender(() => this.host.nativeElement.querySelector<HTMLElement>(selector)?.focus(), { injector: this.injector });
    }

    // ── Menu des outils ─────────────────────────────────────────────────────────

    toggleGroup(item: MenuItem): void {
        if (!item.children.length) return;
        const open = !item.expanded;
        this.menu.forEach(i => i.expanded = false);      // accordéon : une étape à la fois
        item.expanded = open;
    }

    /** Paramètres d'ouverture d'un outil : la minute de réunion de l'étape 2, 3 ou 4 s'ouvre sur son étape */
    toolQuery(tool: ToolItem, groupIndex: number): Record<string, string | number> {
        const query: Record<string, string | number> = { toolName: tool.label };
        if (tool.route === 't1b' && groupIndex > 0) query['etape'] = groupIndex;
        return query;
    }

    /** Ouverture d'un outil depuis le menu : un manager le voit comme un consultant, sans entreprise (aperçu non enregistré) */
    openTool(): void {
        if (this.storage.isManager()) this.storage.clearContext();
        this.closeTools();
    }

    isCurrent(tool: ToolItem): boolean {
        return tool.route === this.currentTool() && tool.route !== 't1b' && tool.route !== 'onbuild';
    }

    // ── Compte ──────────────────────────────────────────────────────────────────

    onAvatarError(event: Event): void {
        const img = event.target as HTMLImageElement;
        img.onerror = null;
        img.src = DEFAULT_AVATAR;
    }

    logout(): void {
        if (this.loggingOut()) return;
        this.loggingOut.set(true);
        this.auth.logout().subscribe({
            next: () => {
                this.storage.clean();
                window.location.reload();
            },
            error: () => this.loggingOut.set(false)
        });
    }

    // ── Clavier et clics extérieurs ─────────────────────────────────────────────

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event): void {
        const target = event.target as HTMLElement;
        if (this.userMenuOpen() && !target.closest('.hdr-user')) this.userMenuOpen.set(false);
        if (this.toolsHint() && !target.closest('.hdr-tools, .hdr-hint')) this.toolsHint.set(false);
    }

    @HostListener('document:keydown.escape')
    onEscape(): void {
        this.closeAll();
    }

    /** Si l'écran s'élargit (rotation d'une tablette) au point que la navigation passe dans la barre, le tiroir se referme */
    @HostListener('window:resize')
    onResize(): void {
        if (this.navOpen() && window.matchMedia(this.isManager() ? '(min-width: 992px)' : '(min-width: 768px)').matches) {
            this.navOpen.set(false);
        }
    }
}
