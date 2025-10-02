import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConsultantService } from '../../consultant.service';
import { StorageService } from '../../../_services/storage.service';
import { Router } from '@angular/router';

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


  constructor(
    private formBuilder: FormBuilder,
    private storageService: StorageService ,
    private consultantService: ConsultantService,
    private appRout : Router
  ){}

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
      idUser: [null]

    });

    this.idUser = this.storageService.getUser().id;
  
  }

  onSubmitForm(){
        if (this.companyForm.invalid) {
      return;
    }

    this.companyForm.patchValue({
      idUser: this.storageService.getUser().id
    });

    this.consultantService.addCompany(this.companyForm.value).subscribe()
    this.appRout.navigateByUrl('consultant/companies');
    // this.adminService.addNewFormation(this.newFormation.value).pipe(take(1)).subscribe();
    // window.location.reload();

  }

  onGoBack(){

  }

}
