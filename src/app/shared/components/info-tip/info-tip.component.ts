import { isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, HostListener, Inject, Input, PLATFORM_ID, ViewChild } from '@angular/core';

const BUBBLE_WIDTH = 300;
const MARGIN = 10;

/**
 * Petit « i » d'information qui ouvre une bulle d'explication à côté de l'élément concerné.
 * Un toucher (ou un clic) l'ouvre ; un toucher ailleurs, la touche Échap ou un défilement de la page la referme.
 * La bulle est positionnée par rapport à l'écran : elle ne déborde jamais, même près du bord d'un téléphone.
 */
@Component({
  selector: 'app-info-tip',
  standalone: true,
  template: `
    <button #trigger type="button" class="tip-btn" (click)="toggle($event)" [attr.aria-expanded]="open"
            [attr.aria-label]="label" [title]="label">
      <i class="bi bi-info-circle"></i>
    </button>
    @if (open) {
      <div class="tip-bubble" role="note" [style.top.px]="top" [style.left.px]="left" [style.width.px]="width"
           (click)="$event.stopPropagation()">
        @if (title) { <strong class="tip-title">{{ title }}</strong> }
        <span class="tip-text">{{ text }}</span>
      </div>
    }
  `,
  styles: [`
    :host { display: inline-flex; vertical-align: middle; }
    .tip-btn {
      display: inline-flex; align-items: center; justify-content: center;
      width: 28px; height: 28px; padding: 0; margin: 0 .1rem;
      font-size: 1rem; line-height: 1; color: #1a56db;
      background: transparent; border: 0; border-radius: 50%;
    }
    .tip-btn:hover, .tip-btn[aria-expanded="true"] { background: #e0e7ff; }
    .tip-bubble {
      position: fixed; z-index: 2500; padding: .7rem .85rem;
      font-size: .86rem; line-height: 1.45; font-weight: 400; text-align: left; white-space: normal;
      color: #1e293b; background: #fff; border: 1.5px solid #1a56db; border-radius: 10px;
      box-shadow: 0 8px 24px rgba(15, 23, 42, .25);
    }
    .tip-title { display: block; margin-bottom: .25rem; font-size: .9rem; }
    .tip-text { display: block; }
  `]
})
export class InfoTipComponent {

  @Input({ required: true }) text!: string;
  /** Titre facultatif en gras au-dessus du texte */
  @Input() title = '';
  @Input() label = "Plus d'informations";

  @ViewChild('trigger', { static: true }) trigger!: ElementRef<HTMLButtonElement>;

  open = false;
  top = 0;
  left = 0;
  width = BUBBLE_WIDTH;

  constructor(@Inject(PLATFORM_ID) private platformId: object) { }

  toggle(event: Event): void {
    event.stopPropagation();   // ne referme pas immédiatement via le clic « ailleurs » ci-dessous
    event.preventDefault();
    if (this.open) { this.open = false; return; }
    if (!isPlatformBrowser(this.platformId)) return;

    const rect = this.trigger.nativeElement.getBoundingClientRect();
    const viewport = document.documentElement.clientWidth;
    this.width = Math.min(BUBBLE_WIDTH, viewport - 2 * MARGIN);
    // Centrée sous le « i », décalée si elle sortait de l'écran
    this.left = Math.max(MARGIN, Math.min(rect.left + rect.width / 2 - this.width / 2, viewport - this.width - MARGIN));
    this.top = rect.bottom + 8;
    this.open = true;
  }

  @HostListener('document:click')
  onOutsideClick(): void { this.open = false; }

  @HostListener('document:keydown.escape')
  onEscape(): void { this.open = false; }

  @HostListener('window:scroll')
  onScroll(): void { this.open = false; }
}
