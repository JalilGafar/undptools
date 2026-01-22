import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from '../core/model/user';
import { environment } from '../../environment/environment';
import { Company } from '../core/model/company';

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

  getUserFromServer() {
    this.http.get<User[]>(`${environment.apiUrl}/api/manager/user`).pipe(
      tap(user => {
        this._persona$.next(user);
      })
    ).subscribe();
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

}
