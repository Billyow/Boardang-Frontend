import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import Swal from 'sweetalert2';
import { AuthService } from '../../shared/services/AuthService';
import { LoginRequest } from '../../shared/models/login-request';
import { LoginResponse } from '../../shared/models/login-response';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly submitted = signal(false);

  protected readonly form = this.fb.group({
    email: ['', [Validators.required,]],
    password: ['', [Validators.required,]],
  });

  protected onSubmit(): void {
    if (this.form.invalid) return;

    const request: LoginRequest = this.form.value as LoginRequest;

    this.authService.login(request).subscribe({
      next: (response: LoginResponse) => {
        this.authService.saveToken(response);
        this.submitted.set(true);

        Swal.fire({
          icon: 'success',
          title: 'Login successful!',
          text: `Welcome back!`,
        }).then(() => this.router.navigate(['/']));
      },
      error: (err: any) => {
        console.error('Login error:', err);
        Swal.fire({
          icon: 'error',
          title: 'Login failed',
          text: 'Please check your credentials.',
        });
      }
    });
  }
}
