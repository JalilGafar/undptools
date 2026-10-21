import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ManagerService } from '../../manager.service';
import { StorageService } from '../../../_services/storage.service';
import { Company } from '../../../core/model/company';
import { LivrableGlobal } from '../../../core/model/livrable-global';

@Component({
  selector: 'app-company-livrables',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './company-livrables.component.html',
  styleUrl: './company-livrables.component.scss',
})
export class CompanyLivrablesComponent implements OnInit, OnDestroy {

  companyId!: number;
  company$!: Observable<Company | null>;
  livrables: LivrableGlobal[] = [];
  isLoading = true;
  loadError = false;

  constructor(
    private managerService: ManagerService,
    private storageService: StorageService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.companyId = Number(this.route.snapshot.paramMap.get('id'));

    this.managerService.clearSelectedCompany();
    this.managerService.getCompanyDetailById(this.companyId);
    this.company$ = this.managerService.selectedCompany$;

    this.managerService.fetchCompanyLivrables(this.companyId).subscribe({
      next: livrables => {
        this.livrables = livrables;
        this.isLoading = false;
      },
      error: () => {
        this.loadError = true;
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.managerService.clearSelectedCompany();
  }

  trackLivrable(item: LivrableGlobal): string {
    return item.tool_code + '-' + item.id_livrable;
  }

  viewLivrable(item: LivrableGlobal): void {
    this.storageService.setIdComp(item.comp_id);
    this.storageService.setIdConsultant(item.cons_id);
    this.router.navigateByUrl('consultant/tool/' + item.tool_code);
  }

  goBack(): void {
    history.back();
  }
}
