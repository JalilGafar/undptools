import { Component, DestroyRef, HostListener, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PrimengModule } from '../../primeng.module';
import { MegaMenuItem } from 'primeng/api';
import { ConsultantRoutingModule } from "../../../consultant/consultant-routing.module";
import { filter, Observable } from 'rxjs';
import { ShareServiceService } from '../../share-service.service';
import { StorageService } from '../../../_services/storage.service';
import { AuthService } from '../../../_services/auth.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { TOOL_GROUPS, ToolGroup } from '../../tools.catalog';

interface MenuItem extends ToolGroup {
    expanded?: boolean;
}


@Component({
    selector: 'app-header',
    standalone: true,
    imports: [
        PrimengModule,
        ConsultantRoutingModule,
    ],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {

    menuVisible$!: Observable<boolean>;
    manMenuVisible$!: Observable<boolean>;
    visible: boolean = false;
    items: MegaMenuItem[] | undefined;
    visibleTools$!: Observable<boolean>;

    isSidebarOpen = false;
    isSidebarMini = false;
    isNavOpen = false;

    private roles: string[] = [];
    isLoggedIn = false;
    showAdminBoard = false;
    showModeratorBoard = false;
    showConsultantBoard = false;
    username?: string;

    // Menu des outils : construit à partir du catalogue (src/app/shared/tools.catalog.ts), qui porte aussi
    // l'état « Actif » / « Bientôt » de chaque outil.
    menu: MenuItem[] = TOOL_GROUPS.map(group => ({ ...group, expanded: false }));

    private destroyRef = inject(DestroyRef);

    constructor(
        private menuService: ShareServiceService,
        private router: Router,
        private storageService: StorageService,
        private authService: AuthService,
        private route: ActivatedRoute
    ) {
        this.router.events
            .pipe(filter(e => e instanceof NavigationEnd))
            .subscribe((event: any) => {
                if (event.url.startsWith('/consultant/')) {
                    this.menuService.showMenu();
                } else if (event.url.startsWith('/manager')) {
                    this.menuService.showManMenu();
                } else {
                    this.menuService.hideManMenu();
                    this.menuService.hideMenu();
                }
            });
    }

    ngOnInit(): void {
        this.route.params.subscribe(() => {
            this.visibleTools$ = this.storageService.visibleTools$;
        });

        this.menuVisible$ = this.menuService.menuVisible$;
        this.manMenuVisible$ = this.menuService.manMenuVisible$;

        // Abonnement réactif : se déclenche à chaque login/logout sans rechargement
        this.storageService.currentUser$.pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(user => {
            this.isLoggedIn = !!user;
            this.roles = user?.roles ?? [];
            this.showAdminBoard = this.roles.includes('ROLE_ADMIN');
            this.showModeratorBoard = this.roles.includes('ROLE_MODERATOR');
            this.showConsultantBoard = this.roles.includes('ROLE_CONSULTANT');
            this.username = user?.username;
        });

        this.menuService.sidebarOpen$.pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(open => {
            this.isSidebarOpen = open;
            if (!open) this.menu.forEach(item => item.expanded = false);
        });

        // Redirection initiale au chargement de la page (une seule fois)
        const user = this.storageService.getUser();
        if (user) {
            const roles: string[] = user.roles ?? [];
            if (roles.includes('ROLE_ADMIN') || roles.includes('ROLE_MODERATOR')) {
                this.router.navigate(['/manager']);
            } else {
                this.router.navigate(['/consultant']);
            }
        }
    }

    // ngAfterContentChecked() {
    //     this.visibleTools$ = this.storageService.visibleTools$;
    // }



    toggleNav() {
        this.isNavOpen = !this.isNavOpen;
    }

    closeNav() {
        this.isNavOpen = false;
    }

    toggleSidebar() {
        this.isSidebarOpen = !this.isSidebarOpen;
        this.isSidebarMini = false;
        this.menuService[this.isSidebarOpen ? 'openSidebar' : 'closeSidebar']();
    }

    toggleSidebarMini() {
        this.isSidebarMini = !this.isSidebarMini;
        this.isSidebarOpen = false;
    }

    toggleSubmenu(item: MenuItem) {
        if (!item.children.length) return;

        // Accordéon : fermer les autres
        this.menu.forEach(i => {
            if (i !== item) i.expanded = false;
        });

        // Ouvrir/fermer l’item cliqué
        item.expanded = !item.expanded;
    }


    logout(): void {
        this.authService.logout().subscribe({
            next: res => {
                console.log(res);
                this.storageService.clean();

                window.location.reload();

                // this.router.navigate(['/home']);
            },
            error: err => {
                console.log(err);
            }
        });
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event): void {
        const targetElement = event.target as HTMLElement;
        const sidebar = document.getElementById('sidebar-wrapper');
        const toolsLink = document.querySelector('.nav-link[routerLink="consultant"]');

        // Vérifier si le clic est en dehors de la sidebar et du lien Tools
        if (this.isSidebarOpen &&
            !sidebar?.contains(targetElement) &&
            !targetElement.closest('.nav-link')?.textContent?.includes('Tools') &&
            !targetElement.closest('.btn-open-tools')) {
            this.menuService.closeSidebar();
        }
    }

}
