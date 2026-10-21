import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { of, switchMap } from 'rxjs';
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
import { CompanyLogoPipe, DEFAULT_COMPANY_LOGO } from '../../../core/company-logo.pipe';

@Component({
  selector: 'app-edit-company',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastModule, ConfirmDialog, Button, CompanyLogoPipe],
  providers: [MessageService, ConfirmationService],
  templateUrl: './edit-company.component.html',
  styleUrl: './edit-company.component.scss'
})
export class EditCompanyComponent implements OnInit, OnDestroy {

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

  // ── Logo ────────────────────────────────────────────────────────────────────
  private readonly LOGO_MAX_BYTES = 10 * 1024 * 1024;
  private readonly LOGO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  currentLogo: string | null = null;
  logoPreview: string | null = null;
  private logoFile: File | null = null;
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
      secteur:       [''],
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
        this.currentLogo = company.logo ?? null;
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

  ngOnDestroy(): void {
    this.cancelLogo();
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (!this.LOGO_TYPES.includes(file.type)) {
      this.messageService.add({ severity: 'error', summary: 'Logo', detail: 'Format non supporté (JPG, PNG ou WEBP).', life: 5000 });
      return;
    }
    if (file.size > this.LOGO_MAX_BYTES) {
      this.messageService.add({ severity: 'error', summary: 'Logo', detail: 'Image trop volumineuse (10 Mo maximum).', life: 5000 });
      return;
    }
    this.cancelLogo();
    this.logoFile = file;
    this.logoPreview = URL.createObjectURL(file);
  }

  cancelLogo(): void {
    if (this.logoPreview) URL.revokeObjectURL(this.logoPreview);
    this.logoPreview = null;
    this.logoFile = null;
  }

  onLogoError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.onerror = null;
    img.src = DEFAULT_COMPANY_LOGO;
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
    this.consultantService.updateCompany(this.companyId, this.companyForm.value).pipe(
      switchMap(() => this.logoFile
        ? this.consultantService.uploadCompanyLogo(this.companyId, this.logoFile)
        : of(null))
    ).subscribe({
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
