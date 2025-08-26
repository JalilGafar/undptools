import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { PrimengModule } from './shared/primeng.module';
import { HeaderComponent } from './shared/components/header/header.component';
import { ShareServiceService } from './shared/share-service.service';
import { filter, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';


@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
      RouterOutlet, 
      PrimengModule,
      HeaderComponent,
      CommonModule
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  menuVisible$!: Observable<boolean>;
  loading$!: Observable<boolean>;
  
  constructor(private menuService: ShareServiceService, private router: Router) {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.url.startsWith('/consultant/')) {
          this.menuService.showMenu();
        } else {
          this.menuService.hideMenu();
        }
      });
  }

  ngOnInit(): void {

    this.loading$ = this.menuService.loading$;
    
    this.menuVisible$ = this.menuService.menuVisible$;

  }
  
  title = 'undptools';
}
