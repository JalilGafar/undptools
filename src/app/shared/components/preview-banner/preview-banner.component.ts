import { Component, Input } from '@angular/core';

/**
 * Bandeau affiché quand un manager / modérateur ouvre un outil depuis le menu « Tools » (sans entreprise) :
 * il voit l'outil exactement comme un consultant et peut le remplir pour en juger la qualité,
 * mais rien n'est enregistré.
 */
@Component({
  selector: 'app-preview-banner',
  standalone: true,
  template: `
    <div class="preview-banner no-print" [class.preview-end]="end" role="note">
      <i class="bi bi-eye"></i>
      <span>
        @if (end) {
          <strong>Seuls les consultants peuvent enregistrer les outils.</strong>
          Ce que vous avez saisi ici n'est conservé nulle part.
        } @else {
          <strong>Aperçu manager.</strong>
          Vous voyez l'outil comme un consultant et pouvez le remplir pour en juger la qualité.
          Rien n'est enregistré.
        }
      </span>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .preview-banner {
      display: flex; align-items: flex-start; gap: .6rem; margin: 0 0 1rem; padding: .7rem .9rem;
      font-size: .9rem; line-height: 1.4; color: #5b3a00;
      background: #fff4d6; border: 1px solid #f3c969; border-left: 5px solid #f0a500; border-radius: 8px;
    }
    .preview-banner i { font-size: 1.1rem; margin-top: .05rem; }
    .preview-end { margin-top: 1rem; text-align: left; }
  `]
})
export class PreviewBannerComponent {
  /** true : version « bas de page » à la place du bouton Enregistrer */
  @Input() end = false;
}
