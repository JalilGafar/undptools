import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  
  constructor() { }

  CompanyId!: number;

  private _visibleTools$ = new BehaviorSubject<boolean>(false);
  get visibleTools$(): Observable<boolean> {
    return this._visibleTools$.asObservable();
  }

  public setVisibleToolsTrue() {
    this._visibleTools$.next(true)
    console.log('tools to visible')
  }

  public setVisibleToolsFalse() {
    this._visibleTools$.next(false)
        console.log('Hide tools')
  }

  clean(): void {
    window.sessionStorage.clear();
    console.log('clear the window.sessionStorage')
  }

  public saveUser(user: any): void {
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  public getUser(): any {
    const user = window.sessionStorage.getItem(USER_KEY);
    if (user) {
      return JSON.parse(user);
    }

    return null;
  }

  public isLoggedIn(): boolean {
    const user = window.sessionStorage.getItem(USER_KEY);
    if (user) {
      return true;
    }

    return false;
  }

  public showtools(): boolean {
    return true
  }

  public hidetools(): boolean {
    return false
  }

  public setIdComp (id:number){
    this.CompanyId = id;
  }

}
