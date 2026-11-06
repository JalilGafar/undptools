import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { ManagedUser, User } from '../core/model/user';
import { environment } from '../../environment/environment';
import { Company } from '../core/model/company';
import { Livrable } from '../core/model/livrable';
import { LivrableGlobal } from '../core/model/livrable-global';
import { mergeQuickWins } from './livrable-types';
import { EntrepriseProfil, ProfilVente } from '../core/model/entreprise-profil';
import { StatsResponse } from '../core/model/stats';
import { SuiviPortfolio } from '../core/model/suivi';
import { LOAD_DONE, LOAD_FAILED, LOAD_PENDING, LoadState } from '../core/load-state';

@Injectable({
  providedIn: 'root'
})
export class ManagerService {

  constructor(private http: HttpClient) { };

  private _persona$ = new BehaviorSubject<User[]>([]);
  get persona$(): Observable<User[]> {
    return this._persona$.asObservable()
  }

  private _company$ = new BehaviorSubject<Company[]>([]);
  get company$(): Observable<Company[]> {
    return this._company$.asObservable()
  }
  
  private _librables$ = new BehaviorSubject<Livrable[]>([]);
  get livrable$(): Observable<Livrable[]> {
    return this._librables$.asObservable()
  }

  private _selectedCompany$ = new BehaviorSubject<Company | null>(null);
  get selectedCompany$(): Observable<Company | null> {
    return this._selectedCompany$.asObservable();
  }
  clearSelectedCompany() { this._selectedCompany$.next(null); }

  // État de chargement de chaque liste (true au départ : les pages lancent leur requête dès l'ouverture)
  private _personaState$ = new BehaviorSubject<LoadState>(LOAD_PENDING);
  private _companyState$ = new BehaviorSubject<LoadState>(LOAD_PENDING);
  private _livrablesState$ = new BehaviorSubject<LoadState>(LOAD_PENDING);
  private _allLivrablesState$ = new BehaviorSubject<LoadState>(LOAD_PENDING);
  private _selectedCompanyState$ = new BehaviorSubject<LoadState>(LOAD_PENDING);
  get personaState$(): Observable<LoadState> { return this._personaState$.asObservable(); }
  get companyState$(): Observable<LoadState> { return this._companyState$.asObservable(); }
  get livrablesState$(): Observable<LoadState> { return this._livrablesState$.asObservable(); }
  get allLivrablesState$(): Observable<LoadState> { return this._allLivrablesState$.asObservable(); }
  get selectedCompanyState$(): Observable<LoadState> { return this._selectedCompanyState$.asObservable(); }

  /** Lance la requête, vide l'ancienne valeur (évite d'afficher la liste d'un autre écran) et publie l'état de chargement. */
  private load<T>(request: Observable<T>, store: BehaviorSubject<T>, state: BehaviorSubject<LoadState>, empty: T) {
    state.next(LOAD_PENDING);
    store.next(empty);
    request.subscribe({
      next: value => { store.next(value); state.next(LOAD_DONE); },
      error: () => state.next(LOAD_FAILED)
    });
  }

