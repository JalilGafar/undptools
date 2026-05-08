import { Component, Input, OnInit,   ViewChild,  ElementRef,  AfterViewInit,  OnChanges, SimpleChanges } from '@angular/core';
import { Activity } from '../../../../core/model/activity';
import Gantt from 'frappe-gantt'; 
import { GanttTask } from '../../../../core/model/gantt-task.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-t1ea',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './t1ea.component.html',
  styleUrl: './t1ea.component.scss'
})
export class T1eaComponent  {

  
}
