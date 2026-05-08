import { Component } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';


@Component({
  selector: 'app-global',
  imports: [
    NgxChartsModule
  ],
  standalone: true,
  templateUrl: './global.component.html',
  styleUrl: './global.component.scss',
})
export class GlobalComponent {

 /* ====== BAR CHART ====== */
  barData = [
    { name: 'Homme', value: 33 },
    { name: 'Femme', value: 12 },
    { name: 'Total', value: 45 }
  ];

  /* ====== LINE CHART ====== */
  yScaleMin=0;
  lineData = [
    {
      name: '2024',
      series: [
        { name: 'Jan', value: 30 },
        { name: 'Feb', value: 50 },
        { name: 'Mar', value: 40 },
        { name: 'Apr', value: 60 },
        { name: 'May', value: 80 }
      ]
    }
  ];

  /* ====== PIE CHART ====== */
  pieData = [
    { name: 'Complet', value: 45 },
    { name: 'En cours', value: 35 },
    { name: 'En attente', value: 20 }
  ];

  /* ====== TABLE DATA ====== */
  tableData = [
    { project: 'Tralormat', status: 'Ongoing', progress: '65%' },
    { project: 'CABI', status: 'Completed', progress: '100%' },
    { project: 'Mango Go', status: 'Pending', progress: '20%' },
    { project: 'Agriculture Support', status: 'Ongoing', progress: '55%' }
  ];

  view: [number, number] = [400, 250];

}
