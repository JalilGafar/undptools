import { Component, OnInit } from '@angular/core';
import { PrimengModule } from '../../primeng.module';
import { MegaMenuItem } from 'primeng/api';
import { ConsultantRoutingModule } from "../../../consultant/consultant-routing.module";
import { animate, state, style, transition, trigger } from '@angular/animations';
import { OnconstructionComponent } from '../onconstruction/onconstruction.component';

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
        OnconstructionComponent
    ],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {

    visible: boolean = false;
    items: MegaMenuItem[] | undefined;

    isSidebarOpen = false;
    isSidebarMini = false;

    menu: MenuItem[] = [
        {
            label: 'Pré-diagnostic',
            icon: 'bi-0-circle-fill',
            children: [
                {
                    label: ' Le recensement "In Motion"',
                    route: 'inmotion'
                },
                {
                    label: 'outil d\'évaluation intégrale',
                    route: 'evaluation'
                },
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
                    route: 't2b'
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
                    route: 't3a'
                },

                {
                    label: '3B Minutes de réunion',
                    route: 't3b'
                },

                {
                    label: '3C Suivi des activités',
                    route: 't3c'
                },

                {
                    label: '3D Rapport de Formation',
                    route: 't3d'
                },

                {
                    label: '3E Cartographie des institutions de soutien',
                    route: 't3e'
                },

                {
                    label: '3G SyECFo_Evaluation des fournisseurs',
                    route: 't3g'
                },

                {
                    label: '3H Analyse financière basique',
                    route: 't3h'
                },


            ]
        },
        {
            label: 'Renforcement de l\'Entreprise',
            icon: 'bi-4-circle-fill',
            children: [
                {
                    label: '4A Rapport Final',
                    route: 't4a'
                },

                {
                    label: '4B Minutes de réunion',
                    route: 't4b'
                },

                {
                    label: '4C Suivi des activités',
                    route: 't4c'
                },

                {
                    label: '4D Rapport de Formation',
                    route: 't4d'
                },

                {
                    label: '4E Intérêt d\'achat-vente des participants-clients',
                    route: 't4e'
                },

                {
                    label: '4F Plan de travail détaillé (GANTT)',
                    route: 't4f'
                },

                {
                    label: '4G Fiche projet',
                    route: 't4g'
                },


            ]
        },
        {
            label: 'Promotion des relations commerciales',
            icon: 'bi-5-circle-fill',
            children: [
                {
                    label: '5A Rapport Final',
                    route: 't5a'
                },

                {
                    label: '5B Minutes de réunion',
                    route: 't5b'
                },

                {
                    label: '5C Suivi des activités',
                    route: 't5c'
                },

                {
                    label: '5D Intérêt d\'achat-vente des participants-clients',
                    route: 't5d'
                },

                {
                    label: '5E Ligne de base - Capture finale',
                    route: 't5e'
                },

                {
                    label: '5F Formulaire de livraison de matériel',
                    route: 't5f'
                },

                {
                    label: '5G Photos de l\'entreprise',
                    route: 't5g'
                },

                {
                    label: '5H Évaluation du programme',
                    route: 't5h'
                },


            ]
        }
    ];

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

    ngOnInit(): void {

    }

}
