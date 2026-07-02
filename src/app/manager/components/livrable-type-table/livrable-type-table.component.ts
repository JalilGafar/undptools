import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ManagerService } from '../../manager.service';
import { StorageService } from '../../../_services/storage.service';
import { LivrableGlobal } from '../../../core/model/livrable-global';
import { LIVRABLE_TYPES } from '../../livrable-types';

@Component({
  selector: 'app-livrable-type-table',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './livrable-type-table.component.html',
  styleUrl: './livrable-type-table.component.scss',
})
export class LivrableTypeTableComponent implements OnInit {

  livrables$!: Observable<LivrableGlobal[]>;
  typeLabel = '';

  constructor(
    private managerService: ManagerService,
    private storageService: StorageService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    const toolCode = this.route.snapshot.paramMap.get('type') ?? '';
    this.typeLabel = LIVRABLE_TYPES.find(t => t.tool_code === toolCode)?.label ?? toolCode;

    this.managerService.getAllLivrables();
    this.livrables$ = this.managerService.allLivrables$.pipe(
      map(livrables => livrables.filter(l => l.tool_code === toolCode))
    );
  }

  viewLivrable(item: LivrableGlobal) {
    this.storageService.setIdComp(item.comp_id);
    this.storageService.setIdConsultant(item.cons_id);
    this.router.navigateByUrl('consultant/tool/' + item.tool_code);
  }
}
