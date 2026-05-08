import { Component } from '@angular/core';
import { ManagertRoutingModule } from '../../../manager/manager-routing.module';

@Component({
  selector: 'app-man-header',
  standalone: true,
  imports: [
    ManagertRoutingModule
  ],
  templateUrl: './man-header.component.html',
  styleUrl: './man-header.component.scss'
})
export class ManHeaderComponent {

}
