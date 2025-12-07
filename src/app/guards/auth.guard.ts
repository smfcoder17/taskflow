import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SupabaseService } from '../services/supabase-service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  // Wait for loading to finish, then check session
  return toObservable(supabase.isLoading).pipe(
    filter((isLoading) => !isLoading), // Wait until loading is done
    take(1), // Take only the first emission
    map(() => {
      const session = supabase.session();

      if (session) {
        console.log('✅ Auth guard: User authenticated:', session.user.email);
        return true;
      }

      console.log('❌ Auth guard: No session, redirecting to login');
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    })
  );
};
