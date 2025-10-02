import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from '../core/model/user';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ManagerService {

  constructor(private http: HttpClient) { };

  private _persona$ = new BehaviorSubject<User[]>([]);
  get persona$(): Observable<User[]> {
    return this._persona$.asObservable()
  }

  getUserFromServer() {
    this.http.get<User[]>(`${environment.apiUrl}/api/manager/user`).pipe(
      tap(user => {
        this._persona$.next(user);
      })
    ).subscribe();
  }

}
