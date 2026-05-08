import { Component, OnInit } from '@angular/core';
import { PrimengModule } from '../shared/primeng.module';
import { RouterLink } from '@angular/router';
import { UserService } from '../_services/user.service';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [RouterLink, PrimengModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

    content?: string;

    constructor(private userService: UserService) { }

    ngOnInit(): void {
        this.userService.getPublicContent().subscribe({
            next: data => {
                this.content = data;
            },
            error: err => {
                console.log(err)
                if (err.error) {
                    this.content = JSON.parse(err.error).message;
                } else {
                    this.content = "Error with status: " + err.status;
                }
            }
        });
    }
}
