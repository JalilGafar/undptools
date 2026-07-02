import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ToolAttrib } from '../../../../core/model/toolAttrib';
import { PrediaLabel } from '../../../../core/model/predia_mat_label';

export interface PdfScores {
  crit_1: number;
  crit_2: number;
  crit_3: number;
  crit_4: number;
  crit_5: number;
  eval_total: number;
}

/** Nom du critère → numéros d'attributs (fallback si labels vide) */
const FALLBACK_GROUPS: { label: string; indices: number[] }[] = [
  { label: 'Ressources Op.', indices: [1, 2, 3, 4] },
  { label: 'Compétences Tec.', indices: [5, 6] },
  { label: 'Potentiel Ent.', indices: [7, 8, 9] },
  { label: 'Marketing', indices: [10, 11, 12] },
  { label: 'Stratégie PNUD', indices: [13, 14, 15, 16, 17, 18, 19] },
];

const GENERAL_FIELDS: { key: keyof ToolAttrib; label: string }[] = [
  { key: 'gen_nom_prenom', label: 'Nom & Prénom du Gérant' },
  { key: 'gen_sexe', label: 'Sexe' },
  { key: 'gen_age', label: 'Âge' },
  { key: 'gen_telephone', label: 'Téléphone' },
  { key: 'gen_email', label: 'Email' },
  { key: 'gen_adresse', label: 'Adresse' },
  { key: 'gen_ville', label: 'Ville' },
  { key: 'gen_nom_entreprise', label: 'Nom Entreprise' },
  { key: 'gen_type_entreprise', label: 'Type Entreprise' },
  { key: 'gen_activite_principale', label: 'Activité Principale' },
  { key: 'gen_activite_autre', label: 'Autre Activité' },
  { key: 'gen_ventes_mensuelles', label: 'Ventes Mensuelles' },
  { key: 'gen_role_entreprise', label: 'Rôle dans Entreprise' },
  { key: 'gen_situation_entreprise', label: 'Situation Entreprise' },
  { key: 'gen_formation_interesse' as keyof ToolAttrib, label: 'Intéressé par une formation' },
];

@Injectable({ providedIn: 'root' })
export class AttribPdfService {
  private readonly ML = 15; // margin left mm

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  async generate(data: ToolAttrib, labels: PrediaLabel[], scores: PdfScores): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const { jsPDF } = await import('jspdf');

    const today = new Date();
    const dateStr = today.toLocaleDateString('fr-FR');
    const companyName = data.gen_nom_entreprise ?? '';
    const filename = this.buildFilename(companyName, dateStr);

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const title = `MATRICE DE PRÉ-DIAGNOSTIC DE L'ENTREPRISE ${companyName.toUpperCase()}`;

    // Load logos
    let pnudBase64 = '';
    let gybBase64 = '';
    try {
      pnudBase64 = await this.loadImageAsBase64('/assets/images/pnud.png');
      gybBase64 = await this.loadImageAsBase64('/assets/images/gyb.png');
    } catch {
      // logos not critical — continue without them
    }

    const addHeader = (pageDoc: typeof doc): number => {
      if (pnudBase64) pageDoc.addImage(pnudBase64, 'PNG', 15, 4, 20, 20);
      if (gybBase64) pageDoc.addImage(gybBase64, 'PNG', 37, 4, 20, 20);

      // Title
      pageDoc.setFont('helvetica', 'bold');
      pageDoc.setFontSize(9);
      pageDoc.setTextColor(0, 0, 0);
      const titleLines = pageDoc.splitTextToSize(title, 132);
      pageDoc.text(titleLines, pageWidth / 2, 10, { align: 'center', maxWidth: 132 });

      // Date top right
      pageDoc.setFont('helvetica', 'normal');
      pageDoc.setFontSize(8);
      pageDoc.text(dateStr, pageWidth - this.ML, 8, { align: 'right' });

      // Blue separator line
      pageDoc.setDrawColor(0, 114, 188);
      pageDoc.setLineWidth(0.5);
      pageDoc.line(this.ML, 27, pageWidth - this.ML, 27);

      return 33; // y cursor after header
    };

    let y = addHeader(doc);

    // ────────────────────────────────────────────────
    // Section 1 — Informations générales
    // ────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 114, 188);
    doc.text('1. Informations générales', this.ML, y);
    y += 6;

    const filteredFields = GENERAL_FIELDS.filter(f => {
      const val = (data as unknown as Record<string, unknown>)[f.key as string];
      return val !== null && val !== undefined && String(val).trim() !== '';
    });

