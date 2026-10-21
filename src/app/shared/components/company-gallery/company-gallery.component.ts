import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GalleryService } from '../../gallery.service';
import {
  CompanyImage, IMAGE_CATEGORIES, IMAGE_STAGES, ImageCategory, ImageStage
} from '../../../core/model/company-image';

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_FILES = 8;
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

@Component({
  selector: 'app-company-gallery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './company-gallery.component.html',
  styleUrl: './company-gallery.component.scss'
})
export class CompanyGalleryComponent implements OnChanges, OnDestroy {

  @Input({ required: true }) companyId!: number;

  readonly categories = IMAGE_CATEGORIES;
  readonly stages = IMAGE_STAGES;

  images: CompanyImage[] = [];
  canWrite = false;
  canDelete = false;
  isLoading = true;
  loadError = false;

  // Filtres
  filterCategory: ImageCategory | '' = '';
  filterStage: ImageStage | '' = '';

  // Formulaire d'ajout
  files: File[] = [];
  category: ImageCategory = 'entreprise';
  stage: ImageStage = 'initiale';
  legend = '';
  isUploading = false;
  message = '';
  messageType: 'success' | 'danger' = 'success';

  // URLs blob des miniatures / image agrandie
  thumbs = new Map<number, string>();
  lightboxIndex: number | null = null;
  lightboxUrl: string | null = null;

  constructor(private gallery: GalleryService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['companyId']) this.load();
  }

  ngOnDestroy(): void {
    this.releaseUrls();
  }

  get filtered(): CompanyImage[] {
    return this.images.filter(i =>
      (!this.filterCategory || i.category === this.filterCategory) &&
      (!this.filterStage || i.stage === this.filterStage));
  }

  categoryLabel(value: string): string {
    return this.categories.find(c => c.value === value)?.label ?? value;
  }

  stageLabel(value: string): string {
    return this.stages.find(s => s.value === value)?.label ?? value;
  }

  countByCategory(value: ImageCategory): number {
    return this.images.filter(i => i.category === value).length;
  }

  // ── Chargement ──────────────────────────────────────────────────────────────

  private load(): void {
    this.isLoading = true;
    this.loadError = false;
    this.gallery.list(this.companyId).subscribe({
      next: data => {
        this.images = data.images;
        this.canWrite = data.canWrite;
        this.canDelete = data.canDelete;
        this.isLoading = false;
        this.loadThumbs();
      },
      error: () => {
        this.isLoading = false;
        this.loadError = true;
      }
    });
  }

  private loadThumbs(): void {
    this.images
      .filter(i => !this.thumbs.has(i.id))
      .forEach(i => this.gallery.imageUrl(i.id, 'thumb').subscribe({
        next: url => this.thumbs.set(i.id, url),
        error: () => { /* miniature indisponible : le cadre reste vide */ }
      }));
  }

  private releaseUrls(): void {
    this.thumbs.forEach(url => URL.revokeObjectURL(url));
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
      this.showMessage(`Maximum ${MAX_FILES} images par envoi.`, 'danger');
      return;
    }
    const invalid = selected.find(f => !TYPES.includes(f.type) || f.size > MAX_BYTES);
    if (invalid) {
      this.showMessage(`« ${invalid.name} » n'est pas valide (JPG, PNG ou WEBP, 10 Mo maximum).`, 'danger');
      return;
    }
    this.message = '';
    this.files = selected;
  }

  clearFiles(): void {
    this.files = [];
  }

  upload(): void {
    if (!this.files.length || this.isUploading) return;
    this.isUploading = true;
    this.gallery.upload(this.companyId, this.files, {
      category: this.category, stage: this.stage, legend: this.legend.trim()
    }).subscribe({
      next: ({ added }) => {
        this.isUploading = false;
        this.files = [];
        this.legend = '';
        this.showMessage(added > 1 ? `${added} images ajoutées.` : 'Image ajoutée.', 'success');
        this.load();
      },
      error: err => {
        this.isUploading = false;
        this.showMessage(err.error?.message ?? 'Une erreur est survenue. Veuillez réessayer.', 'danger');
      }
    });
  }

  // ── Suppression ─────────────────────────────────────────────────────────────

  remove(image: CompanyImage): void {
    if (!confirm('Supprimer définitivement cette image ?')) return;
    this.gallery.remove(image.id).subscribe({
      next: () => {
        const url = this.thumbs.get(image.id);
        if (url) URL.revokeObjectURL(url);
        this.thumbs.delete(image.id);
        this.images = this.images.filter(i => i.id !== image.id);
        this.closeLightbox();
      },
      error: err => this.showMessage(err.error?.message ?? 'La suppression a échoué.', 'danger')
    });
  }

  // ── Agrandissement ──────────────────────────────────────────────────────────

  openLightbox(index: number): void {
    this.lightboxIndex = index;
    this.loadLightbox();
  }

  closeLightbox(): void {
    if (this.lightboxUrl) URL.revokeObjectURL(this.lightboxUrl);
    this.lightboxUrl = null;
    this.lightboxIndex = null;
  }

  move(step: number): void {
    const list = this.filtered;
    if (this.lightboxIndex === null || !list.length) return;
    this.lightboxIndex = (this.lightboxIndex + step + list.length) % list.length;
    this.loadLightbox();
  }

  get current(): CompanyImage | null {
    return this.lightboxIndex === null ? null : this.filtered[this.lightboxIndex] ?? null;
  }

  private loadLightbox(): void {
    if (this.lightboxUrl) URL.revokeObjectURL(this.lightboxUrl);
    this.lightboxUrl = null;
    const image = this.current;
    if (!image) return;
    this.gallery.imageUrl(image.id, 'full').subscribe({
      next: url => {
        if (this.current?.id === image.id) {
          this.lightboxUrl = url;
        } else {
          URL.revokeObjectURL(url);
        }
      },
      error: () => this.showMessage("Impossible d'afficher l'image.", 'danger')
    });
  }

  @HostListener('document:keydown', ['$event'])
  onKey(event: KeyboardEvent): void {
    if (this.lightboxIndex === null) return;
    if (event.key === 'Escape') this.closeLightbox();
    if (event.key === 'ArrowRight') this.move(1);
    if (event.key === 'ArrowLeft') this.move(-1);
  }

  private showMessage(text: string, type: 'success' | 'danger'): void {
    this.message = text;
    this.messageType = type;
  }
}
