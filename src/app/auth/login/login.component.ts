import { Component, OnInit } from '@angular/core';
import { PrimengModule } from '../../shared/primeng.module';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    PrimengModule,
    ReactiveFormsModule, 
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  submitted = false;
  loading = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;

    // Arrêtez-vous si le formulaire est invalide
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    // Simulation d'une connexion réussie
    setTimeout(() => {
      // Ici, vous intégreriez normalement votre service d'authentification
      console.log('Connexion réussie', this.loginForm.value);
      this.loading = false;
      this.router.navigate(['/consultant']); // Redirection après connexion
    }, 1500);
  }

}
