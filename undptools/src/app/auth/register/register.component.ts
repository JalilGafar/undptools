import { Component } from '@angular/core';
import { AuthService } from '../../_services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  form: any = {
    username: null,
    email: null,
    password: null,
    roles: 1
  };
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';

  constructor(private authService: AuthService) { }

    onSubmit(): void {
      
      
      let roleNumber = Number(this.form.roles)
      const { username, email, password, roles } = this.form;
    
    // console.log(roleNumber)
    this.authService.register(username, email, password, roleNumber).subscribe({
      next: data => {
        console.log(data);
        this.isSuccessful = true;
        this.isSignUpFailed = false;
      },
      error: err => {
        this.errorMessage = err.error.message;
        this.isSignUpFailed = true;
      }
    });
  }

}
