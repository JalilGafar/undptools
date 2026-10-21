import { AfterContentChecked, Component, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { PrimengModule } from './shared/primeng.module';
import { HeaderComponent } from './shared/components/header/header.component';
import { ShareServiceService } from './shared/share-service.service';
import { filter, lastValueFrom, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ManHeaderComponent } from './shared/components/man-header/man-header.component';
import { StorageService } from './_services/storage.service';
import { AuthService } from './_services/auth.service';
import { ConsultantRoutingModule } from "./consultant/consultant-routing.module";
import { MegaMenuItem } from 'primeng/api';
import { FooterComponent } from './shared/components/footer/footer.component';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { TOOL_GROUPS, ToolGroup } from './shared/tools.catalog';

interface MenuItem extends ToolGroup {
  expanded?: boolean;
}


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    PrimengModule,
    HeaderComponent,
    FooterComponent,
    CommonModule,
    // ManHeaderComponent,
    ConsultantRoutingModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, AfterContentChecked {

  menuVisible$!: Observable<boolean>;
  manMenuVisible$!: Observable<boolean>;
  visibleTools$!: Observable<boolean>;

  visible: boolean = false;
  items: MegaMenuItem[] | undefined;

  isSidebarOpen = false;
  isSidebarMini = false;

  private roles: string[] = [];
  isLoggedIn = false;
  showAdminBoard = false;
  showModeratorBoard = false;
  showConsultantBoard = false;
  username?: string;

  menu: MenuItem[] = TOOL_GROUPS.map(group => ({ ...group, expanded: false }));

  updateAvailable = false;

  constructor(
    private menuService: ShareServiceService,
    private router: Router,
    private storageService: StorageService,
    private authService: AuthService,
    private swUpdate: SwUpdate
  ) {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((event: any) => {
        // if (event.url.startsWith('/consultant/')) {
        //   this.menuService.showMenu();
        // } else if (event.url.startsWith('/manager')) {
        //   this.menuService.showManMenu();
        // }
        // else {
        //   this.menuService.hideManMenu();
        //   this.menuService.hideMenu();
        // }
      });
  }

  applyUpdate(): void {
    this.swUpdate.activateUpdate().then(() => window.location.reload());
  }

  ngOnInit(): void {

    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
        .subscribe(() => { this.updateAvailable = true; });
    }

    // this.storageService.setVisibleToolsFalse()

    this.menuVisible$ = this.menuService.menuVisible$;
    this.manMenuVisible$ = this.menuService.manMenuVisible$;

    this.isLoggedIn = this.storageService.isLoggedIn();
    if (this.isLoggedIn) {
      const user = this.storageService.getUser();
      this.roles = user.roles;

      this.showAdminBoard = this.roles.includes('ROLE_ADMIN');
      this.showModeratorBoard = this.roles.includes('ROLE_MODERATOR');
      this.showConsultantBoard = this.roles.includes('ROLE_CONSULTANT');

      this.username = user.username;

      if (this.showAdminBoard || this.showModeratorBoard) {
        this.router.navigate(['/manager']);
      } else {
        this.router.navigate(['/consultant']);
      }


    }

  }

  ngAfterContentChecked() {
    this.visibleTools$ = this.storageService.visibleTools$;

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

  // async logout(): Promise<void> {
  //   try {
  //     // await this.authService.logout().toPromise();
  //     await lastValueFrom(this.authService.logout())
  //     this.storageService.clean();
  //     document.cookie = 'bezkoder-session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  //     // window.location.reload();
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }

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

  title = 'undptools';
}
