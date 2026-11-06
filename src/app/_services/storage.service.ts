import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { hasManagerRole } from '../core/roles';

const USER_KEY = 'auth-user';
const COMPANY_KEY = 'auth-company-id';
const CONSULTANT_KEY = 'auth-consultant-id';
const LOCKED_KEY = 'auth-company-locked';      // nom de la vague clôturée de l'entreprise courante

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this._currentUser$ = new BehaviorSubject<any>(this.readUserFromStorage());
    this._companyId = this.readNumber(COMPANY_KEY) as number;
    this._consultantId = this.readNumber(CONSULTANT_KEY) ?? 0;
    this._lockedWave.set(isPlatformBrowser(platformId) ? window.sessionStorage.getItem(LOCKED_KEY) : null);
  }

  // Entreprise / consultant courants : conservés dans sessionStorage pour survivre à l'actualisation de la page
  private _companyId!: number;
  private _consultantId = 0;

  // Vague clôturée de l'entreprise courante : le consultant la consulte en lecture seule (le serveur refuse de toute façon ses saisies)
  private _lockedWave = signal<string | null>(null);
  get CompanyLocked(): boolean { return this._lockedWave() !== null; }
  get LockedWaveName(): string | null { return this._lockedWave(); }

  public setCompanyLocked(waveName: string | null): void {
    this._lockedWave.set(waveName);
    if (isPlatformBrowser(this.platformId)) {
      if (waveName === null) window.sessionStorage.removeItem(LOCKED_KEY);
      else window.sessionStorage.setItem(LOCKED_KEY, waveName);
    }
  }

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
    this.setCompanyLocked(null);          // l'appelant précise ensuite si la vague de cette entreprise est clôturée
  }

  public setIdConsultant(id: number) {
    this._consultantId = Number(id);
    this.writeNumber(CONSULTANT_KEY, this._consultantId);
  }

  /** Oublie l'entreprise et le consultant courants (un manager qui ouvre un outil depuis le menu le voit alors vierge) */
  public clearContext(): void {
    this.setIdComp(0);
    this.setIdConsultant(0);
  }

  public isManager(): boolean {
    const roles: string[] = this.getUser()?.roles ?? [];
    return hasManagerRole(roles);
  }

  // conservées pour compatibilité
  public showtools(): boolean { return true; }
  public hidetools(): boolean { return false; }
}
