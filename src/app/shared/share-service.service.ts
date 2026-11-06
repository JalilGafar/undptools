import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShareServiceService {

  /** Panneau des outils de l'en-tête (ouvert / fermé) */
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
