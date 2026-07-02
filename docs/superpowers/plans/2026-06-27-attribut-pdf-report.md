# Rapport PDF Matrice Pré-diagnostic — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter un service `AttribPdfService` et un bouton "Télécharger le rapport PDF" dans `AttributComponent` permettant de générer et télécharger un rapport PDF complet de la matrice pré-diagnostic (en-tête UNDP/GYB, informations générales, scores pondérés avec barres colorées, tableau des 19 attributs).

**Architecture:** `AttribPdfService` (injectable `root`) encapsule toute la logique jsPDF avec import dynamique (`await import('jspdf')`) pour la compatibilité SSR. `AttributComponent` injecte ce service et expose `downloadPdf()` qui passe les données déjà en mémoire (`matAttribData[0]`, `matPrediaLabel`, scores calculés). Le bouton n'est rendu que quand `data.length > 0`.

**Tech Stack:** Angular 20 standalone, jsPDF v4.2.1 (déjà installé), TypeScript 5.9.2 strict

## Global Constraints

- Composant standalone : tout import Angular déclaré explicitement dans `imports[]`
- SSR-safe : `isPlatformBrowser` guard + import dynamique jsPDF
- Aucune nouvelle dépendance npm
- TypeScript strict : pas de `any` implicite — utiliser `(data as Record<string, unknown>)` pour les accès dynamiques
- Logos : `/assets/images/pnud.png` et `/assets/images/gyb.png` (disponibles)
- Seuils de couleur : rouge `#dc3545` pour [0–2], orange `#fd7e14` pour [3–7], vert `#28a745` pour [8–10] (valeur sur base /10)
- Titre PDF : `MATRICE DE PRÉ-DIAGNOSTIC DE L'ENTREPRISE {NOM_ENTREPRISE_EN_MAJUSCULES}` ou titre générique si non renseigné
- Nom de fichier : `rapport-prediagnostic-{nom-entreprise-sanitisé}-{JJ-MM-AAAA}.pdf`

---

## Fichiers touchés

| Action | Fichier |
|---|---|
| Créer | `undptools/src/app/consultant/components/tools/attribut/attrib-pdf.service.ts` |
| Créer | `undptools/src/app/consultant/components/tools/attribut/attrib-pdf.service.spec.ts` |
| Modifier | `undptools/src/app/consultant/components/tools/attribut/attribut.component.ts` |
| Modifier | `undptools/src/app/consultant/components/tools/attribut/attribut.component.html` |

---

### Task 1 : Créer `AttribPdfService`

**Files:**
- Create: `undptools/src/app/consultant/components/tools/attribut/attrib-pdf.service.ts`
- Test: `undptools/src/app/consultant/components/tools/attribut/attrib-pdf.service.spec.ts`

**Interfaces:**
- Consumes: `ToolAttrib` (`src/app/core/model/toolAttrib.ts`), `PrediaLabel` (`src/app/core/model/predia_mat_label.ts`)
- Produces: classe `AttribPdfService` + interface exportée `PdfScores` avec méthode publique `generate(data: ToolAttrib, labels: PrediaLabel[], scores: PdfScores): Promise<void>`

- [ ] **Step 1 : Écrire les tests des helpers purs**

Créer `undptools/src/app/consultant/components/tools/attribut/attrib-pdf.service.spec.ts` :

