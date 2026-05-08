import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from "@angular/router";
import { StorageService } from "../../_services/storage.service";

@Injectable({
    providedIn: 'root'
})

export class AuthGuard implements CanActivate {

    constructor( private storageService : StorageService,
                private router : Router
     ){}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
         if (this.storageService.isLoggedIn()) {
            return true;
         }else {
            this.router.navigateByUrl('/login');
            return false;
         }
    }
}