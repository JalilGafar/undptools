import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsultantService } from '../../consultant.service';
import { StorageService } from '../../../_services/storage.service';
import { GeolocationService } from '../../../_services/geolocation.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-edit-company',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastModule, ConfirmDialog, Button],
  providers: [MessageService, ConfirmationService],
  templateUrl: './edit-company.component.html',
  styleUrl: './edit-company.component.scss'
})
export class EditCompanyComponent implements OnInit {

  companyForm!: FormGroup;
  companyId!: number;
  companyName = '';
  isLoading = true;
  isSaving = false;
  formSubmitted = false;

  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private geoService = inject(GeolocationService);
  isLocating = false;
  geoAvailable = this.geoService.isAvailable();

  constructor(
    private fb: FormBuilder,
    private consultantService: ConsultantService,
    private storageService: StorageService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.companyForm = this.fb.group({
      name:          [null, Validators.required],
      date_creation: [null],
      produits:      [''],
      services:      [''],
      description:   [''],
      gerant:        [''],
      descrt_gerant: [''],
      nbr_employer:  [null],
      nbr_femme:     [null],
      region:        [''],
      departement:   [''],
      ville:         [''],
      commune:       [''],
      quartier:      [''],
      lieu:          [''],
      x:             [null],
      y:             [null],
    });

    this.companyId = +this.route.snapshot.paramMap.get('id')!;

    this.consultantService.getCompanyDetailById(this.companyId).subscribe({
      next: company => {
        this.companyName = company.name;
        this.companyForm.patchValue(company);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les données de l\'entreprise.',
          life: 5000,
        });
      }
    });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.companyForm.get(field);
    return !!(ctrl?.invalid && (ctrl.touched || this.formSubmitted));
  }

  captureLocation(): void {
    this.confirmationService.confirm({
      header: 'Capturer votre position GPS',
      message: 'Nous allons accéder à votre position pour pré-remplir les coordonnées GPS. Vous pourrez les modifier manuellement ensuite.',
      icon: 'pi pi-map-marker',
      acceptLabel: 'Continuer',
      rejectLabel: 'Annuler',
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => this.doCapture(),
    });
  }

  private doCapture(): void {
    this.isLocating = true;
    this.geoService.getCurrentPosition().subscribe({
      next: pos => {
        this.isLocating = false;
        this.companyForm.patchValue({ x: pos.longitude, y: pos.latitude });
        const detail = pos.accuracy > 500
          ? `⚠️ Précision faible (~${Math.round(pos.accuracy)} m). Vérifiez manuellement.`
          : `Position capturée (~${Math.round(pos.accuracy)} m).`;
        this.messageService.add({ severity: pos.accuracy > 500 ? 'warn' : 'success', summary: 'GPS', detail, life: 5000 });
      },
      error: err => {
        this.isLocating = false;
        this.messageService.add({ severity: 'error', summary: 'Erreur GPS', detail: err.message, life: 6000 });
      }
    });
  }

  onSubmit(): void {
    this.formSubmitted = true;
    if (this.companyForm.invalid) return;

    this.isSaving = true;
    this.consultantService.updateCompany(this.companyId, this.companyForm.value).subscribe({
      next: () => {
        this.isSaving = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Enregistré',
          detail: 'Les informations ont été mises à jour avec succès.',
          life: 4000,
        });
        setTimeout(() => this.router.navigateByUrl(`/consultant/dashbord/${this.companyId}`), 2000);
      },
      error: () => {
        this.isSaving = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Une erreur est survenue. Veuillez réessayer.',
          life: 5000,
        });
      }
    });
  }
}
