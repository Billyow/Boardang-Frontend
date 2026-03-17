import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../shared/services/AuthService';
import { RegisterRequest } from '../../shared/models/auth.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterModule, JsonPipe],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
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
          }).then(() => this.router.navigate(['/']));
        } else {
          console.warn('Unexpected status:', response.status);
          Swal.fire({
            icon: 'error',
            title: 'Unexpected response',
            text: `Server returned status ${response.status}`,
          });
        }
      },
      error: (err: unknown) => {
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
