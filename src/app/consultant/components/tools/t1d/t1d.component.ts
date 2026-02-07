import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Color, NgxChartsModule, ScaleType, LegendPosition } from '@swimlane/ngx-charts';
import { map, Observable, tap } from 'rxjs';
import { ToolAttrib } from '../../../../core/model/toolAttrib';
import { Router } from '@angular/router';
import { StorageService } from '../../../../_services/storage.service';
import { ConsultantService } from '../../../consultant.service';
import { IntegLabel } from '../../../../core/model/mat_integ_label';
import { ToolMatDiagInteg } from '../../../../core/model/tool1D';
import { curveLinearClosed } from 'd3-shape';


@Component({
  selector: 'app-t1d',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxChartsModule,
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './t1d.component.html',
  styleUrl: './t1d.component.scss'
})
export class T1dComponent implements OnInit,  OnDestroy {

  showAlert: boolean = false;
  alertType: string = 'info'; // e.g., 'success', 'danger', 'warning'
  alertMessage: string = '';
  dismissible: boolean = true;

  consultanId!: number;
  userId!: number;


  // ********* NGX CHART
  // single: any[];
  single = [
    {
      "name": "Data",
      "series": [
        {
          "name": "siruattion juriqique",
          "value": 0
        },
        {
          "name": "Leadership et Climat Organisationnel",
          "value": 0
        },
        {
          "name": "Organisation de l'entreprise",
          "value": 0
        },
        {
          "name": "Finance et Comptabilité",
          "value": 0
        },
        {
          "name": "Planification Stratégique",
          "value": 0
        },
        {
          "name": "Production et Opération",
          "value": 0
        },
        {
          "name": "Assurance qualité",
          "value": 0
        },
        {
          "name": "Commercialisation",
          "value": 0
        }
      ]
    },
    {
      "name": "Déficient",
      "series": [
        {
          "name": "siruattion juriqique",
          "value": 40
        },
        {
          "name": "Leadership et Climat Organisationnel",
          "value": 40
        },
        {
          "name": "Organisation de l'entreprise",
          "value": 40
        },
        {
          "name": "Finance et Comptabilité",
          "value": 40
        },
        {
          "name": "Planification Stratégique",
          "value": 40
        },
        {
          "name": "Production et Opération",
          "value": 40
        },
        {
          "name": "Assurance qualité",
          "value": 40
        },
        {
          "name": "Commercialisation",
          "value": 40
        }
      ]
    },
    {
      "name": "A Améliorer",
      "series": [
        {
          "name": "siruattion juriqique",
          "value": 70
        },
        {
          "name": "Leadership et Climat Organisationnel",
          "value": 70
        },
        {
          "name": "Organisation de l'entreprise",
          "value": 70
        },
        {
          "name": "Finance et Comptabilité",
          "value": 70
        },
        {
          "name": "Planification Stratégique",
          "value": 70
        },
        {
          "name": "Production et Opération",
          "value": 70
        },
        {
          "name": "Assurance qualité",
          "value": 70
        },
        {
          "name": "Commercialisation",
          "value": 70
        }
      ]
    },
    {
      "name": "Suffisant",
      "series": [
        {
          "name": "siruattion juriqique",
          "value": 80
        },
        {
          "name": "Leadership et Climat Organisationnel",
          "value": 80
        },
        {
          "name": "Organisation de l'entreprise",
          "value": 80
        },
        {
          "name": "Finance et Comptabilité",
          "value": 80
        },
        {
          "name": "Planification Stratégique",
          "value": 80
        },
        {
          "name": "Production et Opération",
          "value": 80
        },
        {
          "name": "Assurance qualité",
          "value": 80
        },
        {
          "name": "Commercialisation",
          "value": 80
        }
      ]
    }
  ];

  // options
  legend: boolean = true;
  showLabels: boolean = false;
  animations: boolean = false;
  xAxis: boolean = true;
  yAxis: boolean = true;
  showYAxisLabel: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = 'Year';
  yAxisLabel: string = 'Population';
  roundDomains: boolean = true;
  legendPosition: LegendPosition = LegendPosition.Below;
  curveLinearClosed = curveLinearClosed;

