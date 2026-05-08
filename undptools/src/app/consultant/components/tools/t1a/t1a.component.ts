import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-t1a',
  standalone: true,
  imports: [],
  templateUrl: './t1a.component.html',
  styleUrl: './t1a.component.scss'
})
export class T1aComponent implements OnInit{

  toolName!:string;

  constructor(
    private route: ActivatedRoute,
  ){}

  ngOnInit(): void {
        this.toolName = this.route.snapshot.queryParams['toolName'];
  }

}
