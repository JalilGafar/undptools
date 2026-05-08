import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, switchMap, tap } from 'rxjs';
import { Livrable } from '../../../core/model/livrable';
import { ActivatedRoute, Router } from '@angular/router';
import { ManagerService } from '../../manager.service';
import { StorageService } from '../../../_services/storage.service';
import { User } from '../../../core/model/user';

@Component({
  selector: 'app-list-livrable',
  standalone: true,
  imports: [
        CommonModule,

  ],
  templateUrl: './list-livrable.component.html',
  styleUrl: './list-livrable.component.scss',
})
export class ListLivrableComponent implements OnInit,  OnDestroy {

  librables$!: Observable<Livrable[]>;
  userId!: number;
  user$!: Observable<User>;
  sujet!: string;

  constructor(
    private ManagerServices: ManagerService,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private router: Router,
  ){}

  ngOnInit(){

    this.route.params.pipe(
      tap(params   => this.userId =  params['id']),
      tap(params => {

        // formations.filter(formation => formation.id_form === id)[0]
      } )
    ).subscribe();


    this.user$ = this.route.params.pipe(
      switchMap(params => this.ManagerServices.getUserById(+params['id'])),
      // tap(formation => this.formation = formation)
    );

    this.ManagerServices.getLivrableFromUserId(this.userId);

    this.librables$ = this.ManagerServices.livrable$;
    
  }

  ngOnDestroy() {
    // this.storageService.setIdConsultant(0);
  }

  viewLivrable(idComp : number, tool: string) {
    this.storageService.setIdComp(idComp);
    this.storageService.setIdConsultant(this.userId);
    this.router.navigateByUrl('consultant/tool/'+tool)
  }

}
