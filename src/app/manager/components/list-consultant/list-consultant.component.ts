import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '../../../core/model/user';
import { UserService } from '../../../_services/user.service';
import { ManagerService } from '../../manager.service';

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

  user$!: Observable<User[]>

  constructor(
      private userService: UserService,
      private managerService: ManagerService,
      private router: Router
    ) { }

  ngOnInit(): void {
    this.managerService.getUserFromServer();

    this.user$ = this.managerService.persona$;
  }

  consultantSelect(id: number) {
    this.router.navigateByUrl('/manager/listcompany/' + id);
  }
 
  consultantLivrable(id: number) {
    this.router.navigateByUrl('/manager/listcompany/' + id);
  }

}
