import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { StorageService } from "../../_services/storage.service";

@Injectable({
    providedIn: 'root'
})
export class ManagerGuard implements CanActivate {

    constructor(
        private storageService: StorageService,
        private router: Router
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const user = this.storageService.getUser();
        const roles: string[] = user?.roles ?? [];
        if (roles.includes('ROLE_ADMIN') || roles.includes('ROLE_MODERATOR')) {
            return true;
        }
        this.router.navigateByUrl('/login');
        return false;
    }
}
