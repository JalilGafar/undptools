import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map, Observable } from 'rxjs';
import { ManagerService } from '../../manager.service';
import { StorageService } from '../../../_services/storage.service';
import { User } from '../../../core/model/user';
import { Company } from '../../../core/model/company';
import { Livrable } from '../../../core/model/livrable';

@Component({
  selector: 'app-consultant-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './consultant-profile.component.html',
  styleUrl: './consultant-profile.component.scss'
})
export class ConsultantProfileComponent implements OnInit {

  consultantId!: number;
  isAdmin = false;

  user$!: Observable<User>;
  companies$!: Observable<Company[]>;
  livrables$!: Observable<Livrable[]>;
  companiesCount$!: Observable<number>;
  livrableCount$!: Observable<number>;

  constructor(
    private managerService: ManagerService,
    private storageService: StorageService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const roles = this.storageService.getUser()?.roles ?? [];
    this.isAdmin = roles.includes('ROLE_ADMIN');

    this.consultantId = +this.route.snapshot.paramMap.get('id')!;

    this.managerService.getUserFromServer();
    this.user$ = this.managerService.persona$.pipe(
      map(users => users.find(u => u.id === this.consultantId)!)
    );

    this.managerService.getCompanyFromConsultantId(this.consultantId);
    this.companies$ = this.managerService.company$;
    this.companiesCount$ = this.companies$.pipe(map(list => list.length));

    this.managerService.getLivrableFromUserId(this.consultantId);
    this.livrables$ = this.managerService.livrable$;
    this.livrableCount$ = this.livrables$.pipe(map(list => list.length));
  }

  viewLivrable(idComp: number, tool: string): void {
    this.storageService.setIdComp(idComp);
    this.storageService.setIdConsultant(this.consultantId);
    this.router.navigateByUrl('consultant/tool/' + tool);
  }
}
