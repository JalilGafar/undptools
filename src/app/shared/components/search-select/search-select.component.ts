import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface SelectItem { code: string; label: string; }

/** Retire les accents et la casse : « eléctricité » trouve « ÉLECTRICITÉ » */
const fold = (s: string): string => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * Liste déroulante avec recherche, pour les longues listes (secteurs d'activité CITI : jusqu'à 238 lignes).
 * Toutes les options sont dans le menu, que l'on fait défiler : un consultant qui ne connaît ni le code ni le nom du secteur
 * doit pouvoir parcourir la liste entière. Pour aller plus vite, on tape quelques lettres du code ou du libellé ;
 * on touche la ligne voulue, la valeur est le code.
 */
@Component({
  selector: 'app-search-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ss">
      <div class="ss-box" [class.disabled]="disabled">
        <input class="form-control ss-input" type="text" autocomplete="off" [disabled]="disabled"
               [placeholder]="selected ? '' : placeholder"
               [ngModel]="open ? query : ''" (ngModelChange)="query = $event"
               (focus)="openList()" (keydown.escape)="open = false" [attr.aria-label]="placeholder">
        @if (!open && selected) { <span class="ss-current">{{ display(selected) }}</span> }
        @if (selected && !disabled) {
          <button type="button" class="ss-clear" (click)="clear($event)" aria-label="Effacer le choix"><i class="bi bi-x-lg"></i></button>
        }
      </div>
      @if (open) {
        <ul class="ss-list" role="listbox">
          @if (filtered.length) {
            <li class="ss-hint">{{ query.trim() ? filtered.length + ' résultat' + (filtered.length > 1 ? 's' : '') : options.length + ' choix : faites défiler ou tapez pour filtrer' }}</li>
          }
          @for (o of filtered; track o.code) {
            <li role="option" [class.on]="o.code === value" (click)="pick(o, $event)">{{ display(o) }}</li>
          } @empty {
            <li class="ss-empty">Aucun résultat</li>
          }
        </ul>
      }
    </div>
  `,
  styles: [`
    .ss { position: relative; }
    .ss-box { position: relative; }
    .ss-input { padding-right: 2.4rem; }
    .ss-current {
      position: absolute; inset: 1px 2.4rem 1px .75rem; display: flex; align-items: center;
      font-size: .9rem; line-height: 1.25; pointer-events: none; overflow: hidden; color: #1e293b;
    }
    .ss-box.disabled .ss-current { color: #475569; }
    .ss-clear { position: absolute; right: 2px; top: 50%; transform: translateY(-50%); width: 40px; height: 40px; border: 0; background: transparent; color: #6b7280; }
    .ss-list {
      position: absolute; left: 0; right: 0; z-index: 30; margin: 4px 0 0; padding: .25rem; list-style: none;
      max-height: min(60vh, 24rem); overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch;
      background: #fff; border: 1.5px solid #1a56db; border-radius: 10px;
      box-shadow: 0 8px 24px rgba(15, 23, 42, .2);
    }
    .ss-list li { padding: .55rem .6rem; font-size: .88rem; line-height: 1.3; border-radius: 6px; cursor: pointer; }
    .ss-list li:hover, .ss-list li.on { background: #eef3ff; }
    .ss-list li.on { font-weight: 700; color: #1a56db; }
    .ss-list .ss-empty, .ss-list .ss-hint { color: #6b7280; cursor: default; background: transparent; }
    .ss-list .ss-hint { font-size: .78rem; padding: .3rem .6rem .45rem; border-bottom: 1px solid #e5e7eb; margin-bottom: .2rem; }
  `]
})
export class SearchSelectComponent {

  @Input() options: SelectItem[] = [];
  @Input() value: string | null = null;
  @Input() disabled = false;
  @Input() placeholder = 'Rechercher…';
  @Output() valueChange = new EventEmitter<string | null>();

  open = false;
  query = '';
  // Résultat du filtre, recalculé seulement quand la recherche ou la liste change (la liste CITI compte 238 lignes)
  private cachedFor: SelectItem[] | null = null;
  private cachedQuery = '';
  private cached: SelectItem[] = [];

  constructor(private host: ElementRef<HTMLElement>) { }

  get selected(): SelectItem | undefined {
    return this.value ? this.options.find(o => o.code === this.value) : undefined;
  }

  /** Toutes les options qui correspondent à la recherche (sans limite) */
  get filtered(): SelectItem[] {
    const q = fold(this.query.trim());
    if (this.cachedFor !== this.options || this.cachedQuery !== q) {
      this.cached = q ? this.options.filter(o => fold(o.code + ' ' + o.label).includes(q)) : this.options;
      this.cachedFor = this.options;
      this.cachedQuery = q;
    }
    return this.cached;
  }

  display(o: SelectItem): string {
    return o.code === o.label ? o.label : `${o.code} - ${o.label}`;
  }

  openList(): void {
    if (this.disabled) return;
    this.query = '';
    this.open = true;
    setTimeout(() => {
      const list = this.host.nativeElement.querySelector<HTMLElement>('.ss-list');
      if (!list) return;
      // Le menu s'ouvre sur le choix actuel plutôt qu'en haut de la liste
      const on = list.querySelector<HTMLElement>('li.on');
      if (on) list.scrollTop = Math.max(0, on.offsetTop - (list.clientHeight - on.offsetHeight) / 2);
      this.keepInView(list);
    });
  }

  /**
   * Sur téléphone, le bas du menu peut passer sous la barre fixée en bas de l'écran (« Enregistrer ») : la page défile alors
   * juste assez pour que tout le menu soit visible, sans jamais cacher le champ de recherche sous l'en-tête du site.
   */
  private keepInView(list: HTMLElement): void {
    if (typeof window === 'undefined') return;
    const BOTTOM_BAR = 96, TOP_BAR = 72;
    const overflow = list.getBoundingClientRect().bottom - (window.innerHeight - BOTTOM_BAR);
    if (overflow <= 0) return;
    const room = this.host.nativeElement.getBoundingClientRect().top - TOP_BAR;
    window.scrollBy({ top: Math.min(overflow, Math.max(0, room)), behavior: 'smooth' });
  }

  pick(o: SelectItem, event: Event): void {
    event.preventDefault();
    this.value = o.code;
    this.valueChange.emit(o.code);
    this.open = false;
  }

  clear(event: Event): void {
    event.stopPropagation();
    this.value = null;
    this.valueChange.emit(null);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.open && !this.host.nativeElement.contains(event.target as Node)) this.open = false;
  }
}
