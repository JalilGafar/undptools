import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this._currentUser$ = new BehaviorSubject<any>(this.readUserFromStorage());
  }

  CompanyId!: number;
  ConsultantId: number = 0;

  // ── Utilisateur courant (flux réactif) ─────────────────────────────────────

  private _currentUser$!: BehaviorSubject<any>;

  get currentUser$(): Observable<any> {
    return this._currentUser$.asObservable();
  }

  private readUserFromStorage(): any {
    if (!isPlatformBrowser(this.platformId)) return null;
    const raw = window.sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  // ── Visibilité outils (flux réactif) ───────────────────────────────────────

  private _visibleTools$ = new BehaviorSubject<boolean>(false);

  get visibleTools$(): Observable<boolean> {
    return this._visibleTools$.asObservable();
  }

  public setVisibleToolsTrue() {
    this._visibleTools$.next(true);
  }

  public setVisibleToolsFalse() {
    this._visibleTools$.next(false);
  }

  // ── Session ────────────────────────────────────────────────────────────────

  clean(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.sessionStorage.clear();
    }
    this._currentUser$.next(null);
  }

  public saveUser(user: any): void {
    if (isPlatformBrowser(this.platformId)) {
      window.sessionStorage.removeItem(USER_KEY);
      window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    this._currentUser$.next(user);
  }

  public getUser(): any {
    if (!isPlatformBrowser(this.platformId)) return null;
    const user = window.sessionStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  public isLoggedIn(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    return !!window.sessionStorage.getItem(USER_KEY);
  }

  public setIdComp(id: number) {
    this.CompanyId = id;
  }

  public setIdConsultant(id: number) {
    this.ConsultantId = id;
  }

  // conservées pour compatibilité
  public showtools(): boolean { return true; }
  public hidetools(): boolean { return false; }
}