  view: [number, number] = [400, 300];
  texte: boolean = false;
  // legendPosition: LegendPosition = ;
  colorScheme: Color = {
    name: 'customScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#000085ff', '#f73b3bff', '#ffd919ff', '#1e9908ff', '#A8385B']
  };


  matIntegForm!: FormGroup;
  noteControl = new FormControl(0); // valeur par défaut
  ticks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];        // graduations

  rawData = `[ 
    {plage: "0", label: "L'entreprise a moins de 3 employés"},
    {plage: "5", label: "L'entreprise a entre 5 et 3 employés"},
    {plage: "7",label: "L'entreprise a entre 10 et 5 employés"},
    {plage: "10",label: "L'entreprise a plus de 10 employés"}
  ]`;

  converted = '';


  ponderation = [
    {
      domaine: "Ressource opérationelles disponibles",
      libele: "Équipements et installations disponibles pour maintenir les opérations",
    },
    {
      domaine: "Marketing",
      libele: "Nombre d'employés",
    },
    {
      domaine: "Marketing",
      libele: "Nombre de veste",
    }

  ]

  currentIndex: number = 0; //  index de l'attribut affiché
  visited = new Set<number>();

  matDiagIntegData$!: Observable<ToolMatDiagInteg[]>;
  matDiagIntegData!: ToolMatDiagInteg[];

  matIntegLabel$!: Observable<IntegLabel[]>;
  matIntegLabel!: IntegLabel[];
  matIntegLength!: number;


  crit_1 = 0;
  crit_2 = 0;
  crit_3 = 0;
  crit_4 = 0;
  crit_5 = 0;
  crit_6 = 0;
  crit_7 = 0;
  crit_8 = 0;
  eval_total = 0;
