import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { catchError, map, of } from 'rxjs';

export const authGuardNotFoundGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.checkAuth().pipe(
    map((response) => {
      if (response && response.data) {
        if (authService.getNeedsProfileCompletion()) {
          router.navigate(['/perfil'], { replaceUrl: true });
        } else {
          router.navigate(['/app/recs'], { replaceUrl: true });
        }
        return false;
      }
      return true; 
    }),
    catchError((error) => {
      if (error.status === 404) {
        return of(true); 
      }
      router.navigate(['/'], { replaceUrl: true }); 
      return of(false);
    })
  );
};