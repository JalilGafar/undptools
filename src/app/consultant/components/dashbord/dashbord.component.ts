import { Component, inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { ShareServiceService } from '../../../shared/share-service.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ConsultantService } from '../../consultant.service';
import { Company } from '../../../core/model/company';
import { switchMap, tap } from 'rxjs';
import { StorageService } from '../../../_services/storage.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashbord',
  standalone: true,
  imports: [
   // BaseChartDirective,
   CommonModule,
    RouterLink
],
  templateUrl: './dashbord.component.html',
  styleUrl: './dashbord.component.scss'
})
export class DashbordComponent implements OnInit {

  // @ViewChild(BaseChartDirective) chart: BaseChartDirective<'bar'> | undefined;

  // public barChartOptions: ChartConfiguration['options'] = {
  //   // We use these empty structures as placeholders for dynamic theming.
  //   scales: {
  //     x: {},
  //     y: {
  //       min: 10,
  //     },
  //   },
  //   responsive: true,
  //   plugins: {
  //     legend: {
  //       display: true,
  //     },
  //     title: {
  //       display: true,
  //       text: 'Evolution du Chiffre d\'Affair'
  //     }
  //   }
  // };

  // public barChartType = 'bar' as const;

  // public barChartData: ChartData<'bar'> = {
  //   labels: ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet'],
  //   datasets: [
  //     { data: [65, 59, 80, 81, 56, 55, 40], label: '2025' },
  //     { data: [28, 48, 40, 19, 86, 27, 90], label: '2026' },
  //   ],
  // };

  // public chartClicked({
  //   event,
  //   active,
  // }: {
  //   event?: ChartEvent;
  //   active?: object[];
  // }): void {
  //   console.log(event, active);
  // }

  // public chartHovered({
  //   event,
  //   active,
  // }: {
  //   event?: ChartEvent;
  //   active?: object[];
  // }): void {
  //   console.log(event, active);
  // }

  // public randomize(): void {
  //   // Only Change 3 values
  //   this.barChartData.datasets[0].data = [
  //     Math.round(Math.random() * 100),
  //     59,
  //     80,
  //     Math.round(Math.random() * 100),
  //     56,
  //     Math.round(Math.random() * 100),
  //     40,
  //   ];

  //   this.chart?.update();
  // }


  // // Radar
  // public radarChartOptions: ChartConfiguration['options'] = {
  //   plugins: {
  //     legend: {
  //       display: true,
  //     },
  //     title: {
  //       display: true,
  //       text: 'Diagnostique intégrale'
  //     }
  //   }
  // };
  // public radarChartLabels: string[] = [
  //   'Juridique et fiscale',
  //   'Leadership et Organisation',
  //   'Structuration de l\'entreprise',
  //   'Finance & Comptabilité',
  //   'Planification Stratégique',
  //   'Production et Opération',
  //   'Assurance Qualité',
  //   'Commercialisation',
  // ];

  // public radarChartData: ChartData<'radar'> = {
  //   labels: this.radarChartLabels,
  //   datasets: [
  //     { data: [80, 95, 40, 10, 56, 75, 40, 60], label: 'Moi 1' },
  //     { data: [80, 95, 70, 60, 30, 75, 70, 80], label: 'Moi 6' },
  //   ],
  // };

  // public radarChartType: ChartType = 'radar';


  // // events


  company!: Company



  constructor(
    private shareService: ShareServiceService,
    private ConsultantServices: ConsultantService,
    private storageService: StorageService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {

    // this.storageService.setVisibleToolsTrue();
    setTimeout(() => {
      this.storageService.setVisibleToolsTrue();
    });

    this.route.params.pipe(
      switchMap(params =>  this.ConsultantServices.getCompanyById(+params['id'])),
      tap(company => this.company = company),
      tap(company => this.storageService.setIdComp(company.id))
    ).subscribe();
  };

  // ngOnDestroy(): void {
  //   // this.storageService.setVisibleToolsFalse();
  // }

}
