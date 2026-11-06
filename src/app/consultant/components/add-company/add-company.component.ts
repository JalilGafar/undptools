import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConsultantService } from '../../consultant.service';
import { StorageService } from '../../../_services/storage.service';
import { Router } from '@angular/router';
import { WaveService } from '../../../shared/wave.service';

@Component({
  selector: 'app-add-company',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './add-company.component.html',
  styleUrl: './add-company.component.scss'
})
export class AddCompanyComponent implements OnInit {

  companyForm!: FormGroup;
  idUser!: number;
  isSaving = false;
  error = '';

 



  constructor(
    private formBuilder: FormBuilder,
    private storageService: StorageService,
    private consultantService: ConsultantService,
    private appRout: Router,
    readonly wave: WaveService
  ) { }

  ngOnInit(): void {
    this.companyForm = this.formBuilder.group({
      name: [null, [Validators.required]],
      date_creation: [''],
      produits: [''],
      services: [''],
      description: [''],
      gerant: [''],
      descrt_gerant: [''],
      nbr_employer: [''],
      nbr_femme: [''],
      region: [''],
      departement: [''],
      ville: [''],
      commune: [''],
      quartier: [''],
      lieu: [''],
      x: [''],
      y: [''],
      idUser: [null],
      id_vague: [null]

    });

    this.idUser = this.storageService.getUser().id;

    // La vague proposée est la vague en cours ; la liste est relue pour tenir compte d'une vague créée entre-temps
    this.chooseDefaultWave();
    void this.wave.refresh(true).then(() => this.chooseDefaultWave());


  }



  onSubmitForm() {
    if (this.companyForm.invalid) {
      return;
    }

    this.companyForm.patchValue({
      idUser: this.storageService.getUser().id
    });

    this.isSaving = true;
    this.error = '';
    this.consultantService.addCompany(this.companyForm.value).subscribe({
      next: () => this.appRout.navigateByUrl('consultant/companies'),
      error: err => { this.isSaving = false; this.error = err.error?.message ?? "L'enregistrement a échoué. Veuillez réessayer."; }
    });
    // this.adminService.addNewFormation(this.newFormation.value).pipe(take(1)).subscribe();
    // window.location.reload();

  }

  /** Vague en cours, ou à défaut la première vague ouverte ; ne touche pas à un choix déjà fait */
  private chooseDefaultWave(): void {
    if (this.companyForm.value.id_vague) return;
    const open = this.wave.openWaves();
    const current = open.find(w => w.statut === 'en_cours') ?? open[0];
    if (current) this.companyForm.patchValue({ id_vague: current.id });
  }

  onGoBack() {
    history.back();
  }

}
