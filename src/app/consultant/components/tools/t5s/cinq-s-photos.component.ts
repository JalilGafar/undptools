import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, HostListener, Inject, Input, OnChanges, OnDestroy, PLATFORM_ID, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { concatMap, from, toArray } from 'rxjs';
import { ConsultantService } from '../../../consultant.service';
import { Phase5S, Photo5S, PhotoSlot } from '../../../../core/model/cinq-s';

const MAX_BYTES = 25 * 1024 * 1024;   // l'image est réduite dans le navigateur avant l'envoi
const MAX_FILES = 10;
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Photos « avant » ou « après » d'une évaluation 5S : plusieurs photos, chacune avec une légende, sur le modèle de la galerie
 * de l'entreprise (miniatures protégées lues avec le jeton, agrandissement, suppression par le consultant propriétaire).
 */
@Component({
  selector: 'app-cinq-s-photos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cinq-s-photos.component.html',
  styleUrl: './cinq-s-photos.component.scss'
})
export class CinqSPhotosComponent implements OnChanges, OnDestroy {

  @Input({ required: true }) title!: string;
  @Input({ required: true }) slot!: PhotoSlot;
  @Input({ required: true }) phase!: Phase5S;
  @Input({ required: true }) consultantId!: number;
  @Input({ required: true }) companyId!: number;
  @Input() canWrite = false;

  photos: Photo5S[] = [];
  isLoading = true;
  loadError = false;

  // Ajout
  files: File[] = [];
  legend = '';
  isUploading = false;
  message = '';
  messageType: 'success' | 'danger' = 'success';

  // URLs blob des miniatures / de l'image agrandie
  thumbs = new Map<number, string>();
  lightboxIndex: number | null = null;
  lightboxUrl: string | null = null;

  constructor(private toolService: ConsultantService, @Inject(PLATFORM_ID) private platformId: object) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['companyId'] || changes['consultantId'] || changes['phase'] || changes['slot']) this.load();
  }

  ngOnDestroy(): void {
    this.releaseUrls();
  }

  // ── Chargement ──────────────────────────────────────────────────────────────

  private load(): void {
    this.isLoading = true;
    this.loadError = false;
    this.toolService.listCinqSPhotos(this.consultantId, this.companyId, this.phase, this.slot).subscribe({
      next: res => {
        this.photos = res.photos;
        this.isLoading = false;
        this.loadThumbs();
      },
      error: () => { this.isLoading = false; this.loadError = true; }
    });
  }

  private loadThumbs(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.photos
      .filter(p => !this.thumbs.has(p.id))
      .forEach(p => this.toolService.cinqSPhotoBlob(p.id, 'thumb').subscribe({
        next: blob => this.thumbs.set(p.id, URL.createObjectURL(blob)),
        error: () => { /* miniature indisponible : le cadre reste vide */ }
      }));
  }

  private releaseUrls(): void {
    if (isPlatformBrowser(this.platformId)) this.thumbs.forEach(url => URL.revokeObjectURL(url));
    this.thumbs.clear();
    this.closeLightbox();
  }

  // ── Ajout ───────────────────────────────────────────────────────────────────

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selected = Array.from(input.files ?? []);
    input.value = '';
    if (!selected.length) return;
    if (selected.length > MAX_FILES) {
      this.show(`Maximum ${MAX_FILES} photos par envoi.`, 'danger');
      return;
    }
    const invalid = selected.find(f => !TYPES.includes(f.type) || f.size > MAX_BYTES);
    if (invalid) {
      this.show(`« ${invalid.name} » n'est pas valide (JPG, PNG ou WEBP, 25 Mo maximum).`, 'danger');
      return;
    }
    this.message = '';
    this.files = selected;
  }

  clearFiles(): void {
    this.files = [];
    this.legend = '';
  }

  /** Envoie les photos une par une (la même légende pour le lot) ; si l'une échoue, les précédentes sont déjà enregistrées */
  upload(): void {
    if (!this.files.length || this.isUploading) return;
    this.isUploading = true;
    const legend = this.legend.trim();
    from(this.files).pipe(
      concatMap(file => this.toolService.uploadCinqSPhoto(this.companyId, this.phase, this.slot, file, legend)),
      toArray()
    ).subscribe({
      next: results => {
        this.isUploading = false;
        this.show(results.length > 1 ? `${results.length} photos ajoutées.` : 'Photo ajoutée.', 'success');
        this.clearFiles();
        this.load();
      },
      error: err => {
        this.isUploading = false;
        this.show(err?.error?.message ?? 'Une erreur est survenue. Veuillez réessayer.', 'danger');
        this.load();   // des photos du lot ont pu être enregistrées avant l'erreur
      }
    });
  }

  // ── Suppression ─────────────────────────────────────────────────────────────

  remove(photo: Photo5S): void {
    if (!confirm('Supprimer définitivement cette photo ?')) return;
    this.toolService.deleteCinqSPhoto(photo.id).subscribe({
      next: () => {
        const url = this.thumbs.get(photo.id);
        if (url && isPlatformBrowser(this.platformId)) URL.revokeObjectURL(url);
        this.thumbs.delete(photo.id);
        this.photos = this.photos.filter(p => p.id !== photo.id);
        this.closeLightbox();
      },
      error: err => this.show(err?.error?.message ?? 'La suppression a échoué.', 'danger')
    });
  }

  // ── Agrandissement ──────────────────────────────────────────────────────────

  openLightbox(index: number): void {
    this.lightboxIndex = index;
    this.loadLightbox();
  }

  closeLightbox(): void {
    if (this.lightboxUrl && isPlatformBrowser(this.platformId)) URL.revokeObjectURL(this.lightboxUrl);
    this.lightboxUrl = null;
    this.lightboxIndex = null;
  }

  move(step: number): void {
    if (this.lightboxIndex === null || !this.photos.length) return;
    this.lightboxIndex = (this.lightboxIndex + step + this.photos.length) % this.photos.length;
    this.loadLightbox();
  }

  get current(): Photo5S | null {
    return this.lightboxIndex === null ? null : this.photos[this.lightboxIndex] ?? null;
  }

  private loadLightbox(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.lightboxUrl) URL.revokeObjectURL(this.lightboxUrl);
    this.lightboxUrl = null;
    const photo = this.current;
    if (!photo) return;
    this.toolService.cinqSPhotoBlob(photo.id, 'full').subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        if (this.current?.id === photo.id) this.lightboxUrl = url; else URL.revokeObjectURL(url);
      },
      error: () => this.show("Impossible d'afficher la photo.", 'danger')
    });
  }

  @HostListener('document:keydown', ['$event'])
  onKey(event: KeyboardEvent): void {
    if (this.lightboxIndex === null) return;
    if (event.key === 'Escape') this.closeLightbox();
    if (event.key === 'ArrowRight') this.move(1);
    if (event.key === 'ArrowLeft') this.move(-1);
  }

  private show(text: string, type: 'success' | 'danger'): void {
    this.message = text;
    this.messageType = type;
  }
}
