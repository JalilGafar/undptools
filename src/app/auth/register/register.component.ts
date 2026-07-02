import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../_services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

const CHARSET = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  form: any = {
    username: null,
    email: null,
    password: null,
    roles: 'consultant'
  };
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';
  showPassword = false;

  // conservé après soumission pour le PDF
  private savedUsername = '';
  private savedPassword = '';
  private savedRole = '';

  constructor(
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  generatePassword(): void {
    const length = 12;
    let pwd = '';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    array.forEach(b => (pwd += CHARSET[b % CHARSET.length]));
    this.form.password = pwd;
    this.showPassword = true;
  }

  onSubmit(): void {
    const { username, email, password, roles } = this.form;
    const rolesArray: string[] = Array.isArray(roles) ? roles : [roles];

    // sauvegarde avant que le form soit réinitialisé
    this.savedUsername = username;
    this.savedPassword = password;
    this.savedRole     = rolesArray[0];

    this.authService.register(username, email, password, rolesArray).subscribe({
      next: () => {
        this.isSuccessful = true;
        this.isSignUpFailed = false;
        this.downloadCredentialsPDF();
      },
      error: err => {
        this.errorMessage = err.error.message;
        this.isSignUpFailed = true;
      }
    });
  }

  private async downloadCredentialsPDF(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    const blue   = [26, 86, 219]  as [number, number, number];
    const dark   = [30, 41, 59]   as [number, number, number];
    const muted  = [107, 114, 128] as [number, number, number];
    const white  = [255, 255, 255] as [number, number, number];
    const light  = [248, 250, 252] as [number, number, number];
    const border = [229, 231, 235] as [number, number, number];

    const W = 210;

    // ── Bandeau supérieur ──────────────────────────────────────────────
    doc.setFillColor(...blue);
    doc.rect(0, 0, W, 38, 'F');

    doc.setTextColor(...white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('SDP-GYB — UNDP Cameroon', 14, 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Fiche d\'accès à la plateforme', 14, 25);

    doc.setFontSize(9);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}`, 14, 33);

    // ── Titre section ──────────────────────────────────────────────────
    doc.setTextColor(...dark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Identifiants de connexion', 14, 56);

    doc.setDrawColor(...border);
    doc.setLineWidth(0.4);
    doc.line(14, 59, W - 14, 59);

    // ── Bloc identifiants ──────────────────────────────────────────────
    const drawField = (label: string, value: string, y: number) => {
      doc.setFillColor(...light);
      doc.setDrawColor(...border);
      doc.roundedRect(14, y, W - 28, 18, 2, 2, 'FD');

      doc.setTextColor(...muted);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(label.toUpperCase(), 20, y + 6);

      doc.setTextColor(...dark);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(value, 20, y + 14);
    };

    drawField('Nom d\'utilisateur', this.savedUsername, 65);
    drawField('Mot de passe',       this.savedPassword, 90);
    drawField('Rôle attribué',      this.capitalizeRole(this.savedRole), 115);

    // ── Encart avertissement ───────────────────────────────────────────
    doc.setFillColor(255, 247, 237);
    doc.setDrawColor(251, 146, 60);
    doc.roundedRect(14, 143, W - 28, 26, 2, 2, 'FD');

    doc.setTextColor(154, 52, 18);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('⚠  Informations confidentielles', 20, 153);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(
      'Ce document contient des informations sensibles. Conservez-le en lieu sûr\n' +
      'et ne le partagez pas.',
      20, 160,
      { maxWidth: W - 40 }
    );

    // ── Pied de page ───────────────────────────────────────────────────
    doc.setFillColor(...blue);
    doc.rect(0, 280, W, 17, 'F');
    doc.setTextColor(...white);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Plateforme GYB — PNUD Cameroun', 14, 290);
    doc.text('Document généré automatiquement', W - 14, 290, { align: 'right' });

    doc.save(`acces_${this.savedUsername}.pdf`);
  }

  private capitalizeRole(role: string): string {
    const map: Record<string, string> = {
      consultant: 'Consultant',
      moderator:  'Modérateur',
      admin:      'Administrateur',
      entreprise: 'Entreprise',
    };
    return map[role] ?? role;
  }
}

