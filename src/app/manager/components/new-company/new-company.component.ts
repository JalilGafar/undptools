import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StorageService } from '../../../_services/storage.service';
import { ConsultantService } from '../../../consultant/consultant.service';
import { SelectModule } from 'primeng/select';
import { map, Observable } from 'rxjs';
import { User } from '../../../core/model/user';
import { ManagerService } from '../../manager.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';

@Component({
  selector: 'app-new-company',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SelectModule,
    Select,
    Message,
    ConfirmDialog,
    ToastModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './new-company.component.html',
  styleUrl: './new-company.component.scss'
})
export class NewCompanyComponent implements OnInit {

  companyForm!: FormGroup;
  idUser!: number;
  user$!: Observable<User[]>

  formSubmitted = false;
  messageService = inject(MessageService);

  constructor(
    private formBuilder: FormBuilder,
    private storageService: StorageService,
    private managerService: ManagerService,
    private confirmationService: ConfirmationService,
    private appRout: Router
  ) { }

  ngOnInit(): void {
    this.companyForm = this.formBuilder.group({
      name: [null, [Validators.required]],
      date_creation: [null],
      produits: [''],
      services: [''],
      description: [''],
      gerant: [''],
      descrt_gerant: [''],
      nbr_employer: [null],
      nbr_femme: [null],
      region: [''],
      departement: [''],
      ville: [''],
      commune: [''],
      quartier: [''],
      lieu: [''],
      x: [null],
      y: [null],
      idUser: [null, Validators.required]

    });

    // this.idUser = this.storageService.getUser().id;

    this.managerService.getUserFromServer();

    this.user$ = this.managerService.persona$.pipe(
      map(users => users.filter(user => user.name == 'user'))
    );
    

  }

  confirm1(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure that you want to proceed?',
      header: 'Confirmation',
      closable: true,
      closeOnEscape: true,
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Save',
      },
      accept: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Form is submitted', life: 5000 });
        this.managerService.addCompany(this.companyForm.value).subscribe();
        setTimeout(() => {
            this.appRout.navigateByUrl('manager/listcompany/999999');
        }, 3000);
      },
      reject: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Rejected',
          detail: 'You have rejected',
          life: 3000,
        });
      },
    });
    
  }



  onSubmitForm() {
    this.formSubmitted = true;
    if (this.companyForm.valid) {
      // this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Form is submitted', life: 3000 });
      // // this.companyForm.reset();
      // this.formSubmitted = false;
    }

    // this.companyForm.patchValue({
    //   idUser: this.storageService.getUser().id
    // });

    // console.log(this.companyForm.value)

    // this.managerService.addCompany(this.companyForm.value).subscribe()
    // this.appRout.navigateByUrl('consultant/companies');
    // this.adminService.addNewFormation(this.newFormation.value).pipe(take(1)).subscribe();
    // window.location.reload();

  }

  isInvalid(controlName: string) {
    const control = this.companyForm.get(controlName);
    return control?.invalid && (control.touched || this.formSubmitted);
  }

  onGoBack() {

  }

}
