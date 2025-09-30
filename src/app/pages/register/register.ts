import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../shared/services/AuthService';
import { RegisterRequest } from '../../shared/models/register-request';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class RegisterComponent {  // ✅ cambio aquí
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly submitted = signal(false);

  protected readonly form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  protected onSubmit(): void {

    if (this.form.invalid) {
      console.warn('Formulario inválido');
      return;
    }
    const { name, email, password } = this.form.value;
    const request: RegisterRequest = {
      name: name ?? '',
      email: email ?? '',
      password: password ?? '',
    };

    this.authService.register(request).subscribe({
      next: (response) => { 
        if (response.status === 201 || response.status === 200) {
          this.submitted.set(true);
          Swal.fire({
            icon: 'success',
            title: 'Account created!',
            text: 'You can now log in.',
          }).then(() => this.router.navigate(['/login']));
        } else {
          console.warn('Unexpected status:', response.status);
          Swal.fire({
            icon: 'error',
            title: 'Unexpected response',
            text: `Server returned status ${response.status}`,
          });
        }
      },
      error: (err) => {
        console.error('Registration error:', err);
        Swal.fire({
          icon: 'error',
          title: 'Registration failed',
          text: 'Please check your data or try again later.',
        });
      },
    });
  }
}