    filteredFields.forEach((field, index) => {
      const val = String((data as unknown as Record<string, unknown>)[field.key as string]);
      if (index % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(this.ML, y - 5, pageWidth - 2 * this.ML, 7, 'F');
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text(field.label, this.ML, y);

      doc.setFont('helvetica', 'normal');
      doc.text(val, this.ML + 62, y, { maxWidth: 117 });
      y += 7;
    });

    y += 4;

    // ────────────────────────────────────────────────
    // Section 2 — Scores pondérés
    // ────────────────────────────────────────────────
    if (y > 220) { doc.addPage(); y = addHeader(doc); }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 114, 188);
    doc.text('2. Scores pondérés par critère', this.ML, y);
    y += 7;

    const critLabels = [
      'Ressources opérationnelles',
      'Compétences techniques',
      "Potentiel de l'entreprise",
      'Marketing',
      'Stratégie du PNUD',
    ];
    const critValues = [scores.crit_1 / 10, scores.crit_2 / 10, scores.crit_3 / 10, scores.crit_4 / 10, scores.crit_5 / 10];
    const barX = 83;
    const barWidth = 90;
    const barHeight = 5;

    critValues.forEach((val, i) => {
      const clampedVal = Math.max(0, Math.min(10, val));
      const fillWidth = (clampedVal / 10) * barWidth;
      const [r, g, b] = this.getColor(clampedVal);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text(critLabels[i], this.ML, y);

      // Grey background bar
      doc.setFillColor(220, 220, 220);
      doc.rect(barX, y - 4, barWidth, barHeight, 'F');

      // Colored fill
      doc.setFillColor(r, g, b);
      doc.rect(barX, y - 4, fillWidth, barHeight, 'F');

      // Value text
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(`${val.toFixed(1)} / 10`, barX + barWidth + 2, y);

      y += 9;
    });

    // Score total rectangle
    y += 2;
    const [tr, tg, tb] = this.getColor(scores.eval_total);
    doc.setFillColor(tr, tg, tb);
    doc.rect(this.ML, y, pageWidth - 2 * this.ML, 12, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text(
      `Score Total Pondéré : ${scores.eval_total.toFixed(1)} / 10`,
      pageWidth / 2,
      y + 8,
      { align: 'center' }
    );
    y += 18;

    // ────────────────────────────────────────────────
    // Section 3 — Évaluation détaillée (jsPDF natif)
    // ────────────────────────────────────────────────
    doc.addPage();
    y = addHeader(doc);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 114, 188);
    doc.text('3. Évaluation détaillée des 19 attributs', this.ML, y);
    doc.setTextColor(0, 0, 0);
    y += 9;

    const raw3 = data as unknown as Record<string, unknown>;
    const CW   = 210 - 2 * this.ML;
    const PH   = 297;
    const FH   = 18; // réserve footer

    // Construction des groupes par critère
    type G3 = { critere: string; rows: PrediaLabel[] };
    const groups3: G3[] = [];
    if (labels?.length) {
      const gmap = new Map<string, G3>();
      [...labels].sort((a, b) => a.reper - b.reper).forEach(lbl => {
        if (!gmap.has(lbl.critere)) {
          const g: G3 = { critere: lbl.critere, rows: [] };
          gmap.set(lbl.critere, g);
          groups3.push(g);
        }
        gmap.get(lbl.critere)!.rows.push(lbl);
      });
    } else {
      FALLBACK_GROUPS.forEach(fg => {
        groups3.push({
          critere: fg.label,
          rows: fg.indices.map(i => ({
            reper: i, critere: fg.label,
            attribut: `Attribut ${i}`, question: '', children: [],
          } as PrediaLabel)),
        });
      });
    }

