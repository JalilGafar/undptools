import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, from, switchMap, throwError } from 'rxjs';
import { StorageService } from '../_services/storage.service';
import { WaveService } from '../shared/wave.service';

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
  constructor(private storageService: StorageService, private injector: Injector) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const user = this.storageService.getUser();
    const token = user?.accessToken;

    req = req.clone({
      withCredentials: true,
      ...(token ? { setHeaders: { Authorization: `Bearer ${token}` } } : {})
    });

    // Lectures de l'API : on attend de connaître les vagues affichées, puis on les joint (?vagues=2,3). Le serveur ne filtre que
    // les routes qui le prévoient et ignore ce paramètre ailleurs. WaveService est pris à la demande : il dépend de HttpClient.
    const wave = this.injector.get(WaveService);
    const send = (r: HttpRequest<any>) => wave.appliesTo(r)
      ? from(wave.ready).pipe(switchMap(() => next.handle(wave.paramValue ? r.clone({ params: r.params.set('vagues', wave.paramValue) }) : r)))
      : next.handle(r);

    return send(req).pipe(
      catchError((error: unknown) => {
        // Jeton expiré (24 h) ou invalide : la session n'est plus utilisable, on renvoie vers la connexion.
        // Les routes /api/auth/ sont exclues (un 401 à la connexion signifie « mauvais identifiants »).
        if (error instanceof HttpErrorResponse && error.status === 401 && token && !req.url.includes('/api/auth/')) {
          this.storageService.clean();
          this.injector.get(Router).navigateByUrl('/login');
        }
        return throwError(() => error);
      })
    );
  }
}

export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: HttpRequestInterceptor, multi: true },
];
