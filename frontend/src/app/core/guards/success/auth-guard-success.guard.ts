import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { catchError, of, map } from 'rxjs';

export const authGuardSuccessGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.checkAuth().pipe(
    catchError(() => of(false)),
    map((response) => {
      if (response.status === 200) {
        return true;
      } else {
        router.navigate(['/']);
        return false;
      }
    })
  );
};
