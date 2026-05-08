import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environment/environment';
import { Company } from '../core/model/company';

@Injectable({
  providedIn: 'root'
})
export class ConsultantService {

  constructor (private http: HttpClient) { };

  private _company$ = new BehaviorSubject<Company[]>([]);
  get comapy$(): Observable<Company[]> {
    return this._company$.asObservable()
  }

  getCompanyFromServer() {
    this.http.get<Company[]>(`${environment.apiUrl}/api/consultant/companies`).pipe(
      tap(campus => {
        this._company$.next(campus);
        //    this.setLoadingStatus(false);
      })
    ).subscribe();;
  }
  
}
