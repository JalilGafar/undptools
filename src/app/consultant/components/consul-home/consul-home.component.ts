import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../_services/user.service';
import { StorageService } from '../../../_services/storage.service';

@Component({
  selector: 'app-consul-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './consul-home.component.html',
  styleUrl: './consul-home.component.scss'
})
export class ConsulHomeComponent implements OnInit {

  showAlert: boolean = false;
  alertType: string = 'info'; // e.g., 'success', 'danger', 'warning'
  alertMessage: string = '';
  dismissible: boolean = true;

  content?: string;

  constructor(
    private userService: UserService,
    private storageService: StorageService,
  ) { }

  ngOnInit(): void {

    this.storageService.setVisibleToolsFalse();
    // this.showAlertMessage();
    this.userService.getUserBoard().subscribe({
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

  showAlertMessage(): void {
    this.alertMessage = 'Ce profil de ne vous donne pas accès aux outils de ce programme';
    this.alertType = 'danger';
    this.showAlert = true;
    this.dismissible = true;
  }

  hideAlert(): void {
    this.showAlert = false;
  }

  setAlert() {

  }
}
