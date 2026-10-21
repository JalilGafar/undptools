import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

const USER_KEY = 'auth-user';
const COMPANY_KEY = 'auth-company-id';
const CONSULTANT_KEY = 'auth-consultant-id';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this._currentUser$ = new BehaviorSubject<any>(this.readUserFromStorage());
    this._companyId = this.readNumber(COMPANY_KEY) as number;
    this._consultantId = this.readNumber(CONSULTANT_KEY) ?? 0;
  }

  // Entreprise / consultant courants : conservés dans sessionStorage pour survivre à l'actualisation de la page
  private _companyId!: number;
  private _consultantId = 0;

  get CompanyId(): number { return this._companyId; }
  get ConsultantId(): number { return this._consultantId; }

  private readNumber(key: string): number | undefined {
    if (!isPlatformBrowser(this.platformId)) return undefined;
    const n = Number(window.sessionStorage.getItem(key));
    return Number.isFinite(n) && window.sessionStorage.getItem(key) !== null ? n : undefined;
  }

  private writeNumber(key: string, value: number): void {
    if (isPlatformBrowser(this.platformId)) {
      window.sessionStorage.setItem(key, String(value));
    }
  }

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
    this._companyId = Number(id);
    this.writeNumber(COMPANY_KEY, this._companyId);
  }

  public setIdConsultant(id: number) {
    this._consultantId = Number(id);
    this.writeNumber(CONSULTANT_KEY, this._consultantId);
  }

  // conservées pour compatibilité
  public showtools(): boolean { return true; }
  public hidetools(): boolean { return false; }
}
