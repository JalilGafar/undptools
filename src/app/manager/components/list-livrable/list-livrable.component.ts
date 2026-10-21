import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
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
export class ListLivrableComponent implements OnInit {

  livrables: Livrable[] = [];
  isLoading = true;
  loadError = false;
  userId!: number;
  user$!: Observable<User>;

  constructor(
    private ManagerServices: ManagerService,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));

    // Le nom du consultant vient de la liste des utilisateurs : on la charge ici
    // pour que la page fonctionne aussi après une actualisation ou depuis un lien direct.
    this.ManagerServices.getUserFromServer();
    this.user$ = this.ManagerServices.getUserById(this.userId);

    this.ManagerServices.fetchLivrables(this.userId).subscribe({
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

  trackLivrable(item: Livrable): string {
    return item.tool_code + '-' + item.id_livrable;
  }

  viewLivrable(idComp: number, tool: string) {
    this.storageService.setIdComp(idComp);
    this.storageService.setIdConsultant(this.userId);
    this.router.navigateByUrl('consultant/tool/' + tool);
  }

  goBack(): void {
    history.back();
  }

}
