import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { PrimengModule } from './shared/primeng.module';
import { HeaderComponent } from './shared/components/header/header.component';
import { ShareServiceService } from './shared/share-service.service';
import { filter, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ManHeaderComponent } from './shared/components/man-header/man-header.component';
import { StorageService } from './_services/storage.service';
import { AuthService } from './_services/auth.service';
import { ConsultantRoutingModule } from "./consultant/consultant-routing.module";


@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
    RouterOutlet,
    PrimengModule,
    HeaderComponent,
    CommonModule,
    ManHeaderComponent,
    ConsultantRoutingModule
],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  menuVisible$!: Observable<boolean>;
  manMenuVisible$!: Observable<boolean>;
  loading$!: Observable<boolean>;

  private roles: string[] = [];
  isLoggedIn = false;
  showAdminBoard = false;
  showModeratorBoard = false;
  showUserBoard = false;
  username?: string;
  
  constructor(
    private menuService: ShareServiceService, 
    private router: Router,
    private storageService: StorageService, 
    private authService: AuthService
  ) {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.url.startsWith('/consultant/')) {
          this.menuService.showMenu();
        } else if(event.url.startsWith('/manager')){
          this.menuService.showManMenu();
        }
         else {
          this.menuService.hideManMenu();
          this.menuService.hideMenu();
        }
      });
  }

  ngOnInit(): void {
    
    this.menuVisible$ = this.menuService.menuVisible$;
    this.manMenuVisible$ = this.menuService.manMenuVisible$;

    this.isLoggedIn = this.storageService.isLoggedIn();
    if (this.isLoggedIn) {
      const user = this.storageService.getUser();
      this.roles = user.roles;

      this.showAdminBoard = this.roles.includes('ROLE_ADMIN');
      this.showModeratorBoard = this.roles.includes('ROLE_MODERATOR');
      this.showUserBoard = this.roles.includes('ROLE_USER');

      this.username = user.username;

      if (this.showAdminBoard) {
        this.router.navigate(['/manager']);
      } else {
        this.router.navigate(['/consultant']);
      }


    }

  }

    logout(): void {
    this.authService.logout().subscribe({
      next: res => {
        console.log(res);
        this.storageService.clean();

        window.location.reload();

        this.router.navigate(['']);
      },
      error: err => {
        console.log(err);
      }
    });
  }
  
  title = 'undptools';
}