  /** Toutes les entreprises, toutes vagues confondues (l'écran de répartition des vagues ne suit pas la vague affichée) */
  fetchAllCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(`${environment.apiUrl}/api/consultant/companies`, { params: new HttpParams().set('vagues', 'all') });
  }

  /** Comptes et rôles (administrateur uniquement) */
  fetchManagedUsers(): Observable<ManagedUser[]> {
    return this.http.get<ManagedUser[]>(`${environment.apiUrl}/api/users`);
  }

  changeUserRole(id: number, role: string) {
    return this.http.put<{ message: string; role: string; nb_entreprises: number }>(`${environment.apiUrl}/api/users/${id}/role`, { role });
  }

  /** Utilisateurs et leur rôle, sans passer par le cache partagé des pages */
  fetchUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/api/manager/user`);
  }

  getUserFromServer() {
    this.load(this.http.get<User[]>(`${environment.apiUrl}/api/manager/user`), this._persona$, this._personaState$, []);
  }

  getUserById(id:number): Observable<User>{
    return this.persona$.pipe(
      map(personas => personas.filter(persona => persona.id === id)[0])
    );
  }

  getCompanyFromServer() {
    this.load(this.http.get<Company[]>(`${environment.apiUrl}/api/consultant/companies`), this._company$, this._companyState$, []);
  }

  getCompanyFromConsultantId(id: number) {
    const params = new HttpParams().append('idUser', id);
    this.load(this.http.get<Company[]>(`${environment.apiUrl}/api/consultant/companiesUser`, { params }), this._company$, this._companyState$, []);
  }

   //Add new company
  addCompany(newCompany: {
    name: string, date_creation: number, produits: string, services: string, description: string, gerant: string,
    descrt_gerant: string, nbr_employer: string, nbr_femme: string, region: string, departement: string, ville: string,
    commune: string, quartier: string, lieu: string, x: number, y: number, idUser: number, id_vague?: number | null
  }): Observable<Company> {
    return this.http.post<Company>(`${environment.apiUrl}/api/manager/newCompany`, newCompany);
  }

  getCompanyDetailById(id: number) {
    this.load<Company | null>(this.http.get<Company>(`${environment.apiUrl}/api/manager/company/${id}`),this._selectedCompany$, this._selectedCompanyState$, null);
  }

  updateCompany(id: number, data: Partial<Company>): Observable<any> {
    return this.http.put(`${environment.apiUrl}/api/manager/company/${id}`, data);
  }

  deleteCompany(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/api/manager/company/${id}`);
  }

  clearLivrables() {
    this._librables$.next([]);
  }

  //Liste des livrables d'un consultant, sans passer par le magasin partagé (chargement / erreur gérés par l'appelant)
  fetchLivrables(id: number): Observable<Livrable[]> {
    return this.http.get<Livrable[]>(`${environment.apiUrl}/api/manager/livrables`, { params: new HttpParams().append('idUser', id) }).pipe(map(l => mergeQuickWins(l)));
  }

  //Liste des livrables
  getLivrableFromUserId(id: number) {
    const params = new HttpParams().append('idUser', id);
    this.load(this.http.get<Livrable[]>(`${environment.apiUrl}/api/manager/livrables`, { params }).pipe(map(l => mergeQuickWins(l))), this._librables$, this._livrablesState$, []);
  }

  //Livrables d'une entreprise, tous consultants confondus
  fetchCompanyLivrables(companyId: number): Observable<LivrableGlobal[]> {
    return this.http.get<LivrableGlobal[]>(`${environment.apiUrl}/api/manager/company/${companyId}/livrables`).pipe(map(l => mergeQuickWins(l)));
  }

  //Profil du participant (1L) le plus récent d'une entreprise
  fetchCompanyProfil(companyId: number): Observable<{ profil: (EntrepriseProfil & { consultant: string | null }) | null; ventes: ProfilVente[]; fx: { year: number; xafPerUsd: number } }> {
    return this.http.get<any>(`${environment.apiUrl}/api/profil/company/${companyId}`);
  }

  //Suivi et évaluation : agrégats du portefeuille (filtres facultatifs : région, consultant)
  fetchSuiviPortfolio(region: string | null, consultantId: number | null): Observable<SuiviPortfolio> {
    let params = new HttpParams();
    if (region) params = params.append('region', region);
    if (consultantId) params = params.append('cons', consultantId);
    return this.http.get<SuiviPortfolio>(`${environment.apiUrl}/api/suivi/portfolio`, { params });
  }

  //Statistiques : une ligne par entreprise (tableau de bord global)
  fetchStats(): Observable<StatsResponse> {
    return this.http.get<StatsResponse>(`${environment.apiUrl}/api/manager/stats`);
  }

  private _allLivrables$ = new BehaviorSubject<LivrableGlobal[]>([]);
  get allLivrables$(): Observable<LivrableGlobal[]> {
    return this._allLivrables$.asObservable()
  }

  //Tous les livrables de la plateforme, tous consultants confondus
  getAllLivrables() {
    this.load(this.http.get<LivrableGlobal[]>(`${environment.apiUrl}/api/manager/all-livrables`).pipe(map(l => mergeQuickWins(l))), this._allLivrables$, this._allLivrablesState$, []);
  }

}
