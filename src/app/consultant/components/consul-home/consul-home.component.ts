import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
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
  alertType: string = 'info';
  alertMessage: string = '';
  dismissible: boolean = true;

  constructor(private storageService: StorageService) { }

  ngOnInit(): void {
    this.storageService.setVisibleToolsFalse();
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
