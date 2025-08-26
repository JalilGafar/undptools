import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-entreprises',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './entreprises.component.html',
  styleUrl: './entreprises.component.scss'
})
export class EntreprisesComponent {

}
