import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../_services/user.service';
import { ManagerService } from '../../manager.service';
import { Observable } from 'rxjs';
import { User } from '../../../core/model/user';

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
  user$!: Observable<User[]>

  constructor(
    private userService: UserService,
    private managerService: ManagerService
  ) { }

  ngOnInit(): void {
    this.userService.getAdminBoard().subscribe({
      next: data => {
        this.content = data;
      },
      error: err => {
        if (err.error) {
          try {
            const res = JSON.parse(err.error);
            this.content = res.message;
          } catch {
            this.content = `Error with status: ${err.status} - ${err.statusText}`;
          }
        } else {
          this.content = `Error with status: ${err.status}`;
        }
      }
    });

    this.managerService.getUserFromServer();

    this.user$ = this.managerService.persona$;
  }
}
