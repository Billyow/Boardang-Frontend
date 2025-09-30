import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators, NonNullableFormBuilder } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { UserService } from '../../shared/services/UserService';

@Component({
  selector: 'app-search-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './search-user.html',
  styleUrl: './search-user.scss',
})
export class SearchUserComponent {
  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly userService = inject(UserService);

  protected readonly form = this.fb.group({
    email: this.fb.control('', { validators: [Validators.required, ] }),
  });

  protected onNormalSearch(): void {
    if (this.form.invalid) {
      this.warnInvalid();
      return;
    }

    const email = this.form.controls.email.value.trim();
    this.userService.getUserByEmailA(email).subscribe({
      next: (user) => {
        Swal.fire({
          icon: 'info',
          title: 'User Found (Blue)',
          html: `<pre>${JSON.stringify(user, null, 2)}</pre>`,
        });
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'User Not Found',
          text: 'No user found via route A.',
        });
      },
    });
  }

  protected onCacheSearch(): void {
    if (this.form.invalid) {
      this.warnInvalid();
      return;
    }

    const email = this.form.controls.email.value.trim();
    this.userService.getUserByEmailC(email).subscribe({
      next: (user) => {
        Swal.fire({
          icon: 'info',
          title: 'User Found (Red)',
          html: `<pre>${JSON.stringify(user, null, 2)}</pre>`,
        });
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'User Not Found',
          text: 'No user found via route B.',
        });
      },
    });
  }

  private warnInvalid(): void {
    Swal.fire({
      icon: 'warning',
      title: 'Invalid email',
      text: 'Please enter a valid email address.',
    });
  }
}
