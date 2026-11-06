import { Component, Input } from '@angular/core';

/** Indicateur de chargement centré, à afficher tant que les données d'une page ne sont pas toutes disponibles. */
@Component({
  selector: 'app-loading',
  standalone: true,
  template: `
    <div class="loading-block" [class.overlay]="overlay" role="status" aria-live="polite">
      <div class="spinner-border text-primary" aria-hidden="true"></div>
      <p class="loading-text">{{ message }}</p>
    </div>
  `,
  styles: [`
    .loading-block { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 1rem; text-align: center; }
    .loading-block.overlay { position: fixed; inset: 0; z-index: 1000; background: rgba(255, 255, 255, .8); }
    .loading-text { margin: .75rem 0 0; color: #6b7280; font-size: .9rem; }
  `]
})
export class LoadingComponent {
  @Input() message = 'Chargement en cours…';
  /** Recouvre la page (sans la retirer du DOM) : pour les formulaires qui se remplissent à l'arrivée des données */
  @Input() overlay = false;
}

/** Message affiché quand un chargement échoue (réseau lent ou coupé, erreur serveur). */
@Component({
  selector: 'app-load-error',
  standalone: true,
  template: `
    <div class="alert alert-danger d-flex align-items-center justify-content-between flex-wrap gap-2" role="alert">
      <span>{{ message }}</span>
      <button type="button" class="btn btn-sm btn-outline-danger" (click)="reload()">Réessayer</button>
    </div>
  `
})
export class LoadErrorComponent {
  @Input() message = 'Impossible de charger les données. Vérifiez votre connexion puis réessayez.';
  reload(): void { location.reload(); }
}
