import { Component, Input, OnInit,   ViewChild,  ElementRef,  AfterViewInit,  OnChanges, SimpleChanges } from '@angular/core';
import { Activity } from '../../../../core/model/activity';
import Gantt from 'frappe-gantt'; 
import { GanttTask } from '../../../../core/model/gantt-task.model';

@Component({
  selector: 'app-t1ea',
  standalone: true,
  imports: [],
  templateUrl: './t1ea.component.html',
  styleUrl: './t1ea.component.scss'
})
export class T1eaComponent implements AfterViewInit, OnChanges {

  @ViewChild('ganttContainer', { static: true })
  ganttContainer!: ElementRef;

  @Input() tasks: GanttTask[] = [];

  private gantt!: Gantt;

  ngAfterViewInit(): void {
    if (this.tasks.length) {
      this.renderGantt();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tasks'] && !changes['tasks'].firstChange) {
      this.renderGantt();
    }
  }

  renderGantt() {
    this.ganttContainer.nativeElement.innerHTML = '';

    this.gantt = new Gantt(this.ganttContainer.nativeElement, this.tasks, {
      view_mode: 'Week',
      date_format: 'YYYY-MM-DD',
      bar_height: 24,
      padding: 18,

      on_click: task => {
        console.log('Tâche cliquée :', task);
      },

      on_date_change: (task, start, end) => {
        console.log('Dates modifiées', task, start, end);
      },

      // custom_popup_html: (task: { name: any; start: any; end: any; progress: any; }) => {
      //   return `
      //     <div class="popup">
      //       <strong>${task.name}</strong><br/>
      //       Début : ${task.start}<br/>
      //       Fin : ${task.end}<br/>
      //       Avancement : ${task.progress || 0}%
      //     </div>
      //   `;
      // }
    });
  }

}