```typescript
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { AttribPdfService } from './attrib-pdf.service';

describe('AttribPdfService', () => {
  let service: AttribPdfService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }]
    });
    service = TestBed.inject(AttribPdfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getColor', () => {
    it('returns red for 0', () => {
      expect((service as any).getColor(0)).toEqual([220, 53, 69]);
    });
    it('returns red for 2', () => {
      expect((service as any).getColor(2)).toEqual([220, 53, 69]);
    });
    it('returns orange for 3', () => {
      expect((service as any).getColor(3)).toEqual([253, 126, 20]);
    });
    it('returns orange for 7', () => {
      expect((service as any).getColor(7)).toEqual([253, 126, 20]);
    });
    it('returns green for 8', () => {
      expect((service as any).getColor(8)).toEqual([40, 167, 69]);
    });
    it('returns green for 10', () => {
      expect((service as any).getColor(10)).toEqual([40, 167, 69]);
    });
  });

  describe('buildFilename', () => {
    it('sanitizes company name and formats date', () => {
      expect((service as any).buildFilename('ACME SARL', '27/06/2026'))
        .toBe('rapport-prediagnostic-acme-sarl-27-06-2026.pdf');
    });
    it('uses "entreprise" when name is empty', () => {
      expect((service as any).buildFilename('', '27/06/2026'))
        .toBe('rapport-prediagnostic-entreprise-27-06-2026.pdf');
    });
    it('collapses multiple separators', () => {
      expect((service as any).buildFilename('ACME & Co.', '01/01/2026'))
        .toBe('rapport-prediagnostic-acme-co-01-01-2026.pdf');
    });
  });

  it('generate returns immediately when platform is server', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }]
    });
    const serverService = TestBed.inject(AttribPdfService);
    await expectAsync(serverService.generate(
      {} as any,
      [],
      { crit_1: 0, crit_2: 0, crit_3: 0, crit_4: 0, crit_5: 0, eval_total: 0 }
    )).toBeResolved();
  });
});
```

- [ ] **Step 2 : Vérifier que les tests échouent**

```bash
cd undptools && ng test --include='**/attribut/attrib-pdf.service.spec.ts' --watch=false
```

Attendu : `Cannot find module './attrib-pdf.service'`

- [ ] **Step 3 : Créer le service**

Créer `undptools/src/app/consultant/components/tools/attribut/attrib-pdf.service.ts` :

