import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { User } from '../core/model/user';
import { environment } from '../../environment/environment';
import { Company } from '../core/model/company';
import { Livrable } from '../core/model/livrable';

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

  getUserFromServer() {
    this.http.get<User[]>(`${environment.apiUrl}/api/manager/user`).pipe(
      tap(user => {
        this._persona$.next(user);
      })
    ).subscribe();
  }

  getUserById(id:number): Observable<User>{
    this.getCompanyFromServer();
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

}
