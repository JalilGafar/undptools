import { Injectable, Injector, inject } from '@angular/core';
import { ActivatedRouteSnapshot, BaseRouteReuseStrategy } from '@angular/router';
import { WaveService } from './wave.service';

/**
 * Par défaut, naviguer vers l'adresse déjà affichée ne recrée pas la page. Quand l'utilisateur change de vague, WaveService
 * relance la navigation (même adresse) en positionnant `reloading` : aucune route n'est alors réutilisée, chaque page est recréée
 * et relit ses données avec la nouvelle sélection, comme à l'ouverture. Le reste du temps, le comportement d'Angular est inchangé.
 */
@Injectable()
export class WaveRouteReuseStrategy extends BaseRouteReuseStrategy {

  // WaveService dépend du Router, qui dépend de cette stratégie : on le prend à la demande pour éviter la dépendance circulaire
  private injector = inject(Injector);

  override shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    if (this.injector.get(WaveService).reloading) return false;
    return super.shouldReuseRoute(future, curr);
  }
}
