import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShareServiceService {

  private _menuVisible = new BehaviorSubject<boolean>(false);
  menuVisible$ = this._menuVisible.asObservable();
  
  private _manMenuVisible = new BehaviorSubject<boolean>(false);
  manMenuVisible$ = this._manMenuVisible.asObservable();

  showMenu() {
    this._menuVisible.next(true);
  }
  showManMenu() {
    this._manMenuVisible.next(true);
  }

  hideMenu() {
    this._menuVisible.next(false);
  }
  hideManMenu() {
    this._manMenuVisible.next(false);
  }

  private _sidebarOpen$ = new BehaviorSubject<boolean>(false);
  sidebarOpen$ = this._sidebarOpen$.asObservable();

  openSidebar()  { this._sidebarOpen$.next(true);  }
  closeSidebar() { this._sidebarOpen$.next(false); }

  private _loading$ = new BehaviorSubject<boolean>(false);
  get loading$(): Observable<boolean> {
    return this._loading$.asObservable();
  }

  setLoadingStatus(loading: boolean) {
    this._loading$.next(loading)
  }



}
