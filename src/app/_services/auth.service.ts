import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, from, switchMap, throwError } from 'rxjs';
import { environment } from '../../environment/environment';
import { User } from '../core/model/user';
import { compressImage } from '../shared/image-compress';


const AUTH_API = `${environment.apiUrl}/api/auth/`;


const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  withCredentials: true
};


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<any> {
    return this.http.post(
      AUTH_API + 'signin',
      {
        username,
        password,
      },
      httpOptions
    );
  }

  register(username: string, email: string, password: string, roles: string[]): Observable<any> {
    return this.http.post(
      AUTH_API + 'signup',
      {
        username,
        email,
        password,
        roles
      },
      httpOptions
    );
  }

  uploadPhoto(file: File): Observable<{ photo: string }> {
    // Image réduite dans le navigateur puis envoyée en JSON (la couche d'entrée de l'hébergeur refuse le multipart)
    return from(compressImage(file, { maxSide: 800, maxBytes: 500_000 })).pipe(
      switchMap(image => this.http.post<{ photo: string }>(AUTH_API + 'photo-json', { image }, { withCredentials: true })),
      catchError(err => throwError(() => err?.error ? err : { error: { message: err?.message ?? 'Une erreur est survenue. Veuillez réessayer.' } }))
    );
  }

  logout(): Observable<any> {
    return this.http.post(AUTH_API + 'signout', {}, httpOptions);
  }
}
