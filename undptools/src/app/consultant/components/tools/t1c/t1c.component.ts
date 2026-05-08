import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import Gantt from 'frappe-gantt';
import { Activity } from '../../../../core/model/activity';
import { GanttTask } from '../../../../core/model/gantt-task.model';
import { ConsultantService } from '../../../consultant.service';
import { StorageService } from '../../../../_services/storage.service';
import { filter, Observable, tap } from 'rxjs';

@Component({
  selector: 'app-t1c',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './t1c.component.html',
  styleUrl: './t1c.component.scss'
})
export class T1cComponent implements OnInit, AfterViewInit, OnDestroy {

  activityForm!: FormGroup;
  activities: Activity[] = [];
  nextId = 1;
  //   tasks: GanttTask[] = [
  //   {
  //     id: '22',
  //     name: 'TASK 1',
  //     start: '2026-02-15',
  //     end: '2026-02-22',
  //     progress: 47,
  //     comments: 'Première activité',
  //     dependencies: '',
  //     responsable: '',
  //     close: '',
  //     details: '',
  //     status: '',
  //     cons_id: 0,
  //     comp_id: 0
  //   },
  //   {
  //     id: 't2',
  //     name: 'TASK 2',
  //     start: '2026-02-23',
  //     end: '2026-03-08',
  //     progress: 19.5,
  //     dependencies: '22',
  //     comments: 'Dépend de la task 1',
  //     responsable: '',
  //     close: '',
  //     details: '',
  //     status: '',
  //     cons_id: 0,
  //     comp_id: 0
  //   },
  // ];


  statuses = ['Planifié', 'En cours', 'Terminé'];
  gantt!: Gantt;
  consultanId!: number;
  userId!: number;

  activities$!: Observable<GanttTask[]>;
  allActivities!: GanttTask[];

  constructor(
    private fb: FormBuilder,
    private toolService: ConsultantService,
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.activityForm = this.fb.group({
      etape: [''],
      name: ['', Validators.required],
      details: ['', Validators.required],
      start: ['', Validators.required],
      end: ['', Validators.required],
      close: [''],
      responsable: ['', Validators.required],
      progress: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      status: ['', Validators.required],
      comments: [''],
      cons_id: [null],
      comp_id: [null]
    });

    this.consultanId = this.storageService.ConsultantId;
    this.userId = this.storageService.getUser().id

    this.activityForm.patchValue({
      cons_id: this.userId,
      comp_id: this.storageService.CompanyId
    });

    this.toolService.clearActivities();

    if (this.consultanId == 0) {
      this.toolService.getActivitiesById(this.storageService.getUser().id, this.storageService.CompanyId);
    } else {
      this.toolService.getActivitiesById(this.consultanId, this.storageService.CompanyId);
    }

    this.toolService.ToolActivities$.pipe(
      filter(data => Array.isArray(data) && data.length > 0),
      tap(data => {
        console.log(data)
        this.allActivities = data;
        if (this.gantt) {
          this.refreshGantt();
        } else {
          this.initGantt();
        }
      })
    ).subscribe();
  }

  ngAfterViewInit() {
    // this.initGantt(); // ✅ DOM prêt
  }

  ngOnDestroy() {
    this.destroyGantt();
  }

  openEditTaskDialog(task: Gantt.Task) {
    this.activityForm.patchValue(task);

    // afficher un modal (Bootstrap / Material / custom)
  }

  initGantt() {
    if (!this.allActivities || !this.allActivities.length) return;

    // sécurité anti double init
    this.destroyGantt();

    this.gantt = new Gantt('#gantt', this.allActivities, {
      auto_move_label: true,
      view_mode: 'Day',
      container_height: 450,
      view_mode_select: true,
      //************************************************ */
      //UPDATETOOL ACTIVITIES
      on_date_change: (task, start, end) => {
        this.toolService.updateActivities(task.id, {
          start,
          end,
          id: ''
        }).subscribe();
      },

      on_progress_change: (task, progress) => {
        this.toolService.updateActivities(task.id, {
          progress,
          id: ''
        }).subscribe();
      },
      on_click: (task) => {
        this.openEditTaskDialog(task);
      },
      /************************************************ */
      popup: (popup: any) => {
        const { task, set_subtitle, set_details } = popup;

        set_subtitle(`
          <strong>Avancement :</strong> ${task.progress}%<br>
          <strong>Début :</strong> ${task.start}<br>
          <strong>Date limite prévue :</strong> ${task.end}<br>
          <strong>Responsable :</strong> ${task.responsable}<br>
          <strong>Status :</strong> ${task.status}<br>
          <strong>date de fin :</strong> ${task.close}<br>
        `);

        set_details(`
          <div class="gantt-popup-comments">
            <strong>Détails</strong>
            <p>${task.details || '<em>Aucun Détail</em>'}</p><br>
            <strong>Remarques</strong>
            <p>${task.comments || '<em>Aucun commentaire</em>'}</p>
          </div>
        `);

        return '';
      },

      // on_view_change: (mode) => console.log(mode),
    });
  }

  destroyGantt() {
    const container = document.getElementById('gantt');
    if (container) {
      container.innerHTML = '';
    }
    this.gantt = undefined as any;
  }

  refreshGantt() {
    this.destroyGantt();
    this.initGantt();
  }


  addActivity() {
    if (this.activityForm.invalid) return;

    const form = this.activityForm.value;
    console.log(this.activityForm.value)
    const newTask: GanttTask = {
      id: crypto.randomUUID(),
      name: form.name,
      start: form.start,
      end: form.end,
      progress: form.progress,
      comments: form.comments,
      dependencies: '',
      responsable: form.responsable,
      close: form.close,
      details: form.details,
      status: form.status,
      cons_id: form.cons_id,
      comp_id: form.comp_id
    };

    this.toolService.saveActivities(this.activityForm.value).subscribe();
    // this.tasks.push(newTask);     // ✅ source unique
    // this.activityForm.reset({ progress: 0 });

    this.refreshGantt();          // ✅ mise à jour visuelle


  }

}
