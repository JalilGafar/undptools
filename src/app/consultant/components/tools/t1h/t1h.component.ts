import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StorageService } from '../../../../_services/storage.service';
import { CompanyGalleryComponent } from '../../../../shared/components/company-gallery/company-gallery.component';

@Component({
  selector: 'app-t1h',
  standalone: true,
  imports: [RouterLink, CompanyGalleryComponent],
  templateUrl: './t1h.component.html',
  styleUrl: './t1h.component.scss'
})
export class T1hComponent implements OnInit {

  companyId = 0;

  constructor(private storageService: StorageService) { }

  ngOnInit(): void {
    // CompanyId est perdu à l'actualisation de la page : on invite alors à resélectionner l'entreprise
    this.companyId = this.storageService.CompanyId ?? 0;
  }

  goBack(): void {
    history.back();
  }
}
