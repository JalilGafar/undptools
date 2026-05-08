import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-t1c',
  standalone: true,
  imports: [],
  templateUrl: './t1c.component.html',
  styleUrl: './t1c.component.scss'
})
export class T1cComponent implements OnInit {

    toolName!:string;

  constructor(
    private route: ActivatedRoute,
  ){}

  ngOnInit(): void {
        this.toolName = this.route.snapshot.queryParams['toolName'];
  }

}
