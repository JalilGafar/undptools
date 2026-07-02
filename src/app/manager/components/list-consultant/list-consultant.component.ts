import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '../../../core/model/user';
import { UserService } from '../../../_services/user.service';
import { ManagerService } from '../../manager.service';
import { StorageService } from '../../../_services/storage.service';

@Component({
  selector: 'app-list-consultant',
  standalone: true,
  imports: [
        CommonModule,
        RouterLink
  ],
  templateUrl: './list-consultant.component.html',
  styleUrl: './list-consultant.component.scss'
})
export class ListConsultantComponent implements OnInit {

  user$!: Observable<User[]>;
  isAdmin = false;

  constructor(
      private userService: UserService,
      private managerService: ManagerService,
      private router: Router,
      private storageService: StorageService
    ) { }

  ngOnInit(): void {
    const roles: string[] = this.storageService.getUser()?.roles ?? [];
    this.isAdmin = roles.includes('ROLE_ADMIN');

    this.managerService.getUserFromServer();
    this.user$ = this.managerService.persona$;
  }

  consultantSelect(id: number) {
    this.router.navigateByUrl('/manager/listcompany/' + id);
  }
 
  consultantLivrable(id: number) {
    this.router.navigateByUrl('/manager/listLivrable/' + id+'?sujet=user');
  }

}
