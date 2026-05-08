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

interface MenuItem {
    label: string;
    icon: string;
    children: { label: string; route: string }[];
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
    showUserBoard = false;
    username?: string;

    menu: MenuItem[] = [
        {
            label: 'Pré-diagnostic',
            icon: 'bi-0-circle-fill',
            children: [
                // {
                //   label: ' Le recensement "In Motion"',
                //   route: 'inmotion'
                // },
                // {
                //   label: 'outil d\'évaluation intégrale',
                //   route: 'evaluation'
                // },
                {
                    label: 'matrice de critères et d\'attributs',
                    route: 'attribut'
                },


            ]
        },
        {
            label: 'L\'offre et la demande',
            icon: 'bi-1-circle-fill',
            children: [
                {
                    label: '1A Rapport Final - Étape 1',
                    route: 't1a'
                },

                {
                    label: '1B Minutes de réunion',
                    route: 't1b'
                },

                {
                    label: '1C Suivi des activités',
                    route: 't1c'
                },

                {
                    label: '1D Diagnostic intégral',
                    route: 't1d'
                },

                {
                    label: '1E_a Diagnostic BPF',
                    route: 't1ea'
                },

                {
                    label: '1E_b Diagnostic BPA',
                    route: 't1eb'
                },

                {
                    label: '1F Rapport sur la capacité de production',
                    route: 't1f'
                },

                {
                    label: '1G Cartographie des clients',
                    route: 't1g'
                },

                {
                    label: '1H Photos de l\'entreprise',
                    route: 't1h'
                },

                {
                    label: '1i Ligne de base - Capture initiale',
                    route: 't1i'
                },

                {
                    label: '1L Profil d\'informations',
                    route: 't1l'
                }

            ]
        },
        {
            label: 'Modèle d\'Affaires',
            icon: 'bi-2-circle-fill',
            children: [
                {
                    label: '2A Rapport Final',
                    route: 't2a'
                },

                {
                    label: '2B Minutes de réunion',
                    route: 't1b'
                },

                {
                    label: '2C Suivi des activités',
                    route: 't2c'
                },

                {
                    label: '2D Business modèle CANVAS impact',
                    route: 't2d'
                },

                {
                    label: '2E Matrice du Plan d\'Amélioration',
                    route: 't2e'
                },

                {
                    label: '2F Désignation du Responsable GYB',
                    route: 't2f'
                },

                {
                    label: '2G Demande de Matériel',
                    route: 't2g'
                }

            ]
        },
        {
            label: 'Renforcement des capacités',
            icon: 'bi-3-circle-fill',
            children: [
                {
                    label: '3A Rapport Final',
                    route: 'onbuild'
                },

                {
                    label: '3B Minutes de réunion',
                    route: 'onbuild'
                },

                {
                    label: '3C Suivi des activités',
                    route: 'onbuild'
                },

                {
                    label: '3D Rapport de Formation',
                    route: 'onbuild'
                },

                {
                    label: '3E Cartographie des institutions de soutien',
                    route: 'onbuild'
                },

                {
                    label: '3G SyECFo_Evaluation des fournisseurs',
                    route: 'onbuild'
                },

                {
                    label: '3H Analyse financière basique',
                    route: 'onbuild'
                },


            ]
        },
        {
            label: 'Renforcement de l\'Entreprise',
            icon: 'bi-4-circle-fill',
            children: [
                {
                    label: '4A Rapport Final',
                    route: 'onbuild'
                },

                {
                    label: '4B Minutes de réunion',
                    route: 'onbuild'
                },

                {
                    label: '4C Suivi des activités',
                    route: 'onbuild'
                },

                {
                    label: '4D Rapport de Formation',
                    route: 'onbuild'
                },

                {
                    label: '4E Intérêt d\'achat-vente des participants-clients',
                    route: 'onbuild'
                },

                {
                    label: '4F Plan de travail détaillé (GANTT)',
                    route: 'onbuild'
                },

                {
                    label: '4G Fiche projet',
                    route: 'onbuild'
                },


            ]
        },
        {
            label: 'Promotion des relations commerciales',
            icon: 'bi-5-circle-fill',
            children: [
                {
                    label: '5A Rapport Final',
                    route: 'onbuild'
                },

                {
                    label: '5B Minutes de réunion',
                    route: 'onbuild'
                },

                {
                    label: '5C Suivi des activités',
                    route: 'onbuild'
                },

                {
                    label: '5D Intérêt d\'achat-vente des participants-clients',
                    route: 'onbuild'
                },

                {
                    label: '5E Ligne de base - Capture finale',
                    route: 'onbuild'
                },

                {
                    label: '5F Formulaire de livraison de matériel',
                    route: 'onbuild'
                },

                {
                    label: '5G Photos de l\'entreprise',
                    route: 'onbuild'
                },

                {
                    label: '5H Évaluation du programme',
                    route: 'onbuild'
                },


            ]
        }
    ];

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
            this.showUserBoard = this.roles.includes('ROLE_USER');
            this.username = user?.username;
        });

        // Redirection initiale au chargement de la page (une seule fois)
        const user = this.storageService.getUser();
        if (user) {
            const roles: string[] = user.roles ?? [];
            if (roles.includes('ROLE_ADMIN')) {
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
            !targetElement.closest('.nav-link')?.textContent?.includes('Tools')) {
            this.isSidebarOpen = false;

            // Fermer tous les sous-menus
            this.menu.forEach(item => {
                item.expanded = false;
            });
        }
    }

}
