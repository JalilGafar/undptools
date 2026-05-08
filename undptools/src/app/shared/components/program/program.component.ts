import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-program',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './program.component.html',
  styleUrl: './program.component.scss'
})
export class ProgramComponent  implements OnInit{

  showAlert: boolean = false;
  alertType: string = 'info'; // e.g., 'success', 'danger', 'warning'
  alertMessage: string = '';
  dismissible: boolean = true;

  ngOnInit(): void {
    // this.showAlertMessage();
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