    let critNum = 0;
    for (const group of groups3) {
      critNum++;
      const notes3 = group.rows.map(r => {
        const n = Number(raw3[`note_${r.reper}`] ?? 0);
        return isNaN(n) ? 0 : n;
      });
      const avg3 = notes3.reduce((s, v) => s + v, 0) / (notes3.length || 1);

      // Saut de page avant l'en-tête critère
      if (y + 14 > PH - FH) { doc.addPage(); y = addHeader(doc); }

      // Bandeau bleu critère
      doc.setFillColor(0, 114, 188);
      doc.rect(this.ML, y, CW, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text(`Critere ${critNum} : ${group.critere}`, this.ML + 2, y + 5);
      const [cr, cg, cb] = this.getColor(avg3);
      doc.setTextColor(cr, cg, cb);
      doc.text(`Note globale : ${avg3.toFixed(1)} / 10`, this.ML + CW - 2, y + 5, { align: 'right' });
      y += 9;

      for (let ri = 0; ri < group.rows.length; ri++) {
        const lbl    = group.rows[ri];
        const note   = notes3[ri];
        const selLabel = this.getSelectedLabel(lbl, note) || '-';
        const comment  = String(raw3[`comment_${lbl.reper}`] ?? '').trim() || '-';

        // Calcul de la hauteur nécessaire (police 7pt déjà réglée)
        const question = String(lbl.question ?? '').trim();
        doc.setFontSize(7);
        const questionLines = doc.splitTextToSize(`Question : ${question}`, CW - 8) as string[];
        const reponseLines  = doc.splitTextToSize(`Reponse : ${selLabel}`, CW - 8) as string[];
        const commentLines  = doc.splitTextToSize(`Commentaire : ${comment}`, CW - 8) as string[];
        const rowH = 5.5 + questionLines.length * 4 + reponseLines.length * 4 + commentLines.length * 4 + 1.5;

        if (y + rowH > PH - FH) { doc.addPage(); y = addHeader(doc); }

        // Fond alterné
        if (ri % 2 === 0) {
          doc.setFillColor(248, 249, 250);
          doc.rect(this.ML, y, CW, rowH, 'F');
        }

        // Nom de l'attribut (bold 8pt)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(30, 30, 30);
        doc.text(`- ${lbl.attribut}`, this.ML + 3, y + 4.5);

        // Note colorée (right)
        const [nr, ng, nb] = this.getColor(note);
        doc.setTextColor(nr, ng, nb);
        doc.text(`${note} / 10`, this.ML + CW - 2, y + 4.5, { align: 'right' });

        let lineY = y + 4.5 + 4.5;

        // Question (italic 7pt gris foncé)
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7);
        doc.setTextColor(60, 60, 60);
        doc.text(questionLines, this.ML + 5, lineY);
        lineY += questionLines.length * 4;

        // Réponse (italic 7pt gris clair)
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7);
        doc.setTextColor(90, 90, 90);
        doc.text(reponseLines, this.ML + 5, lineY);
        lineY += reponseLines.length * 4;

        // Commentaire (normal 7pt)
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(50, 50, 50);
        doc.text(commentLines, this.ML + 5, lineY);

        // Séparateur léger
        doc.setDrawColor(210, 210, 210);
        doc.setLineWidth(0.2);
        doc.line(this.ML, y + rowH - 0.5, this.ML + CW, y + rowH - 0.5);

        y += rowH;
      }
      y += 4;
    }

    // ────────────────────────────────────────────────
    // Footer — all pages
    // ────────────────────────────────────────────────
    const internalAny = doc.internal as unknown as Record<string, unknown>;
    const totalPages: number = typeof internalAny['getNumberOfPages'] === 'function'
      ? (internalAny['getNumberOfPages'] as () => number)()
      : 1;

    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      const footerY = doc.internal.pageSize.getHeight() - 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(128, 128, 128);

      doc.text('SDP-GYB-CMR — UNDP', this.ML, footerY);
      doc.text(`Page ${p} / ${totalPages}`, pageWidth / 2, footerY, { align: 'center' });
      doc.text(dateStr, pageWidth - this.ML, footerY, { align: 'right' });
    }

    doc.save(filename);
  }

  private getColor(value: number): [number, number, number] {
    if (value <= 2) return [220, 53, 69];
    if (value <= 7) return [253, 126, 20];
    return [40, 167, 69];
  }

  private buildFilename(companyName: string, date: string): string {
    const sanitizedName = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'entreprise';

    const sanitizedDate = date.replace(/\//g, '-');
    return `rapport-prediagnostic-${sanitizedName}-${sanitizedDate}.pdf`;
  }

  private readonly NOTE_SCALE = [0, 5, 7, 10];

  private nearestScale(note: number): number {
    return this.NOTE_SCALE.reduce((prev, curr) =>
      Math.abs(curr - note) < Math.abs(prev - note) ? curr : prev
    );
  }

  private getSelectedLabel(lbl: PrediaLabel, rawNote: number): string {
    const scaled = this.nearestScale(rawNote);
    const child = lbl.children?.find(c => +c.plage === scaled);
    return child?.label ?? '';
  }

  private loadImageAsBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fetch(url)
        .then(res => {
          if (!res.ok) reject(new Error(`HTTP ${res.status}`));
          return res.blob();
        })
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
        .catch(reject);
    });
  }
}
