import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // req = req.clone({
    //   // withCredentials: true,
    //   setHeaders: {
    //     Authorization: `Bearer ${token}`
    //   }
    // });

        // récupérer le token depuis localStorage
    const token = localStorage.getItem('accessToken');

    // cloner la requête en ajoutant l’en-tête Authorization si le token existe
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(req);
  }
}

export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: HttpRequestInterceptor, multi: true },
];


