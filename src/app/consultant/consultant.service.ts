import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { environment } from '../../environment/environment';
import { Company } from '../core/model/company';

@Injectable({
  providedIn: 'root'
})
export class ConsultantService {

  constructor(private http: HttpClient) { };

  private _company$ = new BehaviorSubject<Company[]>([]);
  get company$(): Observable<Company[]> {
    return this._company$.asObservable()
  }

  getCompanyFromServer() {
    this.http.get<Company[]>(`${environment.apiUrl}/api/consultant/companies`).pipe(
      tap(campus => {
        this._company$.next(campus);
        //    this.setLoadingStatus(false);
      })
    ).subscribe();
  }
  getCompanyForConslFromServer(id: number) {
    let Id = new HttpParams();
    Id = Id.append('idUser', id);
    this.http.get<Company[]>(`${environment.apiUrl}/api/consultant/companiesUser`, { params: Id }).pipe(
      tap(campus => {
        this._company$.next(campus);
        //    this.setLoadingStatus(false);
      })
    ).subscribe();
  }

    getCompanyById(id: number): Observable<Company> {
    // if (!this.lastCandidatesLoad) {
    //   this.getFormationsFromServer()
    // }
    return this.company$.pipe(
      map(company => company.filter(company => company.id === id)[0])
    );
  }

  //Add new company
  addCompany(newCompany: {
    name: string, date_creation: number, produits: string, services: string, description: string, gerant: string,
    descrt_gerant: string, nbr_employer: string, nbr_femme: string, region: string, departement: string, ville: string,
    commune: string, quartier: string, lieu: string, idUser: number
  }): Observable<Company> {
    console.log(newCompany)
    return this.http.post<Company>(`${environment.apiUrl}/api/consultant/newCompany`, newCompany);
  }


}
