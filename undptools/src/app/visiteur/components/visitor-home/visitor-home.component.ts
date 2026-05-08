import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-visitor-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './visitor-home.component.html',
  styleUrl: './visitor-home.component.scss'
})
export class VisitorHomeComponent implements OnInit{

  ngOnInit(): void {
    
  }

  menuOpen = false; currentYear = new Date().getFullYear();

}
