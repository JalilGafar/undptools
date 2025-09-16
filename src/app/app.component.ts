import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { PrimengModule } from './shared/primeng.module';
import { HeaderComponent } from './shared/components/header/header.component';
import { ShareServiceService } from './shared/share-service.service';
import { filter, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ManHeaderComponent } from './shared/components/man-header/man-header.component';


@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
      RouterOutlet, 
      PrimengModule,
      HeaderComponent,
      CommonModule,
      ManHeaderComponent
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  menuVisible$!: Observable<boolean>;
  manMenuVisible$!: Observable<boolean>;
  loading$!: Observable<boolean>;
  
  constructor(private menuService: ShareServiceService, private router: Router) {
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

  }
  
  title = 'undptools';
}
