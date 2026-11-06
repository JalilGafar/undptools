import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, OnDestroy, Output, PLATFORM_ID, ViewChild } from '@angular/core';

const INK = '#0b1f66';
const LINE_WIDTH = 2.6;
const EXPORT_MAX_WIDTH = 600;   // la signature enregistrée reste légère (quelques Ko)

/**
 * Zone de signature tactile en plein écran : le signataire trace avec le doigt, le stylet ou la souris.
 * Émet l'image PNG (data URL, fond transparent) avec `signed`, ou `cancelled` si on referme sans valider.
 */
@Component({
  selector: 'app-signature-pad',
  standalone: true,
  template: `
    <div class="sp-overlay" role="dialog" aria-modal="true" [attr.aria-label]="title">
      <div class="sp-card">
        <h3 class="sp-title">{{ title }}</h3>
        @if (subtitle) { <p class="sp-sub">{{ subtitle }}</p> }

        <div class="sp-zone">
          <canvas #canvas class="sp-canvas"
                  (pointerdown)="start($event)" (pointermove)="move($event)"
                  (pointerup)="end($event)" (pointercancel)="end($event)" (pointerleave)="end($event)"></canvas>
          @if (!hasInk) { <span class="sp-hint">Signez ici avec le doigt ou le stylet</span> }
        </div>

        <div class="sp-actions">
          <button type="button" class="btn btn-outline-secondary" (click)="clear()" [disabled]="!hasInk">
            <i class="bi bi-eraser me-1"></i>Effacer
          </button>
          <button type="button" class="btn btn-outline-secondary" (click)="cancelled.emit()">Annuler</button>
          <button type="button" class="btn btn-primary" (click)="validate()" [disabled]="!hasInk">
            <i class="bi bi-check-lg me-1"></i>Valider
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sp-overlay { position: fixed; inset: 0; z-index: 2000; background: rgba(15, 23, 42, .6);
                  display: flex; align-items: center; justify-content: center; padding: .75rem; }
    .sp-card { width: 100%; max-width: 640px; background: #fff; border-radius: 14px; padding: 1rem; box-shadow: 0 10px 30px rgba(0, 0, 0, .3); }
    .sp-title { font-size: 1.05rem; font-weight: 700; margin: 0 0 .25rem; color: #1e293b; }
    .sp-sub { margin: 0 0 .5rem; font-size: .85rem; color: #64748b; }
    .sp-zone { position: relative; height: 240px; margin: .5rem 0 .85rem; border: 2px dashed #cbd5e1; border-radius: 10px; background: #fff; }
    .sp-canvas { width: 100%; height: 100%; display: block; touch-action: none; cursor: crosshair; border-radius: 8px; }
    .sp-hint { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
               color: #94a3b8; font-size: .95rem; pointer-events: none; text-align: center; padding: 0 1rem; }
    .sp-actions { display: flex; gap: .5rem; }
    .sp-actions .btn { flex: 1; min-height: 48px; font-weight: 600; }
    @media (max-width: 576px) {
      .sp-overlay { align-items: flex-end; padding: 0; }
      .sp-card { border-radius: 14px 14px 0 0; max-width: none; }
      .sp-zone { height: 42vh; min-height: 200px; }
    }
  `]
})
export class SignaturePadComponent implements AfterViewInit, OnDestroy {

  @Input() title = 'Signature';
  @Input() subtitle = '';
  @Output() signed = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();

  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  hasInk = false;

  private ctx!: CanvasRenderingContext2D;
  private drawing = false;
  private pointerId: number | null = null;
  private last = { x: 0, y: 0 };
  private previousOverflow = '';

  constructor(@Inject(PLATFORM_ID) private platformId: object) { }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    // Empêche la page de défiler derrière la fenêtre de signature
    this.previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const canvas = this.canvasRef.nativeElement;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(canvas.clientWidth * ratio);
    canvas.height = Math.round(canvas.clientHeight * ratio);
    this.ctx = canvas.getContext('2d')!;
    this.ctx.scale(ratio, ratio);
    this.ctx.lineWidth = LINE_WIDTH;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = INK;
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) document.body.style.overflow = this.previousOverflow;
  }

  private point(e: PointerEvent): { x: number; y: number } {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  start(e: PointerEvent): void {
    if (this.drawing || !this.ctx) return;
    e.preventDefault();
    this.drawing = true;
    this.pointerId = e.pointerId;
    this.canvasRef.nativeElement.setPointerCapture(e.pointerId);
    this.last = this.point(e);
    // Un simple appui laisse un point
    this.ctx.beginPath();
    this.ctx.arc(this.last.x, this.last.y, LINE_WIDTH / 2, 0, Math.PI * 2);
    this.ctx.fillStyle = INK;
    this.ctx.fill();
    this.hasInk = true;
  }

  move(e: PointerEvent): void {
    if (!this.drawing || e.pointerId !== this.pointerId) return;
    e.preventDefault();
    const p = this.point(e);
    // Courbe lissée par les points milieux : le trait reste fluide même si l'écran envoie peu de points
    const mid = { x: (this.last.x + p.x) / 2, y: (this.last.y + p.y) / 2 };
    this.ctx.beginPath();
    this.ctx.moveTo(this.last.x, this.last.y);
    this.ctx.quadraticCurveTo(this.last.x, this.last.y, mid.x, mid.y);
    this.ctx.lineTo(p.x, p.y);
    this.ctx.stroke();
    this.last = p;
  }

  end(e: PointerEvent): void {
    if (e.pointerId !== this.pointerId) return;
    this.drawing = false;
    this.pointerId = null;
  }

  clear(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.ctx.restore();
    this.hasInk = false;
  }

  validate(): void {
    if (!this.hasInk) return;
    const source = this.canvasRef.nativeElement;
    // Image réduite (largeur max 600 px) pour rester légère à stocker
    const scale = Math.min(1, EXPORT_MAX_WIDTH / source.width);
    const out = document.createElement('canvas');
    out.width = Math.round(source.width * scale);
    out.height = Math.round(source.height * scale);
    out.getContext('2d')!.drawImage(source, 0, 0, out.width, out.height);
    this.signed.emit(out.toDataURL('image/png'));
  }
}
