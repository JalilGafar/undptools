import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-t1b',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
],
  templateUrl: './t1b.component.html',
  styleUrl: './t1b.component.scss'
})
export class T1bComponent implements OnInit {

  toolName!:string;
  MeetForm!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
  ){}

  ngOnInit(): void {
        this.toolName = this.route.snapshot.queryParams['toolName'];

        this.MeetForm = this.formBuilder.group({
          etape: [null],
          date: [null],
          lieu: [null],
          objectif: [null],
          ordre: [null],
          resultats: [null],
          remarque: [null],
        })
  }

}
