import { Component } from '@angular/core';

@Component({
  selector: 'app-documentaion',
  imports: [],
  templateUrl: './documentaion.component.html',
  styleUrl: './documentaion.component.scss'
})
export class DocumentaionComponent {

  goBack(): void {
    history.back();
  }

}
