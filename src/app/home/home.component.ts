import { Component } from '@angular/core';
import { PrimengModule } from '../shared/primeng.module';
import {RouterLink} from '@angular/router';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [RouterLink, PrimengModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent {

}
