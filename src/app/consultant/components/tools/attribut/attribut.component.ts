import { CommonModule } from '@angular/common';
import { Component, OnInit, Signal, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ConsultantService } from '../../../consultant.service';
import { StorageService } from '../../../../_services/storage.service';
import { map, Observable, tap } from 'rxjs';
import { ToolAttrib } from '../../../../core/model/toolAttrib';
import { Color, LegendPosition, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { Router } from '@angular/router';
import { PrediaLabel } from '../../../../core/model/predia_mat_label';
import { PrediaLabelJSON } from '../../../../core/model/prediaJSON';
import { Child } from '../../../../core/model/child';

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
export class AttributComponent implements OnInit {

  showAlert: boolean = false;
  alertType: string = 'info'; // e.g., 'success', 'danger', 'warning'
  alertMessage: string = '';
  dismissible: boolean = true;

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
  noteControl = new FormControl(0); // valeur par défaut
  ticks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];        // graduations


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


  constructor(
    private formBuilder: FormBuilder,
    private toolService: ConsultantService,
    private storageService: StorageService,
    private appRout: Router
  ) {
    Object.assign(this.single)
  }

  ngOnInit(): void {
    this.matAttribForm = this.formBuilder.group({
      note_1: [0],
      comment_1: [null],
      note_2: [0],
      comment_2: [null],
      note_3: [0],
      comment_3: [null],
      note_4: [0],
      comment_4: [null],
      note_5: [0],
      comment_5: [null],
      note_6: [0],
      comment_6: [null],
      note_7: [0],
      comment_7: [null],
      note_8: [0],
      comment_8: [null],
      note_9: [0],
      comment_9: [null],
      note_10: [0],
      comment_10: [null],
      note_11: [0],
      comment_11: [null],
      note_12: [0],
      comment_12: [null],
      note_13: [0],
      comment_13: [null],
      cons_id: [null],
      comp_id: [null]
    });

    this.matAttribForm.patchValue({
      cons_id: this.storageService.getUser().id,
      comp_id: this.storageService.CompanyId
    }); 

    this.toolService.getAttribDataById(this.storageService.getUser().id, this.storageService.CompanyId);
    this.matAttribData$ = this.toolService.ToolAttribData$;

    // ******************get mat predia label 
    this.toolService.getMatPrediaLabel();
    this.matPrediaLabel$ = this.toolService.MatPrediaLabel$;
    this.toolService.MatPrediaLabel$.pipe(
      map(data => {
        data.forEach(element => {
         this.matPrediaLabel.push(this.parseChildren(element)) 
        
          // JSON.parse(element.children).forEach(e => { })
          // element.children = JSON.parse(element.children)
        });
      })
    ).subscribe()



    //***************Pondération des critères
    this.toolService.ToolAttribData$.pipe(
      tap(data => {
        this.matAttribData = data;
        if (this.matAttribData) {
          this.matAttribData.forEach(element => {
            this.crit_1 = (element.note_1 * 3) + (element.note_2 * 4) + (element.note_3 * 3);
            this.crit_2 = (element.note_4 * 3) + (element.note_5 * 3.5) + (element.note_6 * 3.5);
            this.crit_3 = (element.note_7 * 3) + (element.note_8 * 3) + (element.note_9 * 4);
            this.crit_4 = (element.note_10 * 5) + (element.note_11 * 5);
            this.crit_5 = (element.note_12 * 5) + (element.note_13 * 5);
            this.eval_total = ((this.crit_1 * 25) + (this.crit_2 * 20) + (this.crit_3 * 20) + (this.crit_4 * 25) + (this.crit_5 * 10)) / 100
            this.single[0].value = this.eval_total
          });

        }

      }),
    ).subscribe();

    ;

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
      critere: obj.critere,
      attribut: obj.attribut,
      children: childrenArray
    };
  }

  // 🔹 Navigation
  nextItem(): void {
    if (this.currentIndex < this.matPrediaLabel.length - 1) {
      this.currentIndex++;
    }
  }

  previousItem(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  // Optionnel : méthode pour aller à un élément spécifique
  goToItem(index: number): void {
    if (index >= 0 && index < this.matPrediaLabel.length) {
      this.currentIndex = index;
    }
  }


  saveTool() {
    this.toolService.saveToolAttrib(this.matAttribForm.value).subscribe();
    // this.appRout.navigateByUrl('consultant/tool/attribut');
    this.showAlertMessage()
    setTimeout(() => {
      window.location.reload();
    }, 2500);

  }

  logAll() {
    console.log(this.matAttribForm.value);
  }

  showAlertMessage(): void {
    this.alertMessage = 'Les informations que vous avez insérée ont été enregistrées';
    this.alertType = 'success';
    this.showAlert = true;
    this.dismissible = true;
  }
}
