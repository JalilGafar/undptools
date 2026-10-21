import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { User } from '../core/model/user';
import { environment } from '../../environment/environment';
import { Company } from '../core/model/company';
import { Livrable } from '../core/model/livrable';
import { LivrableGlobal } from '../core/model/livrable-global';
import { EntrepriseProfil, ProfilVente } from '../core/model/entreprise-profil';
import { StatsResponse } from '../core/model/stats';

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

  getUserFromServer() {
    this.http.get<User[]>(`${environment.apiUrl}/api/manager/user`).pipe(
      tap(user => {
        this._persona$.next(user);
      })
    ).subscribe();
  }

  getUserById(id:number): Observable<User>{
    return this.persona$.pipe(
      map(personas => personas.filter(persona => persona.id === id)[0])
    );
  }

  getCompanyFromServer() {
    this.http.get<Company[]>(`${environment.apiUrl}/api/consultant/companies`).pipe(
      tap(campus => {
        this._company$.next(campus);
        //    this.setLoadingStatus(false);
      })
    ).subscribe();
  }

  getCompanyFromConsultantId(id: number) {
    let Id = new HttpParams();
    Id = Id.append('idUser', id);
    this.http.get<Company[]>(`${environment.apiUrl}/api/consultant/companiesUser`, { params: Id }).pipe(
      tap(campus => {
        this._company$.next(campus);
        //    this.setLoadingStatus(false);
      })
    ).subscribe();
  }

   //Add new company
  addCompany(newCompany: {
    name: string, date_creation: number, produits: string, services: string, description: string, gerant: string,
    descrt_gerant: string, nbr_employer: string, nbr_femme: string, region: string, departement: string, ville: string,
    commune: string, quartier: string, lieu: string, x: number, y: number, idUser: number
  }): Observable<Company> {
    return this.http.post<Company>(`${environment.apiUrl}/api/manager/newCompany`, newCompany);
  }

  getCompanyDetailById(id: number) {
    this.http.get<Company>(`${environment.apiUrl}/api/manager/company/${id}`).pipe(
      tap(company => this._selectedCompany$.next(company))
    ).subscribe();
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
    return this.http.get<Livrable[]>(`${environment.apiUrl}/api/manager/livrables`, { params: new HttpParams().append('idUser', id) });
  }

  //Liste des livrables
  getLivrableFromUserId(id: number) {
    let Id = new HttpParams();
    Id = Id.append('idUser', id);
    this.http.get<Livrable[]>(`${environment.apiUrl}/api/manager/livrables`, { params: Id }).pipe(
      tap(livrables => {
        this._librables$.next(livrables);
        //    this.setLoadingStatus(false);
      })
    ).subscribe();

  }

  //Livrables d'une entreprise, tous consultants confondus
  fetchCompanyLivrables(companyId: number): Observable<LivrableGlobal[]> {
    return this.http.get<LivrableGlobal[]>(`${environment.apiUrl}/api/manager/company/${companyId}/livrables`);
  }

  //Profil du participant (1L) le plus récent d'une entreprise
  fetchCompanyProfil(companyId: number): Observable<{ profil: (EntrepriseProfil & { consultant: string | null }) | null; ventes: ProfilVente[]; fx: { year: number; xafPerUsd: number } }> {
    return this.http.get<any>(`${environment.apiUrl}/api/profil/company/${companyId}`);
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
    this.http.get<LivrableGlobal[]>(`${environment.apiUrl}/api/manager/all-livrables`).pipe(
      tap(livrables => {
        this._allLivrables$.next(livrables);
      })
    ).subscribe();
  }

}
