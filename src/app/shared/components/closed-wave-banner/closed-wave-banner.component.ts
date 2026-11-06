import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { StorageService } from '../../../_services/storage.service';

/** Pages d'une entreprise ouverte par son consultant */
const COMPANY_PAGES = /^\/consultant\/(dashbord|tool|edit-company)(\/|\?|#|$)/;

/**
 * Bandeau « vague clôturée » : le consultant consulte l'entreprise en lecture seule (le serveur refuse de toute façon ses
 * saisies). L'état est posé par le tableau de bord de l'entreprise ; seuls les consultants le voient.
 */
@Component({
  selector: 'app-closed-wave-banner',
  standalone: true,
  template: `
    @if (show()) {
      <div class="cw" role="status">
        <div class="container cw-inner">
          <i class="bi bi-lock-fill"></i>
          <p><strong>{{ storage.LockedWaveName }}</strong> est clôturée : cette entreprise est en lecture seule.
            L'administrateur peut rouvrir la vague.</p>
        </div>
      </div>
    }
  `,
  styles: `
    :host { display: block; }
    .cw { padding: .55rem 0; color: #7a4b00; background: #fff4d6; border-bottom: 1px solid #f3dc9b; }
    .cw-inner { display: flex; align-items: flex-start; gap: .6rem; }
    .cw-inner i { margin-top: .15rem; font-size: 1.05rem; }
    p { margin: 0; font-size: .88rem; line-height: 1.4; }
    @media print { .cw { display: none; } }
  `
})
export class ClosedWaveBannerComponent {

  readonly storage = inject(StorageService);
  private router = inject(Router);

  private url = toSignal(
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd), map(e => e.urlAfterRedirects)),
    { initialValue: this.router.url }
  );

  readonly show = computed(() => COMPANY_PAGES.test(this.url()) && this.storage.CompanyLocked && !this.storage.isManager());
}
