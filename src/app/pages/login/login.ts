import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

import { swal } from '../../shared/utils/swal';
import { AuthService } from '../../shared/services/AuthService';
import { LoginRequest } from '../../shared/models/auth.model';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly form = this.fb.group({
    email: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  protected onSubmit(): void {
    if (this.form.invalid) return;

    const request = this.form.value as LoginRequest;

    this.authService.login(request).subscribe({
      next: (response) => {
        this.authService.saveToken(response);

        swal.success('Login successful!', 'Welcome back!')
          .then(() => this.router.navigate(['/boards']));
      },
      error: (err: unknown) => {
        console.error('Login error:', err);
        swal.error('Login failed', 'Please check your credentials.');
      },
    });
  }
}
