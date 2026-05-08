import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-t1b',
  standalone: true,
  imports: [],
  templateUrl: './t1b.component.html',
  styleUrl: './t1b.component.scss'
})
export class T1bComponent implements OnInit {

    toolName!:string;

  constructor(
    private route: ActivatedRoute,
  ){}

  ngOnInit(): void {
        this.toolName = this.route.snapshot.queryParams['toolName'];
  }

}
