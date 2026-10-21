import { Component, OnDestroy, OnInit } from '@angular/core';
import { StorageService } from '../../_services/storage.service';
import { AuthService } from '../../_services/auth.service';
import { AvatarPipe, DEFAULT_AVATAR } from '../../core/company-logo.pipe';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [AvatarPipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, OnDestroy {

  currentUser: any;

  private readonly PHOTO_MAX_BYTES = 10 * 1024 * 1024;
  private readonly PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  photoPreview: string | null = null;
  photoFile: File | null = null;
  isUploading = false;
  photoMessage = '';
  photoMessageType: 'success' | 'danger' = 'success';

  constructor(
    private storageService: StorageService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.storageService.getUser();

    setTimeout(() => {
      this.storageService.setVisibleToolsFalse();
    });
  }

  ngOnDestroy(): void {
    this.cancelPhoto();
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (!this.PHOTO_TYPES.includes(file.type)) {
      this.showMessage('Format non supporté (JPG, PNG ou WEBP).', 'danger');
      return;
    }
    if (file.size > this.PHOTO_MAX_BYTES) {
      this.showMessage('Image trop volumineuse (10 Mo maximum).', 'danger');
      return;
    }
    this.cancelPhoto();
    this.photoFile = file;
    this.photoPreview = URL.createObjectURL(file);
  }

  cancelPhoto(): void {
    if (this.photoPreview) URL.revokeObjectURL(this.photoPreview);
    this.photoPreview = null;
    this.photoFile = null;
  }

  savePhoto(): void {
    if (!this.photoFile) return;
    this.isUploading = true;
    this.authService.uploadPhoto(this.photoFile).subscribe({
      next: ({ photo }) => {
        this.currentUser = { ...this.currentUser, photo };
        this.storageService.saveUser(this.currentUser);
        this.cancelPhoto();
        this.isUploading = false;
        this.showMessage('Votre photo de profil a été mise à jour.', 'success');
      },
      error: err => {
        this.isUploading = false;
        this.showMessage(err.error?.message ?? 'Une erreur est survenue. Veuillez réessayer.', 'danger');
      }
    });
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.onerror = null;
    img.src = DEFAULT_AVATAR;
  }

  private showMessage(message: string, type: 'success' | 'danger'): void {
    this.photoMessage = message;
    this.photoMessageType = type;
  }

  goBack(): void {
    history.back();
  }
}