Array: any;
private _: any;

  constructor(
    private formBuilder: FormBuilder,
    private toolService: ConsultantService,
    private storageService: StorageService,
    private appRout: Router
  ) {
    Object.assign(this.single)
  }

  ngOnInit(): void {
    this.matIntegForm = this.formBuilder.group({
      note_1: [0],
      comt_1: [null],
      note_2: [0],
      comt_2: [null],
      note_3: [0],
      comt_3: [null],
      note_4: [0],
      comt_4: [null],
      note_5: [0],
      comt_5: [null],
      note_6: [0],
      comt_6: [null],
      note_7: [0],
      comt_7: [null],
      note_8: [0],
      comt_8: [null],
      note_9: [0],
      comt_9: [null],
      note_10: [0],
      comt_10: [null],
      note_11: [0],
      comt_11: [null],
      note_12: [0],
      comt_12: [null],
      note_13: [0],
      comt_13: [null],
      note_14: [0],
      comt_14: [null],
      note_15: [0],
      comt_15: [null],
      note_16: [0],
      comt_16: [null],
      note_17: [0],
      comt_17: [null],
      note_18: [0],
      comt_18: [null],
      note_19: [0],
      comt_19: [null],
      note_20: [0],
      comt_20: [null],
      note_21: [0],
      comt_21: [null],
      note_22: [0],
      comt_22: [null],
      note_23: [0],
      comt_23: [null],
      note_24: [0],
      comt_24: [null],
      note_25: [0],
      comt_25: [null],
      note_26: [0],
      comt_26: [null],
      note_27: [0],
      comt_27: [null],
      note_28: [0],
      comt_28: [null],
      note_29: [0],
      comt_29: [null],
      note_30: [0],
      comt_30: [null],
      note_31: [0],
      comt_31: [null],
      note_32: [0],
      comt_32: [null],
      note_33: [0],
      comt_33: [null],
      note_34: [0],
      comt_34: [null],
      note_35: [0],
      comt_35: [null],
      note_36: [0],
      comt_36: [null],
      note_37: [0],
      comt_37: [null],
      note_38: [0],
      comt_38: [null],
      note_39: [0],
      comt_39: [null],
      note_40: [0],
      comt_40: [null],
      note_41: [0],
      comt_41: [null],
      note_42: [0],
      comt_42: [null],
      note_43: [0],
      comt_43: [null],
      note_44: [0],
      comt_44: [null],
      note_45: [0],
      comt_45: [null],
      note_46: [0],
      comt_46: [null],
      note_47: [0],
      comt_47: [null],
      note_48: [0],
      comt_48: [null],
      note_49: [0],
      comt_49: [null],
      note_50: [0],
      comt_50: [null],
      note_51: [0],
      comt_51: [null],
      note_52: [0],
      comt_52: [null],
      note_53: [0],
      comt_53: [null],
      note_54: [0],
      comt_54: [null],
      note_55: [0],
      comt_55: [null],
      note_56: [0],
      comt_56: [null],
      note_57: [0],
      comt_57: [null],
      note_58: [0],
      comt_58: [null],
      note_59: [0],
      comt_59: [null],
      note_60: [0],
      comt_60: [null],
      note_61: [0],
      comt_61: [null],
      note_62: [0],
      comt_62: [null],
      difficult_1: [null],
      difficult_2: [null],
      difficult_3: [null],
      force_1: [null],
      force_2: [null],
      force_3: [null],
      faiblesse_1: [null],
      faiblesse_2: [null],
      faiblesse_3: [null],
      besoin_1: [null],
      besoin_2: [null],
      besoin_3: [null],
      cons_id: [null],
      comp_id: [null]
    });

    this.consultanId = this.storageService.ConsultantId;
    this.userId = this.storageService.getUser().id

    this.matIntegForm.patchValue({
      cons_id: this.storageService.getUser().id,
      comp_id: this.storageService.CompanyId
    });

    if (this.consultanId == 0) {  
      this.toolService.getMatIntegDataById(this.storageService.getUser().id, this.storageService.CompanyId);
    } else {
      this.toolService.getMatIntegDataById(this.consultanId , this.storageService.CompanyId);
    }

    this.matDiagIntegData$ = this.toolService.ToolMatDiagIntegData$;

    //*****************Get mat Integ Label */
    this.toolService.getMatIntegLabel();
    this.matIntegLabel$ = this.toolService.MatIntegLabel$.pipe(
      tap(arr => {
        this.matIntegLabel = arr.sort((a, b) => a.reper - b.reper);
         this.matIntegLength = arr.length;
        //  console.log(arr);
         
      }),
      map(items => items.sort((a, b) => a.reper - b.reper))

    )

    


    // ************* SET note average ******************//
    this.toolService.ToolMatDiagIntegData$.pipe(
      tap(data => {
        this.matDiagIntegData = data;
        if (this.matDiagIntegData) {
          this.matDiagIntegData.forEach(element => {
            this.crit_1 = (element.note_1 + element.note_2 + element.note_3 + element.note_4) * 10 / 4;
            this.single[0].series[0].value = this.crit_1
            this.crit_2 = (element.note_5 + element.note_6 + element.note_7 + element.note_8 + element.note_9 + element.note_10 + element.note_11 + element.note_12) * 10 / 8;
            this.single[0].series[1].value = this.crit_2
            this.crit_3 = (element.note_13 + element.note_14 + element.note_15 + element.note_16 + element.note_17 + element.note_18 + element.note_19 + element.note_20) * 10 / 8;
            this.single[0].series[2].value = this.crit_3
            this.crit_4 = (element.note_21 + element.note_21 + element.note_23 + element.note_24 + element.note_25 + element.note_26 + element.note_27 + element.note_28) * 10 / 8;
            this.single[0].series[3].value = this.crit_4
            this.crit_5 = (element.note_29 + element.note_30 + element.note_31 + element.note_32 + element.note_33 + element.note_34 + element.note_35) * 10 / 7;
            this.single[0].series[4].value = this.crit_5
            this.crit_6 = (element.note_36 + element.note_37 + element.note_38 + element.note_39 + element.note_40 + element.note_41 + element.note_42 + element.note_43) * 10 / 8;
            this.single[0].series[5].value = this.crit_6
            this.crit_7 = (element.note_44 + element.note_45 + element.note_46 + element.note_47 + element.note_48 + element.note_49 + element.note_50 + element.note_51) * 10 / 8;
            this.single[0].series[6].value = this.crit_7
            this.crit_8 = (element.note_52 + element.note_53 + element.note_54 + element.note_55 + element.note_56 + element.note_57 + element.note_58 + element.note_59 + element.note_60 + element.note_61 + element.note_62) * 10 / 11;
            
            this.single[0].series[7].value = this.crit_8
            this.eval_total = ((this.crit_1 * 25) + (this.crit_2 * 20) + (this.crit_3 * 20) + (this.crit_4 * 25) + (this.crit_5 * 10)) / 100

            this.matIntegForm.patchValue({
              note_1: element.note_1,
              comt_1: element.comt_1,
              note_2: element.note_2,
              comt_2: element.comt_2,
              note_3: element.note_3,
              comt_3: element.comt_3,
              note_4: element.note_4,
              comt_4: element.comt_4,
              note_5: element.note_5,
              comt_5: element.comt_5,
              note_6: element.note_6,
              comt_6: element.comt_6,
              note_7: element.note_7,
              comt_7: element.comt_7,
              note_8: element.note_8,
              comt_8: element.comt_8,
              note_9: element.note_9,
              comt_9: element.comt_9,
              note_10: element.note_10,
              comt_10: element.comt_10,
              note_11: element.note_11,
              comt_11: element.comt_11,
              note_12: element.note_12,
              comt_12: element.comt_12,
              note_13: element.note_13,
              comt_13: element.comt_13,
              note_14: element.note_14,
              comt_14: element.comt_14,
              note_15: element.note_15,
              comt_15: element.comt_15,
              note_16: element.note_16,
              comt_16: element.comt_16,
              note_17: element.note_17,
              comt_17: element.comt_17,
              note_18: element.note_18,
              comt_18: element.comt_18,
              note_19: element.note_19,
              comt_19: element.comt_19,
              note_20: element.note_20,
              comt_20: element.comt_20,
              note_21: element.note_21,
              comt_21: element.comt_21,
              note_22: element.note_22,
              comt_22: element.comt_22,
              note_23: element.note_23,
              comt_23: element.comt_23,
              note_24: element.note_24,
              comt_24: element.comt_24,
              note_25: element.note_25,
              comt_25: element.comt_25,
              note_26: element.note_26,
              comt_26: element.comt_26,
              note_27: element.note_27,
              comt_27: element.comt_27,
              note_28: element.note_28,
              comt_28: element.comt_28,
              note_29: element.note_29,
              comt_29: element.comt_29,
              note_30: element.note_30,
              comt_30: element.comt_30,
              note_31: element.note_31,
              comt_31: element.comt_31,
              note_32: element.note_32,
              comt_32: element.comt_32,
              note_33: element.note_33,
              comt_33: element.comt_33,
              note_34: element.note_34,
              comt_34: element.comt_34,
              note_35: element.note_35,
              comt_35: element.comt_35,
              note_36: element.note_36,
              comt_36: element.comt_36,
              note_37: element.note_37,
              comt_37: element.comt_37,
              note_38: element.note_38,
              comt_38: element.comt_38,
              note_39: element.note_39,
              comt_39: element.comt_39,
              note_40: element.note_40,
              comt_40: element.comt_40,
              note_41: element.note_41,
              comt_41: element.comt_41,
              note_42: element.note_42,
              comt_42: element.comt_42,
              note_43: element.note_43,
              comt_43: element.comt_43,
              note_44: element.note_44,
              comt_44: element.comt_44,
              note_45: element.note_45,
              comt_45: element.comt_45,
              note_46: element.note_46,
              comt_46: element.comt_46,
              note_47: element.note_47,
              comt_47: element.comt_47,
              note_48: element.note_48,
              comt_48: element.comt_48,
              note_49: element.note_49,
              comt_49: element.comt_49,
              note_50: element.note_50,
              comt_50: element.comt_50,
              note_51: element.note_51,
              comt_51: element.comt_51,
              note_52: element.note_52,
              comt_52: element.comt_52,
              note_53: element.note_53,
              comt_53: element.comt_53,
              note_54: element.note_54,
              comt_54: element.comt_54,
              note_55: element.note_55,
              comt_55: element.comt_55,
              note_56: element.note_56,
              comt_56: element.comt_56,
              note_57: element.note_57,
              comt_57: element.comt_57,
              note_58: element.note_58,
              comt_58: element.comt_58,
              note_59: element.note_59,
              comt_59: element.comt_59,
              note_60: element.note_60,
              comt_60: element.comt_60,
              note_61: element.note_61,
              comt_61: element.comt_61,
              note_62: element.note_62,
              comt_62: element.comt_62,
              difficult_1: element.difficult_1,
              difficult_2: element.difficult_2,
              difficult_3: element.difficult_3,
              force_1: element.force_1,
              force_2: element.force_2,
              force_3: element.force_3,
              faiblesse_1: element.faiblesse_1,
              faiblesse_2: element.faiblesse_2,
              faiblesse_3: element.faiblesse_3,
              besoin_1: element.besoin_1,
              besoin_2: element.besoin_2,
              besoin_3: element.besoin_3,
              cons_id: element.cons_id,
              comp_id: element.comp_id

            })
          });

        }

      }),
    ).subscribe();

    this.convertJson()
  }

  ngOnDestroy() {
    this.storageService.setIdConsultant(0);
  }

  // getItemsStartingWith(a:string) { return this.matIntegLabel.filter(el => el.reper && el.reper.startsWith(a)); }
  getItemsStartingWith(a:number) { return this.matIntegLabel.filter(el => el.reper === a ); }
  

  //////CONVERT ARRAY TO MYSQL JSON DATA
  convertJson() {
    this.converted = this.toolService.transformToMysqlJsonString(this.rawData);
    // console.log(this.converted);
  }


  // 🔹 Navigation
  nextItem(): void {
    if (this.currentIndex < this.matIntegLength - 1) {
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
    if (index >= 0 && index < this.matIntegLength) {
      this.currentIndex = index;
    }
  }


  saveTool() {
    this.toolService.saveToolMatDiagInteg(this.matIntegForm.value).subscribe();
    // this.appRout.navigateByUrl('consultant/tool/attribut');
    this.showAlertMessage()
    setTimeout(() => {
      window.location.reload();
    }, 2500);

  }

  logAll() {
    // console.log(this.matIntegForm.value);
  }

  showAlertMessage(): void {
    this.alertMessage = 'Les informations que vous avez insérée ont été enregistrées';
    this.alertType = 'success';
    this.showAlert = true;
    this.dismissible = true;
  }

}
