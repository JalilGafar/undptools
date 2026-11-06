import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { ManagerService } from '../../manager.service';
import { LivrableGlobal } from '../../../core/model/livrable-global';
import { LIVRABLE_TYPES, LivrableTypeMeta, groupOf } from '../../livrable-types';
import { LoadingComponent, LoadErrorComponent } from '../../../shared/components/loading/loading.component';
import { LoadState } from '../../../core/load-state';
import { LivrablesTableComponent } from '../livrables-table/livrables-table.component';

/** Affichage de la page : une carte par type de livrable, ou tous les livrables dans un tableau */
type ViewMode = 'types' | 'table';
const VIEW_KEY = 'livrables-view';

@Component({
  selector: 'app-livrable-types',
  standalone: true,
  imports: [
    LoadingComponent,
    LoadErrorComponent,
    CommonModule,
    LivrablesTableComponent,
  ],
  templateUrl: './livrable-types.component.html',
  styleUrl: './livrable-types.component.scss',
})
export class LivrableTypesComponent implements OnInit {

  livrables$!: Observable<LivrableGlobal[]>;
  state$!: Observable<LoadState>;
  types: LivrableTypeMeta[] = LIVRABLE_TYPES;
  mode: ViewMode = 'types';

  constructor(
    private managerService: ManagerService,
    private router: Router,
  ) {}

  ngOnInit() {
    // Le dernier affichage choisi est conservé (navigateur de l'utilisateur)
    try { if (localStorage.getItem(VIEW_KEY) === 'table') this.mode = 'table'; } catch { /* stockage indisponible */ }
    this.managerService.getAllLivrables();
    this.livrables$ = this.managerService.allLivrables$;
    this.state$ = this.managerService.allLivrablesState$;
  }

  countByType(livrables: LivrableGlobal[], toolCode: string): number {
    return livrables.filter(l => groupOf(l) === toolCode).length;
  }

  setMode(mode: ViewMode): void {
    this.mode = mode;
    try { localStorage.setItem(VIEW_KEY, mode); } catch { /* idem */ }
  }

  goToType(toolCode: string) {
    this.router.navigateByUrl('manager/all-livrables/' + toolCode);
  }

  goBack(): void {
    history.back();
  }
}
