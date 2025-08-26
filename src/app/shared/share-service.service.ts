import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShareServiceService {

  private _menuVisible = new BehaviorSubject<boolean>(false);
  menuVisible$ = this._menuVisible.asObservable();

  showMenu() {
    this._menuVisible.next(true);
    console.log('menu visible')
  }

  hideMenu() {
    this._menuVisible.next(false);
    console.log('menu caché')
  }

  private _loading$ = new BehaviorSubject<boolean>(false);
  get loading$(): Observable<boolean> {
    return this._loading$.asObservable();
  }

  setLoadingStatus(loading: boolean) {
    this._loading$.next(loading)
  }



}