```typescript
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

@Injectable({ providedIn: 'root' })
export class AttribPdfService {

  private readonly ML = 15;   // margin left mm
  private readonly MR = 15;   // margin right mm
  private readonly PW = 210;  // A4 width mm
  private readonly PH = 297;  // A4 height mm
  private readonly CW = 180;  // content width mm

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  async generate(data: ToolAttrib, labels: PrediaLabel[], scores: PdfScores): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const today = new Date().toLocaleDateString('fr-FR');
    const companyName = data.gen_nom_entreprise || '';

    const [pnudImg, gybImg] = await Promise.all([
      this.loadImageAsBase64('/assets/images/pnud.png'),
      this.loadImageAsBase64('/assets/images/gyb.png'),
    ]);

    // ── Helpers ─────────────────────────────────────────────────────────
    const addHeader = (): number => {
      doc.addImage(pnudImg, 'PNG', this.ML, 4, 20, 20);
      doc.addImage(gybImg,  'PNG', this.ML + 22, 4, 20, 20);

      const title = companyName
        ? `MATRICE DE PRÉ-DIAGNOSTIC DE L'ENTREPRISE ${companyName.toUpperCase()}`
        : "MATRICE DE PRÉ-DIAGNOSTIC POUR LA SÉLECTION DES ENTREPRISES";

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text(title, this.PW / 2, 14, { align: 'center', maxWidth: this.CW - 48 });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(today, this.PW - this.MR, 9, { align: 'right' });

      doc.setDrawColor(0, 114, 188);
      doc.setLineWidth(0.5);
      doc.line(this.ML, 27, this.PW - this.MR, 27);
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.2);

      return 33; // y cursor after header
    };

    const checkPage = (y: number, needed = 15): number => {
      if (y + needed > this.PH - 20) {
        doc.addPage();
        return addHeader();
      }
      return y;
    };

    const sectionTitle = (text: string, y: number): number => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(0, 114, 188);
      doc.text(text, this.ML, y);
      doc.setTextColor(0, 0, 0);
      return y + 6;
    };

    // ── Page 1 ──────────────────────────────────────────────────────────
    let y = addHeader();

    // ── SECTION 1 : Informations générales ──────────────────────────────
    y = sectionTitle('1. Informations générales', y);

    const fields: { label: string; value: string }[] = [
      { label: 'Nom et prénom',              value: data.gen_nom_prenom },
      { label: 'Sexe',                        value: data.gen_sexe },
      { label: 'Âge',                         value: data.gen_age ? `${data.gen_age} ans` : '' },
      { label: 'Téléphone',                   value: data.gen_telephone },
      { label: 'Email',                       value: data.gen_email },
      { label: 'Adresse',                     value: data.gen_adresse },
      { label: 'Ville',                       value: data.gen_ville },
      { label: "Nom de l'entreprise",         value: data.gen_nom_entreprise },
      { label: "Type d'entreprise",           value: data.gen_type_entreprise },
      {
        label: 'Activité principale',
        value: data.gen_activite_principale === 'Autre' && data.gen_activite_autre
          ? data.gen_activite_autre
          : data.gen_activite_principale,
      },
      { label: 'Ventes mensuelles',           value: data.gen_ventes_mensuelles },
      { label: "Rôle dans l'entreprise",      value: data.gen_role_entreprise },
      { label: 'Situation entreprise',        value: data.gen_situation_entreprise },
      { label: 'Intéressé par une formation', value: data.gen_formation_interesse },
    ].filter(f => !!f.value);

    fields.forEach((field, i) => {
      y = checkPage(y, 8);
      if (i % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(this.ML - 1, y - 4.5, this.CW + 2, 7, 'F');
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(`${field.label} :`, this.ML, y);
      doc.setFont('helvetica', 'normal');
      doc.text(String(field.value), this.ML + 62, y, { maxWidth: this.CW - 63 });
      y += 7;
    });

    y += 4;

    // ── SECTION 2 : Scores pondérés ─────────────────────────────────────
    y = checkPage(y, 70);
    y = sectionTitle('2. Scores pondérés par critère', y);
    y += 1;

    const criteria = [
      { label: 'Ressources opérationnelles', val: scores.crit_1 / 10 },
      { label: 'Compétences techniques',     val: scores.crit_2 / 10 },
      { label: "Potentiel de l'entreprise",  val: scores.crit_3 / 10 },
      { label: 'Marketing',                  val: scores.crit_4 / 10 },
      { label: 'Stratégie du PNUD',          val: scores.crit_5 / 10 },
    ];

    const barX = this.ML + 68;
    const barW = this.CW - 68 - 22;
    const barH = 5;

    criteria.forEach(c => {
      y = checkPage(y, 11);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text(c.label, this.ML, y);

      // background bar
      doc.setFillColor(220, 220, 220);
      doc.rect(barX, y - 4, barW, barH, 'F');

      // colored fill
      const [r, g, b] = this.getColor(c.val);
      doc.setFillColor(r, g, b);
      const fw = Math.max(0, Math.min(c.val / 10, 1)) * barW;
      if (fw > 0) doc.rect(barX, y - 4, fw, barH, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(`${c.val.toFixed(1)} / 10`, barX + barW + 2, y);
      y += 10;
    });

    // Score total block
    y += 2;
    y = checkPage(y, 14);
    const [tr, tg, tb] = this.getColor(scores.eval_total);
    doc.setFillColor(tr, tg, tb);
    doc.rect(this.ML, y - 5, this.CW, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(
      `Score Total Pondéré : ${scores.eval_total.toFixed(1)} / 10`,
      this.PW / 2, y + 2,
      { align: 'center' }
    );
    doc.setTextColor(0, 0, 0);
    y += 16;

    // ── SECTION 3 : Tableau des 19 attributs ────────────────────────────
    y = checkPage(y, 30);
    y = sectionTitle('3. Évaluation détaillée des 19 attributs', y);
    y += 1;

    // Table header row
    const cw = [43, 43, 14, this.CW - 100]; // critère | attribut | note | commentaire
    doc.setFillColor(0, 114, 188);
    doc.rect(this.ML, y - 5, this.CW, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    let xh = this.ML + 1;
    ['Critère', 'Attribut', 'Note', 'Commentaire'].forEach((h, i) => {
      doc.text(h, xh, y - 0.5);
      xh += cw[i];
    });
    doc.setTextColor(0, 0, 0);
    y += 3;

    // Build groups dynamically from labels
    const groupMap = new Map<string, number[]>();
    labels
      .slice()
      .sort((a, b) => a.reper - b.reper)
      .forEach(l => {
        if (!groupMap.has(l.critere)) groupMap.set(l.critere, []);
        groupMap.get(l.critere)!.push(l.reper);
      });

    // Fallback groups if labels are empty
    if (groupMap.size === 0) {
      groupMap.set('Ressources Opérationnelles', [1, 2, 3, 4]);
      groupMap.set('Compétences Techniques',     [5, 6]);
      groupMap.set("Potentiel de l'Entreprise",  [7, 8, 9]);
      groupMap.set('Marketing',                  [10, 11, 12]);
      groupMap.set('Stratégie du PNUD',          [13, 14, 15, 16, 17, 18, 19]);
    }

    let rowIdx = 0;
    const dataRecord = data as unknown as Record<string, unknown>;

    groupMap.forEach((reperes, critere) => {
      let isFirst = true;
      reperes.forEach(reper => {
        y = checkPage(y, 8);
        const lbl       = labels.find(l => l.reper === reper);
        const note      = (dataRecord[`note_${reper}`] as number) ?? 0;
        const comment   = String(dataRecord[`comment_${reper}`] ?? '');
        const attribut  = lbl?.attribut ?? `Attribut ${reper}`;
        const shortCmt  = comment.length > 55 ? comment.slice(0, 52) + '…' : comment;

        if (rowIdx % 2 === 0) {
          doc.setFillColor(248, 248, 248);
          doc.rect(this.ML, y - 4.5, this.CW, 7, 'F');
        }

        // Critère (première ligne du groupe seulement)
        if (isFirst) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.setTextColor(0, 0, 0);
          doc.text(critere, this.ML + 1, y - 1, { maxWidth: cw[0] - 2 });
          isFirst = false;
        }

        // Attribut
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(0, 0, 0);
        doc.text(attribut, this.ML + cw[0] + 1, y, { maxWidth: cw[1] - 2 });

        // Note colorée
        const [nr, ng, nb] = this.getColor(note);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(nr, ng, nb);
        doc.text(`${note}/10`, this.ML + cw[0] + cw[1] + 1, y);
        doc.setTextColor(0, 0, 0);

        // Commentaire
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text(shortCmt, this.ML + cw[0] + cw[1] + cw[2] + 1, y, { maxWidth: cw[3] - 2 });

        // Row separator
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.1);
        doc.line(this.ML, y + 2.5, this.PW - this.MR, y + 2.5);
        doc.setDrawColor(0, 0, 0);

        y += 7;
        rowIdx++;
      });
    });

    // ── Footers sur toutes les pages ─────────────────────────────────────
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(128, 128, 128);
      doc.text('SDP-GYB-CMR — UNDP', this.ML, this.PH - 8);
      doc.text(`Page ${p} / ${totalPages}`, this.PW / 2, this.PH - 8, { align: 'center' });
      doc.text(today, this.PW - this.MR, this.PH - 8, { align: 'right' });
    }
    doc.setTextColor(0, 0, 0);

    doc.save(this.buildFilename(companyName, today));
  }

  private getColor(value: number): [number, number, number] {
    if (value <= 2) return [220, 53, 69];
    if (value <= 7) return [253, 126, 20];
    return [40, 167, 69];
  }

  private buildFilename(companyName: string, date: string): string {
    const safe = (companyName || 'entreprise')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return `rapport-prediagnostic-${safe}-${date.replace(/\//g, '-')}.pdf`;
  }

  private loadImageAsBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fetch(url)
        .then(r => r.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror   = () => reject(new Error(`FileReader failed: ${url}`));
          reader.readAsDataURL(blob);
        })
        .catch(() => reject(new Error(`Fetch failed: ${url}`)));
    });
  }
}
```

- [ ] **Step 4 : Lancer les tests**

```bash
cd undptools && ng test --include='**/attribut/attrib-pdf.service.spec.ts' --watch=false
```

Attendu : tous les tests passent (les tests `getColor` et `buildFilename` passent ; le test SSR passe car `generate` retourne sans appeler `import`).

- [ ] **Step 5 : Commit**

```bash
git add undptools/src/app/consultant/components/tools/attribut/attrib-pdf.service.ts undptools/src/app/consultant/components/tools/attribut/attrib-pdf.service.spec.ts
git commit -m "feat(attribut): add AttribPdfService — jsPDF report generation"
```

---

### Task 2 : Intégrer `AttribPdfService` dans `AttributComponent`

**Files:**
- Modify: `undptools/src/app/consultant/components/tools/attribut/attribut.component.ts`
- Modify: `undptools/src/app/consultant/components/tools/attribut/attribut.component.html`
- Test: `undptools/src/app/consultant/components/tools/attribut/attribut.component.spec.ts`

**Interfaces:**
- Consumes: `AttribPdfService` + `PdfScores` exportés depuis `./attrib-pdf.service` (définis en Task 1)
- Produces: méthode publique `downloadPdf(): void` dans `AttributComponent` ; bouton dans le template conditionnel sur `data.length > 0`

- [ ] **Step 1 : Écrire le test de `downloadPdf()`**

Créer (ou remplacer le contenu de) `undptools/src/app/consultant/components/tools/attribut/attribut.component.spec.ts` :

```typescript
import { TestBed } from '@angular/core/testing';
import { AttributComponent } from './attribut.component';
import { AttribPdfService } from './attrib-pdf.service';
import { ConsultantService } from '../../../consultant.service';
import { StorageService } from '../../../../_services/storage.service';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { ToolAttrib } from '../../../../core/model/toolAttrib';
import { PrediaLabel } from '../../../../core/model/predia_mat_label';

