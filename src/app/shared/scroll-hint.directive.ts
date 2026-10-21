import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Directive, ElementRef, Inject, OnDestroy, PLATFORM_ID } from '@angular/core';

/**
 * À poser sur un conteneur à défilement horizontal (ex. `.table-responsive`).
 * Renseigne `data-overflow="true"` quand le contenu dépasse la largeur disponible : le style global
 * `.scroll-visible` + `.scroll-hint` (styles.scss) affiche alors la barre de défilement et l'indication
 * « Faites glisser » — uniquement quand elles sont utiles.
 */
@Directive({ selector: '[appScrollHint]', standalone: true })
export class ScrollHintDirective implements AfterViewInit, OnDestroy {

  private observer?: ResizeObserver;

  constructor(
    private host: ElementRef<HTMLElement>,
    @Inject(PLATFORM_ID) private platformId: object,
  ) { }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId) || typeof ResizeObserver === 'undefined') return;
    this.update();
    // Observe le conteneur (changement de largeur d'écran) et son contenu (colonnes, lignes ajoutées)
    this.observer = new ResizeObserver(() => this.update());
    const el = this.host.nativeElement;
    this.observer.observe(el);
    Array.from(el.children).forEach(child => this.observer!.observe(child));
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private update(): void {
    const el = this.host.nativeElement;
    el.dataset['overflow'] = el.scrollWidth > el.clientWidth + 1 ? 'true' : 'false';
  }
}
