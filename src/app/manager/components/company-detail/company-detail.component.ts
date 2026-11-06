import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoadState } from '../../../core/load-state';
import { ManagerService } from '../../manager.service';
import { Company } from '../../../core/model/company';
import { StorageService } from '../../../_services/storage.service';
import { CompanyGalleryComponent } from '../../../shared/components/company-gallery/company-gallery.component';
import { ProfilSummaryComponent } from '../profil-summary/profil-summary.component';

@Component({
  selector: 'app-company-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CompanyGalleryComponent, ProfilSummaryComponent],
  templateUrl: './company-detail.component.html',
  styleUrl: './company-detail.component.scss'
})
export class CompanyDetailComponent implements OnInit {
  companyState$!: Observable<LoadState>;

  company!: Company;
  tab: 'infos' | 'profil' | 'photos' = 'infos';
  editMode = false;
  saving = false;
  deleting = false;
  alertMessage = '';
  alertType: 'success' | 'danger' | '' = '';
  isAdmin = false;
  /** Consultants proposés pour la prise en charge (chargés à l'ouverture du formulaire, administrateur seul) */
  consultants: { id: number; name: string; label: string }[] = [];

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
    this.companyState$ = this.managerService.selectedCompanyState$;

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
      id_consl:      [c.idUser],
      secteur:       [c.secteur],
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
    } else {
      this.loadConsultants();
    }
    this.alertMessage = '';
  }

  /**
   * Liste des consultants pour le choix du consultant en charge. Le consultant actuel reste proposé même s'il n'a plus le rôle
   * consultant (compte rétrogradé) : sans cela la liste afficherait un choix vide.
   */
  private loadConsultants(): void {
    this.managerService.fetchManagedUsers().subscribe({
      next: users => {
        const list = users.filter(u => u.role === 'consultant')
          .map(u => ({ id: u.id, name: u.username, label: `${u.username} · ${u.nb_entreprises} entreprise${u.nb_entreprises > 1 ? 's' : ''}` }));
        if (this.company.idUser && !list.some(c => c.id === this.company.idUser)) {
          const name = this.company.consultant ?? 'Consultant actuel';
          list.unshift({ id: this.company.idUser, name, label: `${name} (n'est plus consultant)` });
        }
        this.consultants = list;
      },
      error: () => this.showAlert('Impossible de charger la liste des consultants.', 'danger')
    });
  }

  /** Nom du consultant choisi dans le formulaire */
  consultantName(id: number | null | undefined): string {
    return this.consultants.find(c => c.id === id)?.name ?? '';
  }

  /** Vrai quand le formulaire désigne un autre consultant que celui en charge : les livrables seront transférés à l'enregistrement */
  get consultantChanged(): boolean {
    const wanted = this.form?.value.id_consl;
    return !!wanted && wanted !== this.company.idUser;
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    this.managerService.updateCompany(this.company.id, this.form.value).subscribe({
      next: (res: { consultant: { id: number; username: string } | null }) => {
        this.company = { ...this.company, ...this.form.value };
        if (res?.consultant) {
          this.company.idUser = res.consultant.id;
          this.company.id_consl = res.consultant.id;
          this.company.consultant = res.consultant.username;
        }
        this.editMode = false;
        this.saving = false;
        this.showAlert(res?.consultant
          ? `Entreprise mise à jour. ${res.consultant.username} est maintenant en charge ; les livrables déjà saisis ont suivi l'entreprise.`
          : 'Entreprise mise à jour avec succès.', 'success');
      },
      error: err => {
        this.saving = false;
        this.showAlert(err.error?.message ?? 'Erreur lors de la mise à jour.', 'danger');
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
