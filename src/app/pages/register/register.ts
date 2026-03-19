import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../shared/services/AuthService';
import { RegisterRequest } from '../../shared/models/auth.model';
import { swal } from '../../shared/utils/swal';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly submitting = signal(false);

  protected readonly form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  protected onSubmit(): void {
    if (this.form.invalid) return;

    // Trigger collapse animation, then call API after it plays
    this.submitting.set(true);

    setTimeout(() => {
      const { name, email, password } = this.form.value;
      const request: RegisterRequest = {
        name: name ?? '',
        email: email ?? '',
        password: password ?? '',
      };

      this.authService.register(request).subscribe({
        next: (response) => {
          if (response.status === 201 || response.status === 200) {
            swal.success('Account created!', 'You can now log in.')
              .then(() => this.router.navigate(['/login']));
          } else {
            this.submitting.set(false);
            swal.error('Unexpected response', `Server returned status ${response.status}`);
          }
        },
        error: (err: unknown) => {
          console.error('Registration error:', err);
          this.submitting.set(false);
          swal.error('Registration failed', 'Please check your data or try again later.');
        },
      });
    }, 400); // let the collapse animation finish (450ms) before the alert fires
  }
}
