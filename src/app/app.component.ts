import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, take } from 'rxjs';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { WaveBarComponent } from './shared/components/wave-bar/wave-bar.component';
import { ClosedWaveBannerComponent } from './shared/components/closed-wave-banner/closed-wave-banner.component';
import { WaveService } from './shared/wave.service';
import { StorageService } from './_services/storage.service';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';

/** Pages d'entrée : un utilisateur déjà connecté qui s'y retrouve est envoyé vers son espace */
const ENTRY_PAGES = ['/', '/home', '/login'];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    WaveBarComponent,
    ClosedWaveBannerComponent,
    FooterComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  updateAvailable = false;
  /** Mise à jour en cours (le bouton est alors désactivé) */
  updating = false;

  constructor(
    private router: Router,
    private storageService: StorageService,
    private swUpdate: SwUpdate,
    // Pris dès le démarrage : charge les vagues et suit la connexion / déconnexion de l'utilisateur
    private waves: WaveService
  ) { }

  applyUpdate(): void {
    if (this.updating) return;
    this.updating = true;
    // Dans tous les cas on recharge : même si l'activation échoue, la page repart sur la version la plus récente
    this.swUpdate.activateUpdate().catch(() => undefined).then(() => window.location.reload());
  }

  ngOnInit(): void {

    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
        .subscribe(() => { this.updateAvailable = true; });
    }

    // Au chargement, un utilisateur connecté qui arrive sur une page d'entrée rejoint son espace. Toute autre adresse
    // (lien direct, actualisation d'un outil) est respectée : l'entreprise courante est conservée par le navigateur.
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd), take(1))
      .subscribe(e => {
        if (!this.storageService.isLoggedIn()) return;
        const path = e.urlAfterRedirects.split(/[?#]/)[0];
        if (ENTRY_PAGES.includes(path)) {
          this.router.navigateByUrl(this.storageService.isManager() ? '/manager' : '/consultant', { replaceUrl: true });
        }
      });
  }

  title = 'undptools';
}
