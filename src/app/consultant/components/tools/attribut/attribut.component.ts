import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ConsultantService } from '../../../consultant.service';
import { StorageService } from '../../../../_services/storage.service';
import { map, Observable, Subject, takeUntil, tap } from 'rxjs';
import { ToolAttrib } from '../../../../core/model/toolAttrib';
import { Color, LegendPosition, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { Router } from '@angular/router';
import { PrediaLabel } from '../../../../core/model/predia_mat_label';
import { PrediaLabelJSON } from '../../../../core/model/prediaJSON';
import { Child } from '../../../../core/model/child';
import { AttribPdfService, PdfScores } from './attrib-pdf.service';

@Component({
  selector: 'app-attribut',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxChartsModule,

  ],
  templateUrl: './attribut.component.html',
  styleUrl: './attribut.component.scss'
})
export class AttributComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  @ViewChild('target') targetEl!: ElementRef<HTMLElement>;
  @ViewChild('confirmModal') confirmModalEl!: ElementRef;

  showAlert: boolean = false;
  alertType: string = 'info';
  alertMessage: string = '';
  isSaving: boolean = false;

  private modalInstance: any;

  consultanId!: number;
  userId!: number;

  OutputItem = {
    label: '',
    plage: ''
  };

  // ********* NGX CHART
  // single: any[];
  single = [
    {
      "name": "Germany",
      "value": 0
    }
  ];
  view: [number, number] = [400, 300];
  legend: boolean = false;
  texte: boolean = false;
  // legendPosition: LegendPosition = ;
  colorScheme: Color = {
    name: 'customScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7AA3E5', '#A8385B']
  };


  matAttribForm!: FormGroup;
  generalForm!: FormGroup;
  noteControl = new FormControl(0);
  private noteScale = [10, 7, 5, 0];

  ventesOptions = [
    { value: 'Moins de 1 million',        label: 'Moins de 1 million FCFA' },
    { value: 'Entre 1 et 2 millions',     label: 'Entre 1 et 2 millions de FCFA' },
    { value: 'Entre 2 et 3 millions',     label: 'Entre 2 et 3 millions de FCFA' },
    { value: 'Entre 4 et 6.5 millions',   label: 'Entre 4 et 6,5 millions de FCFA' },
    { value: 'Plus de 6.5 millions',      label: 'Plus de 6,5 millions de FCFA' },
  ];

  situationOptions = [
    { value: 'Projet principal long terme',  label: "Cette entreprise est mon projet principal et je prévois de la développer à long terme." },
    { value: 'Projet principal en évaluation', label: "Cette entreprise est mon projet principal, mais je suis encore en train d'évaluer son potentiel à long terme." },
    { value: 'Revenu secondaire',            label: "C'est une source de revenus secondaire, ce n'est pas ma priorité principale." },
    { value: 'Durée incertaine',             label: "Je ne suis pas certain(e) de la durée pendant laquelle je maintiendrai cette activité." },
  ];


  currentIndex: number = 0; //  index de l'attribut affiché
  visited = new Set<number>();

  matAttribData$!: Observable<ToolAttrib[]>;
  matAttribData!: ToolAttrib[];

  matPrediaLabel$!: Observable<PrediaLabelJSON[]>;
  matPrediaLabel: PrediaLabel[] = [];

  crit_1 = 0;
  crit_2 = 0;
  crit_3 = 0;
  crit_4 = 0;
  crit_5 = 0;
  eval_total = 0;

  gaugeCustomColors = [{ name: 'Score total', value: '#28a745' }];

  currentNoteValue: number | null = null;
  currentCommentValue: string | null = null;


  constructor(
    private formBuilder: FormBuilder,
    private toolService: ConsultantService,
    private storageService: StorageService,
    private appRout: Router,
    private pdfService: AttribPdfService
  ) {
    Object.assign(this.single)
  }

  ngOnInit(): void {
    this.matAttribForm = this.formBuilder.group({
      note_1: [null],
      comment_1: [null],
      note_2: [null],
      comment_2: [null],
      note_3: [null],
      comment_3: [null],
      note_4: [null],
      comment_4: [null],

      note_5: [null],
      comment_5: [null],
      note_6: [null],
      comment_6: [null],

      note_7: [null],
      comment_7: [null],
      note_8: [null],
      comment_8: [null],
      note_9: [null],
      comment_9: [null],

      note_10: [null],
      comment_10: [null],
      note_11: [null],
      comment_11: [null],
      note_12: [null],
      comment_12: [null],

      note_13: [null],
      comment_13: [null],
      note_14: [null],
      comment_14: [null],
      note_15: [null],
      comment_15: [null],
      note_16: [null],
      comment_16: [null],
      note_17: [null],
      comment_17: [null],
      note_18: [null],
      comment_18: [null],
      note_19: [null],
      comment_19: [null],

      cons_id: [null],
      comp_id: [null]
    });

    this.generalForm = this.formBuilder.group({
      gen_nom_prenom: [null],
      gen_sexe: [null],
      gen_age: [null],
      gen_telephone: [null],
      gen_adresse: [null],
      gen_ville: [null],
      gen_nom_entreprise: [null],
      gen_type_entreprise: [null],
      gen_email: [null],
      gen_activite_principale: [null],
      gen_activite_autre: [null],
      gen_ventes_mensuelles: [null],
      gen_role_entreprise: [null],
      gen_situation_entreprise: [null],
      gen_formation_interesse: [null],
    });

    this.consultanId = this.storageService.ConsultantId;
    this.userId = this.storageService.getUser().id;

    this.matAttribForm.patchValue({
      cons_id: this.storageService.getUser().id,
      comp_id: this.storageService.CompanyId
    });

/////Le but est de donner la possibilité au manager de visualier
/////les données d'un consultant empruntant son ID
    this.toolService.clearAttrib();
    if (this.consultanId == 0) {
      this.toolService.getAttribDataById(this.storageService.getUser().id, this.storageService.CompanyId);
    } else {
      this.toolService.getAttribDataById(this.consultanId, this.storageService.CompanyId);
    }

    this.matAttribData$ = this.toolService.ToolAttribData$;

    // Pré-remplir les deux formulaires si des données existent déjà
    this.toolService.ToolAttribData$.pipe(
      tap(data => {
        if (data.length > 0) {
          const d = data[0];
          this.matAttribForm.patchValue({
            note_1: this.mapToScale(d.note_1), comment_1: d.comment_1,
            note_2: this.mapToScale(d.note_2), comment_2: d.comment_2,
            note_3: this.mapToScale(d.note_3), comment_3: d.comment_3,
            note_4: this.mapToScale(d.note_4), comment_4: d.comment_4,
            note_5: this.mapToScale(d.note_5), comment_5: d.comment_5,
            note_6: this.mapToScale(d.note_6), comment_6: d.comment_6,
            note_7: this.mapToScale(d.note_7), comment_7: d.comment_7,
            note_8: this.mapToScale(d.note_8), comment_8: d.comment_8,
            note_9: this.mapToScale(d.note_9), comment_9: d.comment_9,
            note_10: this.mapToScale(d.note_10), comment_10: d.comment_10,
            note_11: this.mapToScale(d.note_11), comment_11: d.comment_11,
            note_12: this.mapToScale(d.note_12), comment_12: d.comment_12,
            note_13: this.mapToScale(d.note_13), comment_13: d.comment_13,
            note_14: this.mapToScale(d.note_14), comment_14: d.comment_14,
            note_15: this.mapToScale(d.note_15), comment_15: d.comment_15,
            note_16: this.mapToScale(d.note_16), comment_16: d.comment_16,
            note_17: this.mapToScale(d.note_17), comment_17: d.comment_17,
            note_18: this.mapToScale(d.note_18), comment_18: d.comment_18,
            note_19: this.mapToScale(d.note_19), comment_19: d.comment_19,
          });
          this.generalForm.patchValue({
            gen_nom_prenom: d.gen_nom_prenom,
            gen_sexe: d.gen_sexe,
            gen_age: d.gen_age,
            gen_telephone: d.gen_telephone,
            gen_adresse: d.gen_adresse,
            gen_ville: d.gen_ville,
            gen_nom_entreprise: d.gen_nom_entreprise,
            gen_type_entreprise: d.gen_type_entreprise,
            gen_email: d.gen_email,
            gen_activite_principale: d.gen_activite_principale,
            gen_activite_autre: d.gen_activite_autre,
            gen_ventes_mensuelles: d.gen_ventes_mensuelles,
            gen_role_entreprise: d.gen_role_entreprise,
            gen_situation_entreprise: d.gen_situation_entreprise,
            gen_formation_interesse: d.gen_formation_interesse,
          });
          this.updateCurrentNoteValue();
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();

    // ******************get mat predia label
    this.toolService.getMatPrediaLabel();
    this.matPrediaLabel$ = this.toolService.MatPrediaLabel$;
    this.toolService.MatPrediaLabel$.pipe(
      map(items =>
        items
          .slice()
          .sort((a, b) => a.reper - b.reper)
          .map(element => this.parseChildren(element))
      ),
      takeUntil(this.destroy$)
    ).subscribe(parsed => {
      this.matPrediaLabel = parsed;
      this.updateCurrentNoteValue();
    });

    //***************Pondération des critères
    this.toolService.ToolAttribData$.pipe(
      tap(data => {
        this.matAttribData = data;
        if (this.matAttribData) {
          this.matAttribData.forEach(element => {
            this.crit_1 = (element.note_1 * 3) + (element.note_2 * 2) + (element.note_3 * 3) + (element.note_4 * 2);
            this.crit_2 = (element.note_5 * 5) + (element.note_6 * 5);
            this.crit_3 = (element.note_7 * 3) + (element.note_8 * 3) + (element.note_9 * 4);
            this.crit_4 = (element.note_10 * 3) + (element.note_11 * 4) + (element.note_12 * 3);
            this.crit_5 = (element.note_13 * 2) + (element.note_14 * 2) + (element.note_15 * 2) + (element.note_16 * 1) + (element.note_17 * 1) + (element.note_18 * 1) + (element.note_19 * 1);
            this.eval_total = ((this.crit_1 * 25) + (this.crit_2 * 20) + (this.crit_3 * 20) + (this.crit_4 * 25) + (this.crit_5 * 10)) / 1000;
            this.single = [{ name: 'Score total', value: this.eval_total }];
            const color = this.eval_total <= 3 ? '#dc3545' : this.eval_total <= 7 ? '#28a745' : '#ffc107';
            this.gaugeCustomColors = [{ name: 'Score total', value: color }];
          });
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();

    this.matAttribForm.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => this.updateCurrentNoteValue());
  }

  onNoteChange(reper: number, value: number): void {
    this.matAttribForm.get('note_' + reper)?.setValue(value);
    this.currentNoteValue = value;
  }

  onCommentChange(reper: number, event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.matAttribForm.get('comment_' + reper)?.setValue(value);
  }

  private updateCurrentNoteValue(): void {
    const item = this.matPrediaLabel[this.currentIndex];
    if (item) {
      this.currentNoteValue = this.matAttribForm.get('note_' + item.reper)?.value ?? null;
      this.currentCommentValue = this.matAttribForm.get('comment_' + item.reper)?.value ?? null;
    }
  }

  mapToScale(value: number | null | undefined): number | null {
    if (value == null) return null;
    return this.noteScale.reduce((prev, curr) =>
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );
  }

  parseChildren(obj: PrediaLabelJSON): PrediaLabel {
    let childrenArray: Child[] = [];

    try {
      const parsed = JSON.parse(obj.children);

      if (Array.isArray(parsed)) {
        childrenArray = parsed.map((item: any) => ({
          label: String(item.label),
          plage: String(item.plage)
        }));
      } else {
        console.warn("Le champ 'children' n'est pas un tableau JSON valide.");
      }
    } catch (error) {
      console.error("Erreur lors du parsing de 'children' :", error);
    }

    return {
      reper: obj.reper,
      question: obj.question,
      critere: obj.critere,
      attribut: obj.attribut,
      children: childrenArray
    };
  }

  nextItem(): void {
    if (this.currentIndex < this.matPrediaLabel.length - 1) {
      this.currentIndex++;
      this.updateCurrentNoteValue();
    }
  }

  previousItem(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateCurrentNoteValue();
    }
  }

  goToItem(index: number): void {
    if (index >= 0 && index < this.matPrediaLabel.length) {
      this.currentIndex = index;
      this.updateCurrentNoteValue();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  openConfirmModal() {
    const bootstrap = (window as any)['bootstrap'];
    this.modalInstance = new bootstrap.Modal(this.confirmModalEl.nativeElement);
    this.modalInstance.show();
  }

  saveTool() {
    this.isSaving = true;
    const raw = this.matAttribForm.value;
    const nullsToZero: Record<string, number> = {};
    for (let i = 1; i <= 19; i++) {
      nullsToZero[`note_${i}`] = raw[`note_${i}`] ?? 0;
    }
    const payload = { ...raw, ...nullsToZero, ...this.generalForm.value };
    this.toolService.saveToolAttrib(payload).subscribe({
      next: () => {
        this.modalInstance?.hide();
        this.isSaving = false;
        this.showAlert = true;
        this.alertType = 'success';
        this.alertMessage = 'Les données ont été enregistrées avec succès.';
        // Rafraîchir les données sans recharger la page
        const id = this.storageService.ConsultantId === 0
          ? this.storageService.getUser().id
          : this.storageService.ConsultantId;
        this.toolService.getAttribDataById(id, this.storageService.CompanyId);
      },
      error: () => {
        this.modalInstance?.hide();
        this.isSaving = false;
        this.showAlert = true;
        this.alertType = 'danger';
        this.alertMessage = 'Une erreur est survenue. Veuillez réessayer.';
      }
    });
  }

  scrollToElement() {
    setTimeout(() => {
      this.targetEl?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 400);
  }

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

    this.pdfService.generate(this.matAttribData[0], this.matPrediaLabel, scores)
      .catch(() => {
        this.showAlert = true;
        this.alertType = 'danger';
        this.alertMessage = 'La génération du PDF a échoué. Veuillez réessayer.';
      });
  }

}
