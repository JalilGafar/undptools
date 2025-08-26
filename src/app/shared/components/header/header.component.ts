import { Component, OnInit } from '@angular/core';
import { PrimengModule } from '../../primeng.module';
import { MegaMenuItem } from 'primeng/api';
import { ConsultantRoutingModule } from "../../../consultant/consultant-routing.module";
import { animate, state, style, transition, trigger } from '@angular/animations';

interface MenuItem {
    label: string;
    icon: string;
    children: string[];
    expanded?: boolean;
}


@Component({
    selector: 'app-header',
    standalone: true,
    imports: [
        PrimengModule,
        ConsultantRoutingModule
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
            label: 'Dashboard',
            icon: 'fa-dashboard',
            children: ['link1', 'link2']
        },
        {
            label: 'Shortcut',
            icon: 'fa-flag',
            children: ['link1', 'link2']
        },
        { label: 'Overview', icon: 'fa-cloud-download', children: [], expanded: false },
        { label: 'Events', icon: 'fa-cart-plus', children: [], expanded: false },
        { label: 'About', icon: 'fa-youtube-play', children: [], expanded: false },
        { label: 'Services', icon: 'fa-wrench', children: [], expanded: false },
        { label: 'Contact', icon: 'fa-server', children: [], expanded: false }
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
