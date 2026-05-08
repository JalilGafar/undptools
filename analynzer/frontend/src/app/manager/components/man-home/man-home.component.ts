import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../_services/user.service';

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
export class ManHomeComponent implements OnInit{

    content?: string;

  constructor(private userService: UserService) { }

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
  }
}
