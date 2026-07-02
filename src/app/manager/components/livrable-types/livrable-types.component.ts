import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { ManagerService } from '../../manager.service';
import { LivrableGlobal } from '../../../core/model/livrable-global';
import { LIVRABLE_TYPES, LivrableTypeMeta } from '../../livrable-types';

@Component({
  selector: 'app-livrable-types',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './livrable-types.component.html',
  styleUrl: './livrable-types.component.scss',
})
export class LivrableTypesComponent implements OnInit {

  livrables$!: Observable<LivrableGlobal[]>;
  types: LivrableTypeMeta[] = LIVRABLE_TYPES;

  constructor(
    private managerService: ManagerService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.managerService.getAllLivrables();
    this.livrables$ = this.managerService.allLivrables$;
  }

  countByType(livrables: LivrableGlobal[], toolCode: string): number {
    return livrables.filter(l => l.tool_code === toolCode).length;
  }

  goToType(toolCode: string) {
    this.router.navigateByUrl('manager/all-livrables/' + toolCode);
  }
}
