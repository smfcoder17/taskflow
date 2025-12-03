import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase-service';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
  styles: [
    `
      .login-container {
        max-width: 400px;
        margin: 100px auto;
        padding: 20px;
      }

      form {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      input {
        padding: 10px;
        font-size: 16px;
      }

      button {
        padding: 10px;
        font-size: 16px;
        cursor: pointer;
      }

      .success-message {
        color: green;
      }

      .error {
        color: red;
      }
    `,
  ],
})
export class LoginPage {
  // FIX: Explicitly type `fb` as FormBuilder to resolve a type inference issue.
  private fb: FormBuilder = inject(FormBuilder);
  private router = inject(Router);
  loading = false;
  emailSent = false;
  error = '';
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  private supabase = inject(SupabaseService);

  async onSubmit(): Promise<void> {
    try {
      this.loading = true;
      this.error = '';

      const { error } = await this.supabase.signInWithMagicLink(
        this.loginForm.value.email as string
      );

      if (error) {
        this.error = error.message;
      } else {
        this.emailSent = true;
      }
    } catch (error: any) {
      this.error = error.message || 'An error occurred';
    } finally {
      this.loading = false;
    }
  }
}
