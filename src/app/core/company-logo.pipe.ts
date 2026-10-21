import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../environment/environment';

export const DEFAULT_COMPANY_LOGO = 'assets/images/company.jpg';
export const DEFAULT_AVATAR = 'assets/images/user.png';

/** Fichiers téléversés ("uploads/…") servis par l'API ; image par défaut si absent. */
function uploadUrl(ref: string | null | undefined, fallback: string): string {
  return ref ? `${environment.apiUrl}/${ref}` : fallback;
}

@Pipe({ name: 'companyLogo', standalone: true })
export class CompanyLogoPipe implements PipeTransform {
  transform(logo: string | null | undefined): string {
    return uploadUrl(logo, DEFAULT_COMPANY_LOGO);
  }
}

@Pipe({ name: 'avatar', standalone: true })
export class AvatarPipe implements PipeTransform {
  transform(photo: string | null | undefined): string {
    return uploadUrl(photo, DEFAULT_AVATAR);
  }
}
