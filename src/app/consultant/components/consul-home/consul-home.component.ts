import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-consul-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './consul-home.component.html',
  styleUrl: './consul-home.component.scss'
})
export class ConsulHomeComponent {

  showAlert: boolean = false;
  alertType: string = 'info';
  alertMessage: string = '';
  dismissible: boolean = true;

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
