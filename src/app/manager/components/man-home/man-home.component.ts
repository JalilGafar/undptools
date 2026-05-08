import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router, RouterLink } from '@angular/router';
import { UserService } from '../../../_services/user.service';
import { ManagerService } from '../../manager.service';
import { Observable } from 'rxjs';
import { User } from '../../../core/model/user';
import { StorageService } from '../../../_services/storage.service';

@Component({
  selector: 'app-man-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './man-home.component.html',
  styleUrl: './man-home.component.scss'
})
export class ManHomeComponent implements OnInit {

  content?: string;
  user$!: Observable<User[]>;
  visibleTools$!: Observable<boolean>;
  currentUser$!: Observable<User | null>;


  // private router = inject(Router);

  constructor(
    private userService: UserService,
    private managerService: ManagerService, 
    private storageService: StorageService,
    private router: Router   
  ) { 
    this.currentUser$ = this.storageService.currentUser$;  // Initialize here
  }

  ngOnInit(): void {
    // this.userService.getAdminBoard().subscribe({
    //   next: data => {
    //     this.content = data;
    //   },
    //   error: err => {
    //     if (err.error) {
    //       try {
    //         const res = JSON.parse(err.error);
    //         this.content = res.message;
    //       } catch {
    //         this.content = `Error with status: ${err.status} - ${err.statusText}`;
    //       }
    //     } else {
    //       this.content = `Error with status: ${err.status}`;
    //     }
    //   }
    // });

    this.managerService.getUserFromServer();

    this.user$ = this.managerService.persona$;

    this.visibleTools$ = this.storageService.visibleTools$;
  }

  seeConsultants(){
    this.router.navigateByUrl('manager/listconsult');
  }
  seeCompanies(){
    this.router.navigateByUrl('manager/listcompany/'+999999);
  }
  seeGlobal(){
    this.router.navigateByUrl('manager/global');
  }

  seeTools(){
    this.router.navigateByUrl('/manager/Tooltest');
  }
}
