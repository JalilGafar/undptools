import { Component, OnDestroy, OnInit } from '@angular/core';
import { StorageService } from '../../../_services/storage.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ShareServiceService } from '../../../shared/share-service.service';

@Component({
  selector: 'app-tooltest',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './tooltest.component.html',
  styleUrl: './tooltest.component.scss',
})
export class TooltestComponent implements OnInit, OnDestroy {

  visibleTools$!: Observable<boolean>;

  constructor(
    private storageService: StorageService,
    private shareService: ShareServiceService,
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.storageService.setVisibleToolsTrue();
    });

    this.visibleTools$ = this.storageService.visibleTools$;
  };

  openTools(): void {
    this.shareService.openSidebar();
  }

  ngOnDestroy() {
    this.storageService.setVisibleToolsFalse();
    this.shareService.closeSidebar();
  }

}