describe('AttributComponent – downloadPdf', () => {
  let component: AttributComponent;
  let pdfSpy: jasmine.SpyObj<AttribPdfService>;

  beforeEach(async () => {
    pdfSpy = jasmine.createSpyObj<AttribPdfService>('AttribPdfService', ['generate']);
    pdfSpy.generate.and.returnValue(Promise.resolve());

    await TestBed.configureTestingModule({
      imports: [AttributComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        ConsultantService,
        StorageService,
        { provide: AttribPdfService, useValue: pdfSpy },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AttributComponent);
    component = fixture.componentInstance;
  });

  it('calls pdfService.generate with first item and current scores', () => {
    const mockData = { gen_nom_entreprise: 'Test SARL' } as ToolAttrib;
    component.matAttribData  = [mockData];
    component.matPrediaLabel = [] as PrediaLabel[];
    component.crit_1     = 50;
    component.crit_2     = 70;
    component.crit_3     = 60;
    component.crit_4     = 80;
    component.crit_5     = 40;
    component.eval_total = 6.5;

    component.downloadPdf();

    expect(pdfSpy.generate).toHaveBeenCalledOnceWith(
      mockData,
      [],
      { crit_1: 50, crit_2: 70, crit_3: 60, crit_4: 80, crit_5: 40, eval_total: 6.5 }
    );
  });

  it('does nothing when matAttribData is empty', () => {
    component.matAttribData = [];
    component.downloadPdf();
    expect(pdfSpy.generate).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2 : Vérifier que le test échoue**

```bash
cd undptools && ng test --include='**/attribut/attribut.component.spec.ts' --watch=false
```

Attendu : erreur `component.downloadPdf is not a function`

- [ ] **Step 3 : Modifier `attribut.component.ts`**

En haut du fichier, après la ligne `import { Router } from '@angular/router';`, ajouter :

```typescript
import { AttribPdfService, PdfScores } from './attrib-pdf.service';
```

Remplacer le constructeur existant :

```typescript
constructor(
  private formBuilder: FormBuilder,
  private toolService: ConsultantService,
  private storageService: StorageService,
  private appRout: Router
) {
  Object.assign(this.single)
}
```

par :

```typescript
constructor(
  private formBuilder: FormBuilder,
  private toolService: ConsultantService,
  private storageService: StorageService,
  private appRout: Router,
  private pdfService: AttribPdfService
) {
  Object.assign(this.single)
}
```

Après la méthode `scrollToElement()` (ligne ~417), ajouter :

```typescript
downloadPdf(): void {
  if (!this.matAttribData?.length) return;
  const scores: PdfScores = {
    crit_1:     this.crit_1,
    crit_2:     this.crit_2,
    crit_3:     this.crit_3,
    crit_4:     this.crit_4,
    crit_5:     this.crit_5,
    eval_total: this.eval_total,
  };
  this.pdfService.generate(this.matAttribData[0], this.matPrediaLabel, scores);
}
```

- [ ] **Step 4 : Lancer les tests**

```bash
cd undptools && ng test --include='**/attribut/attribut.component.spec.ts' --watch=false
```

Attendu : les deux nouveaux tests passent.

- [ ] **Step 5 : Ajouter le bouton dans le template**

Dans `attribut.component.html`, repérer la fin du bloc `@if (data.length > 0)` de la section `#collapseExample2` (autour de la ligne 376). Remplacer :

```html
                        } @else {
                            <div class="text-center text-muted py-3">Aucune donnée enregistrée</div>
                        }
                    } @else {
                        <div class="text-center text-muted py-3">Aucune donnée enregistrée</div>
                    }
```

par :

```html
                        <div class="text-center mt-3 mb-2">
                            <button type="button" class="btn btn-danger btn-sm" (click)="downloadPdf()">
                                <i class="bi bi-file-earmark-pdf me-1"></i> Télécharger le rapport PDF
                            </button>
                        </div>
                        } @else {
                            <div class="text-center text-muted py-3">Aucune donnée enregistrée</div>
                        }
                    } @else {
                        <div class="text-center text-muted py-3">Aucune donnée enregistrée</div>
                    }
```

- [ ] **Step 6 : Vérifier la compilation**

```bash
cd undptools && ng build --configuration development 2>&1 | tail -30
```

Attendu : `Build at:` sans erreur TypeScript ni erreur de template.

- [ ] **Step 7 : Commit final**

```bash
git add undptools/src/app/consultant/components/tools/attribut/attribut.component.ts undptools/src/app/consultant/components/tools/attribut/attribut.component.html
git commit -m "feat(attribut): integrate PDF download button into AttributComponent"
```

---

## Self-Review

**Couverture spec :**
- ✅ En-tête avec logos `pnud.png` + `gyb.png` — `addHeader()`
- ✅ Titre avec nom d'entreprise en majuscules — `addHeader()`
- ✅ Date de génération dans en-tête et pied de page — `today`
- ✅ Section 1 — informations générales filtrées (valeurs vides exclues)
- ✅ Section 2 — 5 barres de progression colorées + score total encadré
- ✅ Seuils [0–2] rouge, [3–7] orange, [8–10] vert — `getColor()`
- ✅ Section 3 — tableau 19 attributs groupés par critère (dynamique depuis labels)
- ✅ Pied de page multi-page (Page X / Y, nom programme, date) — boucle `for`
- ✅ SSR-safe — `isPlatformBrowser` + `await import('jspdf')`
- ✅ Bouton conditionnel `data.length > 0` — template `@if`
- ✅ Nom de fichier sanitisé — `buildFilename()`
- ✅ Aucune nouvelle dépendance npm
