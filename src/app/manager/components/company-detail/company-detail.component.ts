import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { tap } from 'rxjs';
import { ManagerService } from '../../manager.service';
import { Company } from '../../../core/model/company';
import { StorageService } from '../../../_services/storage.service';

@Component({
  selector: 'app-company-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './company-detail.component.html',
  styleUrl: './company-detail.component.scss'
})
export class CompanyDetailComponent implements OnInit {

  company!: Company;
  editMode = false;
  saving = false;
  deleting = false;
  alertMessage = '';
  alertType: 'success' | 'danger' | '' = '';
  isAdmin = false;

  form!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private managerService: ManagerService,
    private fb: FormBuilder,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    const roles: string[] = this.storageService.getUser()?.roles ?? [];
    this.isAdmin = roles.includes('ROLE_ADMIN');

    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.managerService.clearSelectedCompany();
    this.managerService.getCompanyDetailById(id);

    this.managerService.selectedCompany$.pipe(
      tap(company => {
        if (company) {
          this.company = company;
          this.buildForm(company);
        }
      })
    ).subscribe();
  }

  private buildForm(c: Company): void {
    this.form = this.fb.group({
      name:          [c.name,          Validators.required],
      gerant:        [c.gerant],
      descrt_gerant: [c.descrt_gerant],
      date_creation: [c.date_creation],
      description:   [c.description],
      produits:      [c.produits],
      services:      [c.services],
      region:        [c.region],
      departement:   [c.departement],
      ville:         [c.ville],
      commune:       [c.commune],
      quartier:      [c.quartier],
      lieu:          [c.lieu],
      nbr_employer:  [c.nbr_employer],
      nbr_femme:     [c.nbr_femme],
      x:             [c.x],
      y:             [c.y],
    });
  }

  toggleEdit(): void {
    this.editMode = !this.editMode;
    if (!this.editMode) {
      this.buildForm(this.company);
    }
    this.alertMessage = '';
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    this.managerService.updateCompany(this.company.id, this.form.value).subscribe({
      next: () => {
        this.company = { ...this.company, ...this.form.value };
        this.editMode = false;
        this.saving = false;
        this.showAlert('Entreprise mise à jour avec succès.', 'success');
      },
      error: () => {
        this.saving = false;
        this.showAlert('Erreur lors de la mise à jour.', 'danger');
      }
    });
  }

  confirmDelete(): void {
    this.deleting = true;
    this.managerService.deleteCompany(this.company.id).subscribe({
      next: () => {
        this.router.navigate(['../../'], { relativeTo: this.route });
      },
      error: () => {
        this.deleting = false;
        this.showAlert('Erreur lors de la suppression.', 'danger');
      }
    });
  }

  private showAlert(message: string, type: 'success' | 'danger'): void {
    this.alertMessage = message;
    this.alertType = type;
  }

  goBack(): void {
    history.back();
  }
}
